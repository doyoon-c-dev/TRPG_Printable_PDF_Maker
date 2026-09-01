import { useCallback, useState } from "react";
import { DEFAULT_DPI, pxToMm } from "../utils/canvas/unit";

interface Point {
    x: number;
    y: number;
}

interface GridBox {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface UseResizingGridOptions {
    viewportSize: { width: number, height: number };
    zoom: number;
    isResizingGrid: boolean;
    currentGridSize: number;
    isPx: boolean;
}

export const useResizingGrid = ({ viewportSize, zoom, isResizingGrid, currentGridSize, isPx }: UseResizingGridOptions) => {

    const [isDraggingGrid, setIsDraggingGrid] = useState(false);
    const [dragStart, setDragStart] = useState<Point | null>(null);
    const [gridBox, setGridBox] = useState<GridBox | null>(null);
    const [reSizedGridSize, setReSizedGridSize] = useState(currentGridSize);


    //마우스 좌표를 뷰포트 좌표로 변환
    //뷰포트 밖의 좌표는 0과 viewportWidth, viewportHeight 사이로 제한
    //이 함수는 gridSize를 계산할 때 사용됨
    const getViewportPoint = (event: React.PointerEvent) => {
        const rect = event.currentTarget.getBoundingClientRect();

        return {
            x: Math.min(Math.max(event.clientX - rect.left, 0), viewportSize.width),
            y: Math.min(Math.max(event.clientY - rect.top, 0), viewportSize.height),
        };
    };

    // 정사각형 Grid 영역 계산
    const getSquareBox = useCallback((start: Point, end: Point): GridBox => {

        const directionX = end.x >= start.x ? 1 : -1;
        const directionY = end.y >= start.y ? 1 : -1;

        const requestedSize = Math.max(Math.abs(end.x - start.x), Math.abs(end.y - start.y));

        const availableWidth = directionX > 0 ? viewportSize.width - start.x : start.x;

        const availableHeight = directionY > 0 ? viewportSize.height - start.y : start.y;

        const size = Math.min(requestedSize, availableWidth, availableHeight);

        return {
            x: directionX > 0 ? start.x : start.x - size,
            y: directionY > 0 ? start.y : start.y - size,
            width: size,
            height: size,
        };
    }, [viewportSize]);

    // Grid 지정 시작
    const handleGridPointerDown = useCallback((event: React.PointerEvent) => {

        // Grid 모드가 아니면 실행하지 않음
        if (!isResizingGrid) return;

        // PC에서는 좌클릭만
        if (event.pointerType === "mouse" && event.button !== 0) return;


        event.preventDefault();
        event.stopPropagation();


        const point = getViewportPoint(event);
        setDragStart(point);
        setGridBox({ x: point.x, y: point.y, width: 0, height: 0 });
        setIsDraggingGrid(true);


        // 모바일에서 pointer가 Canvas 밖으로 나가도
        // 계속 pointer 이벤트를 받을 수 있도록 함
        event.currentTarget.setPointerCapture(event.pointerId);
    }, [isResizingGrid, getViewportPoint]);


    // Grid 지정 중
    const handleGridPointerMove = useCallback((event: React.PointerEvent) => {

        if (!isResizingGrid || !isDraggingGrid || !dragStart) return;

        const point = getViewportPoint(event);
        const squareBox = getSquareBox(dragStart, point);


        setGridBox(squareBox);
    }, [isResizingGrid, isDraggingGrid, dragStart, getViewportPoint, getSquareBox]);


    // Grid 지정 종료
    const handleGridPointerUp = useCallback((event: React.PointerEvent) => {

        if (!isDraggingGrid || !dragStart) return;

        const point = getViewportPoint(event);

        const squareBox = getSquareBox(dragStart, point);


        // viewport 좌표
        // ↓
        // zoom 이전 Canvas 좌표
        const selectedSize = squareBox.width / zoom;


        if (selectedSize > 0) {
            const gridSize = isPx
                ? Math.round(selectedSize)
                : Math.round(pxToMm(selectedSize, DEFAULT_DPI) * 10) / 10;
            setReSizedGridSize(gridSize);
        }

        setIsDraggingGrid(false);
        setDragStart(null);
        setGridBox(null);


        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
        }
    }, [isDraggingGrid, dragStart, getViewportPoint, getSquareBox, zoom, isPx, setReSizedGridSize]);


    // Grid 지정 취소
    const cancelGridResize = useCallback(() => {
        setIsDraggingGrid(false);
        setDragStart(null);
        setGridBox(null);
    }, []);

    return {
        isDraggingGrid,
        dragStart,
        gridBox,
        handleGridPointerDown,
        handleGridPointerMove,
        handleGridPointerUp,
        cancelGridResize,
        reSizedGridSize
    };
}