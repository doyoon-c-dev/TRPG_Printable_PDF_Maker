import { useCallback, useEffect, useRef, useState } from "react";

interface Point {
    x: number;
    y: number;
}

interface UseCanvasOptions {
    viewportWidth: number;
    viewportHeight: number;

    canvasWidth: number;
    canvasHeight: number;

    initialZoom?: number;
    minZoom?: number;
    maxZoom?: number;
}

export function useCanvas({ viewportWidth, viewportHeight, canvasWidth, canvasHeight, initialZoom = 1, minZoom = 0.1, maxZoom = 5, }: UseCanvasOptions) {

    const [zoom, setZoom] = useState(initialZoom);
    const [offset, setOffset] = useState<Point>({ x: 0, y: 0 });
    const zoomRef = useRef(initialZoom);
    const offsetRef = useRef<Point>({ x: 0, y: 0 });

    useEffect(() => {
        zoomRef.current = zoom;
    }, [zoom]);

    useEffect(() => {
        offsetRef.current = offset;
    }, [offset]);

    //viewport DOM
    const viewportRef = useRef<HTMLDivElement>(null);

    //Pan
    const isDraggingRef = useRef(false);                    //드래그 중인지 상태 여부
    const dragStartRef = useRef<Point>({ x: 0, y: 0 });     //드래그 시작할 때의 마우스 좌표값
    const offsetStartRef = useRef<Point>({ x: 0, y: 0 });   //드래그 시작할 때의 offset 좌표값

    //Pinch Zoom
    const pointersRef = useRef<Map<number, Point>>(new Map());
    const pinchDistanceRef = useRef<number | null>(null);

    const getPinchDistance = (a: Point, b: Point) => {
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        return Math.sqrt(dx * dx + dy * dy);
    };

    //Pointer Move
    const handlePointerMove = useCallback((e: React.PointerEvent<HTMLElement>) => {

        //mobile Pinch Zoom
        if (pointersRef.current.has(e.pointerId)) {
            pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
        }

        if (pointersRef.current.size === 2) {
            isDraggingRef.current = false;

            const points = [...pointersRef.current.values()];

            const [a, b] = points;
            const currentDistance = getPinchDistance(a, b);

            const previousDistance = pinchDistanceRef.current;

            if (previousDistance !== null) {
                const scale = currentDistance / previousDistance;

                const viewport = viewportRef.current;

                if (viewport) {

                    const rect = viewport.getBoundingClientRect();

                    // 두 손가락의 중심점
                    const centerX = (a.x + b.x) / 2 - rect.left;
                    const centerY = (a.y + b.y) / 2 - rect.top;

                    setZoom(prevZoom => {

                        const nextZoom = Math.min(Math.max(prevZoom * scale, minZoom), maxZoom);
                        const actualScale = nextZoom / prevZoom;

                        // 손가락 중심을 기준으로 확대/축소
                        setOffset(prevOffset => ({
                            x: centerX - (centerX - prevOffset.x) * actualScale,
                            y: centerY - (centerY - prevOffset.y) * actualScale,
                        }));

                        return nextZoom;
                    });
                }
            }

            pinchDistanceRef.current = currentDistance;

            return;
        }

        //기존 캔버스 이동
        if (!isDraggingRef.current) return;

        const dx = e.clientX - dragStartRef.current.x;
        const dy = e.clientY - dragStartRef.current.y;

        const nextX = offsetStartRef.current.x + dx;
        const nextY = offsetStartRef.current.y + dy;


        const currentZoom = zoomRef.current;
        const scaledWidth = canvasWidth * currentZoom;
        const scaledHeight = canvasHeight * currentZoom;


        const minX = -scaledWidth;
        const maxX = viewportWidth;

        const minY = -scaledHeight;
        const maxY = viewportHeight;


        const x = Math.min(Math.max(nextX, minX), maxX);
        const y = Math.min(Math.max(nextY, minY), maxY);


        setOffset({ x, y });

    }, [canvasWidth, canvasHeight, viewportWidth, viewportHeight, zoom, minZoom, maxZoom,]);

    //Pointer Up
    const handlePointerUp = useCallback((e?: React.PointerEvent<HTMLElement>) => {

        if (e) pointersRef.current.delete(e.pointerId);

        // 손가락이 하나도 없으면 pinch 종료
        if (pointersRef.current.size < 2) pinchDistanceRef.current = null;
        if (!isDraggingRef.current) return;

        isDraggingRef.current = false;

    }, []);

    //Pointer Down
    const handlePointerDown = useCallback((e: React.PointerEvent<HTMLElement>) => {

        if(e.pointerType !== "touch" &&  e.pointerType !== "mouse") return;
        
        // Mobile Touch
        if (e.pointerType === "touch") {
            isDraggingRef.current = true;
            pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
            dragStartRef.current = { x: e.clientX, y: e.clientY };
            offsetStartRef.current = { x: offsetRef.current.x, y: offsetRef.current.y };

            // 두 번째 손가락
            if (pointersRef.current.size === 2) {
                isDraggingRef.current = false;
                const points = [...pointersRef.current.values()];
                pinchDistanceRef.current = getPinchDistance(points[0], points[1]);
            }
            e.preventDefault();
            return;
        }

        // PC drag pan: left click or right click
        if (e.pointerType === "mouse" && (e.button === 0 || e.button === 2)) {
            e.preventDefault();

            isDraggingRef.current = true;
            dragStartRef.current = { x: e.clientX, y: e.clientY };
            offsetStartRef.current = { x: offsetRef.current.x, y: offsetRef.current.y };
            
            return;
        }

    }, []);

    //드래그 할 때 우클릭해도 context메뉴 뜨지 않음
    const handleContextMenu = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
    }, []);


    //Mouse Wheel
    const handleWheel = useCallback((e: WheelEvent) => {

        e.preventDefault();
        e.stopPropagation();

        const viewport = viewportRef.current;

        if (!viewport) return;

        const rect = viewport.getBoundingClientRect();

        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;

        setZoom(prevZoom => {

            const nextZoom = Math.min(Math.max(prevZoom * zoomFactor, minZoom), maxZoom);

            const scale = nextZoom / prevZoom;


            setOffset(prevOffset => ({
                x: mouseX - (mouseX - prevOffset.x) * scale,
                y: mouseY - (mouseY - prevOffset.y) * scale,
            }));


            return nextZoom;
        });

    }, [minZoom, maxZoom]);

    //Native Wheel Event
    useEffect(() => {

        //viewport Dom 받아옴
        const viewport = viewportRef.current;
        if (!viewport) return;

        //네이티브 이벤트 등록 //passive : false로 해야 preventDefault 가능
        viewport.addEventListener("wheel", handleWheel, { passive: false });

        //handleWheel이 변경되면 wheel이벤트 제거
        return () => {
            viewport.removeEventListener("wheel", handleWheel);
        };

    }, [handleWheel]);

    //transform
    const transform = `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`;

    //reset 버튼 클릭 시 실행
    //선택된 이미지가 변경될 시 실행
    const resetView = useCallback(() => {

        zoomRef.current = initialZoom;
        offsetRef.current = { x: 0, y: 0 };
        setZoom(initialZoom);
        setOffset({ x: 0, y: 0 });

    }, [initialZoom]);

    return {
        viewportRef,

        zoom,
        setZoom,

        transform,

        handlePointerDown,
        handlePointerMove,
        handlePointerUp,
        handleContextMenu,

        resetView,
    };
}