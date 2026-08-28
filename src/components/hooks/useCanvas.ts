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

export function useCanvas({ viewportWidth, viewportHeight, canvasWidth, canvasHeight, initialZoom = 1, minZoom = 0.1, maxZoom = 5,}: UseCanvasOptions) {

    const [zoom, setZoom] = useState(initialZoom);
    const [offset, setOffset] = useState<Point>({ x: 0, y: 0 });

    //viewport DOM
    const viewportRef = useRef<HTMLDivElement>(null);

    //Drag
    const isDraggingRef = useRef(false);                    //드래그 중인지 상태 여부
    const dragStartRef = useRef<Point>({ x: 0, y: 0 });     //드래그 시작할 때의 마우스 좌표값
    const offsetStartRef = useRef<Point>({ x: 0, y: 0 });   //드래그 시작할 때의 offset 좌표값
    
    //Mouse Move
    const handleWindowMouseMove = useCallback((e: MouseEvent) => {

        //마우스가 드래그 중이 아니면 return
        //우클릭 했을 때만 true
        if (!isDraggingRef.current) {
            return;
        }

        //마우스가 이동한 만큼의 값 추출
        const dx = e.clientX - dragStartRef.current.x;
        const dy = e.clientY - dragStartRef.current.y;

        //다음에 이미지가 그려질 x,y 좌표
        const nextX = offsetStartRef.current.x + dx;
        const nextY = offsetStartRef.current.y + dy;

        //현재 이미지가 zoom된 크기의 너비, 높이
        const scaledWidth = canvasWidth * zoom;
        const scaledHeight = canvasHeight * zoom;

        //이미지가 viewport를 넘어가지 않도록 min,max 좌표값 설정
        //x가 될 수 있는 최솟값은 -너비값
        //ex. width=5이면 x= -5, -5부터 0까지 그려짐
        //x가 될 수 있는 최댓값은 viewportWidth값
        const minX = -scaledWidth;
        const maxX = viewportWidth;
        const minY = -scaledHeight;
        const maxY = viewportHeight;

        //다음 x좌표 :  minX <= nextX <= x <= maxX
        const x = Math.min( Math.max(nextX, minX), maxX );
        const y = Math.min( Math.max(nextY, minY), maxY );

        //최종 좌표 설정
        setOffset({ x, y });

    }, [
        canvasWidth,
        canvasHeight,
        viewportWidth,
        viewportHeight,
        zoom,
    ]);

    //Mouse Up
    const handleWindowMouseUp = useCallback(() => {

        //드래그 중이 아니었으면 return
        if (!isDraggingRef.current) {
            return;
        }

        // 드래그 중이 아님으로 상태 변경
        isDraggingRef.current = false;

        //우클릭 중 실행되던 handleWindowMouseMove 이벤트 제거
        window.removeEventListener( "mousemove", handleWindowMouseMove );

    }, [ handleWindowMouseMove ]);

    //Mouse Down
    const handleMouseDown = useCallback(( e: React.MouseEvent ) => {

        // 우클릭만 이동
        if (e.button !== 2) {
            return;
        }

        //기본 mousedown 이벤트 비활성화
        e.preventDefault();

        //드래그 중이 맞음으로 상태 변경
        isDraggingRef.current = true;

        //드래그 시작한 마우스 좌표값 저장
        dragStartRef.current = { x: e.clientX, y: e.clientY };

        //드래그 시작할 때의 offset 좌표값
        offsetStartRef.current = { x: offset.x, y: offset.y };

        //드래그 중에 처리될 mousemove와 mouseup 이벤트리스너 추가
        window.addEventListener( "mousemove", handleWindowMouseMove );
        window.addEventListener( "mouseup", handleWindowMouseUp, {once : true}); //mouseup은 한 번만 발생 후 제거됨

    }, [ offset, handleWindowMouseMove, handleWindowMouseUp ]);

    //드래그 할 때 우클릭해도 context메뉴 뜨지 않음
    const handleContextMenu = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
    },[]);


    //Mouse Wheel
    const handleWheel = useCallback((e: WheelEvent) => {

        //viewport 외부의 window 스크롤 차단
        e.preventDefault();
        e.stopPropagation();

        //viewport Dom 받아옴
        const viewport = viewportRef.current;
        if (!viewport) return;
        const rect = viewport.getBoundingClientRect();

        //viewport 기준 마우스 좌표
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        //확대 or 축소 //휠값이 0보다 작으면 확대 0보다 크면 축소
        const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;

        //새로운 zoom값 계산
        setZoom(prevZoom => {

            //nextZoom은 이전 zoom값에 zoomFactor 곱한 것과 minZoom보다는 크고 maxZoom보다는 작아야 함
            //ex. prevZoom*zoomFactor = 0.8 * 1.1 = 0.88, minZoom=0.2, maxZoom = 5.0이면 nextZoom은 0.88
            //nextZoom은 변경 후의 절대 zoom값
            const nextZoom = Math.min( Math.max( prevZoom * zoomFactor, minZoom), maxZoom);

            //이번에 휠을 움직임으로써 얼마나 변했는지 상대적인 비율
            //ex. 현재 줌 2, 확대 후 줌 2.2, scale= 2.2 / 2 = 1.1
            const scale = nextZoom / prevZoom;

            //마우스 위치를 기준으로 줌
            //새로운 offset 좌표 계산
            setOffset(prevOffset => ({
                x: mouseX - ( mouseX - prevOffset.x ) * scale,
                y: mouseY - ( mouseY - prevOffset.y ) * scale,
            }));

            return nextZoom;

    });},[ minZoom, maxZoom ]);

    //Native Wheel Event
    useEffect(() => {

        //viewport Dom 받아옴
        const viewport = viewportRef.current;
        if (!viewport) return;

        //네이티브 이벤트 등록 //passive : false로 해야 preventDefault 가능
        viewport.addEventListener( "wheel", handleWheel, { passive: false });

        //handleWheel이 변경되면 wheel이벤트 제거
        return () => {
            viewport.removeEventListener( "wheel", handleWheel );
        };

    }, [ handleWheel ]);

    //일반적이지 않은 드래그 종료 시 이벤트 리스너 삭제
    useEffect(() => {
        return () => {
            window.removeEventListener( "mousemove", handleWindowMouseMove );
            window.removeEventListener( "mouseup", handleWindowMouseUp );
        };
    }, [ handleWindowMouseMove, handleWindowMouseUp ]);

    //transform
    const transform = `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`;

    //reset 버튼 클릭 시 실행
    //선택된 이미지가 변경될 시 실행
    const resetView = useCallback(() => {

        setZoom(initialZoom);
        setOffset({ x: 0, y: 0 });

    }, [ initialZoom ]);

    return {
        viewportRef,

        zoom,
        setZoom,

        offset,
        setOffset,

        transform,

        handleMouseDown,
        handleContextMenu,

        resetView,
    };
}