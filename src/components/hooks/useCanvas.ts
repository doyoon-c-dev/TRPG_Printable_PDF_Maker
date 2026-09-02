import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

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

    const zoomAtPoint = useCallback((point: Point, nextZoom: number) => {
        const currentZoom = zoomRef.current;

        if (currentZoom <= 0) return;

        const localX = (point.x - offsetRef.current.x) / currentZoom;
        const localY = (point.y - offsetRef.current.y) / currentZoom;

        const nextOffset = {
            x: point.x - localX * nextZoom,
            y: point.y - localY * nextZoom,
        };

        zoomRef.current = nextZoom;
        offsetRef.current = nextOffset;
        setOffset(nextOffset);
        setZoom(nextZoom);
    }, []);

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

            if (previousDistance !== null && previousDistance > 0) {
                const rect = e.currentTarget.getBoundingClientRect();
                const centerX = (a.x + b.x) / 2 - rect.left;
                const centerY = (a.y + b.y) / 2 - rect.top;

                const scale = currentDistance / previousDistance;
                const currentZoom = zoomRef.current;
                const nextZoom = Math.min(Math.max(currentZoom * scale, minZoom), maxZoom);

                zoomAtPoint({ x: centerX, y: centerY }, nextZoom);
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

        offsetRef.current = { x, y };
        setOffset({ x, y });

    }, [canvasWidth, canvasHeight, viewportWidth, viewportHeight, minZoom, maxZoom,]);

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

        const rect = (e?.currentTarget as HTMLElement)?.getBoundingClientRect();
        if(!rect) return;

        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
        const currentZoom = zoomRef.current;
        const nextZoom = Math.min(Math.max(currentZoom * zoomFactor, minZoom), maxZoom);

        zoomAtPoint({ x: mouseX, y: mouseY }, nextZoom);
    }, [minZoom, maxZoom, zoomAtPoint]);



    useLayoutEffect(() => {
        const node = document.getElementById("canvas-container");
        if (!node) return;

        node.addEventListener('wheel', handleWheel, { passive: false });

        return () => {
            node.removeEventListener('wheel', handleWheel);
        };
    }, []);

    //transform
    const transform = `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`;

    //reset 버튼 클릭 시 실행
    //선택된 이미지가 변경될 시 실행
    const resetView = useCallback(() => {
        zoomRef.current = initialZoom;
        offsetRef.current = { x: 0, y: 0 };
        setZoom(initialZoom);
        setOffset({ x: 0, y: 0 });

    }, [initialZoom, setZoom, setOffset]);

    return {
        zoom,
        transform,

        handlePointerDown,
        handlePointerMove,
        handlePointerUp,
        handleContextMenu,
        //handleWheel,

        resetView,
    };
}