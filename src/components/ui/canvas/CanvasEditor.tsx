import { useMemo, useEffect, useState } from "react";
import { useCanvas } from "@/components/hooks/useCanvas";
import { ImageCanvas } from "@/components/ui/canvas/ImageCanvas";
import { GridCanvas } from "@/components/ui/canvas/GridCanvas";
import { GuideCanvas } from "@/components/ui/canvas/GuideCanvas";
import { splitPages } from "@/components/utils/canvas/splitPages";

import { useImageContext } from "@/components/hooks/useImageContext";
import { useCanvasContext } from "@/components/hooks/useCanvasContext";
import { DEFAULT_DPI, mmToPx, pxToMm } from "@/components/utils/canvas/unit";
import { Button } from "@chakra-ui/react";


export function CanvasEditor() {
    //context에서 가져오기
    const { selectedImage } = useImageContext();
    const { canvasSettings, setPages, isResizingGrid, setIsResizingGrid, setCanvasSettings } = useCanvasContext();

    //ImgData에서 image만 가져오기
    const image = selectedImage?.image;

    //scale 비율 (0~100 → 0.0~1.0)
    const scaleFactor = canvasSettings.scale * 0.01;

    //캔버스는 원본(naturalWidth/Height) 기준으로 그림
    //makePdf.ts와 동일하게 원본 좌표계를 사용
    const canvasSize = useMemo(() => {
        if (!image) return { width: 0, height: 0 };
        return {
            width: image.naturalWidth,
            height: image.naturalHeight,
        };
    }, [image]);

    //viewport에 표시될 크기 = 원본 × scale
    //useCanvas에 전달하여 뷰포트 패닝/줌 기준으로 사용
    const displaySize = useMemo(() => {
        return {
            width: canvasSize.width * scaleFactor,
            height: canvasSize.height * scaleFactor,
        };
    }, [canvasSize.width, canvasSize.height, scaleFactor]);

    //viewport 크기
    const viewportWidth = 700
    const viewportHeight = 700

    //gridSize 입력받을 때 드래그 상태
    const [isDraggingGrid, setIsDraggingGrid] = useState(false);
    const [gridBox, setGridBox] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
    const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);


    //단위 변환 (mm → px)
    const toPx = (value: number) => canvasSettings.isPx ? value : mmToPx(value, DEFAULT_DPI);

    //모든 설정값을 원본 좌표계(÷ scale)로 변환
    //makePdf.ts에서 page 좌표를 / (scale * 0.01) 하는 것과 동일한 원리
    const marginTop = toPx(canvasSettings.marginTop) / scaleFactor;
    const marginBottom = toPx(canvasSettings.marginBottom) / scaleFactor;
    const marginLeft = toPx(canvasSettings.marginLeft) / scaleFactor;
    const marginRight = toPx(canvasSettings.marginRight) / scaleFactor;
    const gridSize = toPx(canvasSettings.gridSize) / scaleFactor;
    const paperWidth = toPx(canvasSettings.paperWidth) / scaleFactor;
    const paperHeight = toPx(canvasSettings.paperHeight) / scaleFactor;

    //margin을 제외한 실제 이미지 표시 영역 (원본 좌표계)
    const printableWidth = paperWidth - marginRight - marginLeft;
    const printableHeight = paperHeight - marginTop - marginBottom;

    //최소 축소 배율
    //이미지가 viewport보다 완전히 작아질 수 없음
    //displaySize(scaled)를 기준으로 계산해야 뷰포트에 맞게 보임
    const minZoom = useMemo(() => {
        if (
            displaySize.width <= 0 ||
            displaySize.height <= 0
        ) {
            return 0.1;
        }

        const zoomX = viewportWidth / displaySize.width;
        const zoomY = viewportHeight / displaySize.height;

        return Math.min(zoomX, zoomY);
    }, [
        displaySize.width,
        displaySize.height,
        viewportWidth,
        viewportHeight,
    ]);

    //최대 확대 배율
    const maxZoom = useMemo(() => {
        return minZoom * 4;
    }, [minZoom]);

    //초기 확대 배율
    //초기에는 제일 작은 배율로 설정
    const initialZoom = useMemo(() => {
        if (!image) return 1;
        return minZoom;
    }, [image, minZoom])


    //useCanvas hook을 사용하여 뷰포트 관련 상태 및 함수 가져오기
    //canvasWidth/Height는 displaySize(scaled) 기준 → 패닝 범위 계산용
    const {
        viewportRef,
        transform,
        handleMouseDown,
        handleContextMenu,
        resetView,
        zoom,
    } = useCanvas({
        viewportWidth: viewportWidth,
        viewportHeight: viewportHeight,

        canvasWidth: displaySize.width,
        canvasHeight: displaySize.height,

        initialZoom: initialZoom,
        minZoom: minZoom,
        maxZoom: maxZoom,
    });

    //이미지나 이미지 스케일 변경 시 뷰포트 초기화
    useEffect(() => {
        resetView();
    }, [image, displaySize.width, displaySize.height, resetView]);

    //마우스 좌표를 뷰포트 좌표로 변환
    //뷰포트 밖의 좌표는 0과 viewportWidth, viewportHeight 사이로 제한
    //이 함수는 gridSize를 계산할 때 사용됨
    const getViewportPoint = (event: React.MouseEvent) => {
        const rect = event.currentTarget.getBoundingClientRect();

        return {
            x: Math.min(Math.max(event.clientX - rect.left, 0), viewportWidth),
            y: Math.min(Math.max(event.clientY - rect.top, 0), viewportHeight),
        };
    };

    //그리드 크기 조절 시작
    const handleGridMouseDown = (event: React.MouseEvent) => {
        if (!isResizingGrid || event.button !== 0) return;

        event.preventDefault();
        event.stopPropagation();

        const point = getViewportPoint(event);
        setDragStart(point);
        setGridBox({ x: point.x, y: point.y, width: 0, height: 0 });
        setIsDraggingGrid(true);
    };

    //grid는 정사각형이므로 x와 y 중 더 큰 값을 기준으로 크기를 계산
    const getSquareBox = (start: { x: number; y: number }, end: { x: number; y: number }) => {

        const directionX = end.x >= start.x ? 1 : -1;
        const directionY = end.y >= start.y ? 1 : -1;

        const requestedSize = Math.max(Math.abs(end.x - start.x), Math.abs(end.y - start.y));

        const availableWidth = directionX > 0 ? viewportWidth - start.x : start.x;
        const availableHeight = directionY > 0 ? viewportHeight - start.y : start.y;

        const size = Math.min(requestedSize, availableWidth, availableHeight);

        return {
            x: directionX > 0 ? start.x : start.x - size,
            y: directionY > 0 ? start.y : start.y - size,
            width: size,
            height: size,
        };
    };

    //그리드 크기 조절 중 마우스 이동
    const handleGridMouseMove = (event: React.MouseEvent) => {
        if (!isDraggingGrid || !dragStart) return;

        const point = getViewportPoint(event);
        setGridBox(getSquareBox(dragStart, point));
    };

    //그리드 크기 조절 중 마우스 버튼 떼기
    const handleGridMouseUp = (event: React.MouseEvent) => {
        if (!isDraggingGrid || !dragStart) return;

        const point = getViewportPoint(event);
        const squareBox = getSquareBox(dragStart, point);

        //드래그 크기를 원본 좌표계로 변환
        //zoom: 뷰포트 줌, scaleFactor: 이미지 scale
        //화면상 크기 → 원본 px = / (zoom * scaleFactor)
        const selectedSize = squareBox.width / (zoom * scaleFactor);

        if (selectedSize > 0) {
            const gridSize = canvasSettings.isPx
                ? Math.round(selectedSize)
                : Math.round(pxToMm(selectedSize, DEFAULT_DPI) * 10) / 10;

            setCanvasSettings((previous) => ({ ...previous, gridSize }));
        }

        setIsDraggingGrid(false);
        setDragStart(null);
        setGridBox(null);
        setIsResizingGrid(false);
    };

    //페이지 분할 (원본 좌표계 기준)
    //splitPages가 반환하는 page 좌표도 원본 기준이므로
    //makePdf.ts에서 별도 변환 없이 바로 사용 가능
    const pages = useMemo(() => {

        if (!image) return null;

        return splitPages({

            imageWidth: canvasSize.width,
            imageHeight: canvasSize.height,

            gridSize,

            printableWidth,
            printableHeight,

            isGrid: canvasSettings.isGrid,
        });

    }, [image, canvasSize.width, canvasSize.height, gridSize, printableWidth, printableHeight, canvasSettings.isGrid]);

    useEffect(() => {
        if (pages) setPages(pages);
    }, [pages, setPages]);

    return (
        //뷰포트
        <div
            ref={viewportRef}
            style={{
                position: "relative",
                zIndex: isResizingGrid ? 10001 : "auto",
                width: viewportWidth,
                height: viewportHeight,
                overflow: "hidden",
                background: "#e5e5e5",
                overscrollBehavior: "none",
                touchAction: "none",
            }}

            onMouseDown={handleMouseDown}
            onContextMenu={handleContextMenu}
            onMouseDownCapture={handleGridMouseDown}
            onMouseMove={handleGridMouseMove}
            onMouseUp={handleGridMouseUp}
        >

            {image && //이미지가 있을 때만 렌더링
                <div
                    style={{
                        position: "absolute",

                        left: 0,
                        top: 0,

                        //useCanvas의 패닝/줌 transform 적용
                        transform,

                        transformOrigin: "0 0",
                    }}
                >
                    {/* 캔버스들은 원본 크기로 그림
                        scale은 CSS transform으로 확대하여 표시 */}
                    <div
                        style={{
                            width: canvasSize.width,
                            height: canvasSize.height,
                            transform: `scale(${scaleFactor})`,
                            transformOrigin: "0 0",
                        }}
                    >

                        {/* 이미지 캔버스 */}
                        <ImageCanvas
                            width={canvasSize.width}
                            height={canvasSize.height}
                            image={image ? image : null}
                        />
                        {
                            canvasSettings.isGrid && //그리드가 있을 때만 렌더링
                            //그리드 캔버스
                            <GridCanvas
                                width={canvasSize.width}
                                height={canvasSize.height}
                                gridSize={gridSize}
                                gridPenColor={canvasSettings.gridPenColor}
                                gridPenSize={canvasSettings.gridPenSize / scaleFactor}
                            />
                        }

                        {/* 가이드 캔버스 */}
                        <GuideCanvas
                            width={canvasSize.width}
                            height={canvasSize.height}
                            gridPenSize={canvasSettings.gridPenSize / scaleFactor}
                            pages={pages}
                        />

                    </div>
                </div>
            }

            {isResizingGrid && gridBox && (
                //그리드 크기 조절 중인 영역
                <div
                    style={{
                        position: "absolute",
                        left: gridBox.x,
                        top: gridBox.y,
                        width: gridBox.width,
                        height: gridBox.height,
                        border: "2px solid #3182ce",
                        background: "rgba(49, 130, 206, 0.2)",
                        pointerEvents: "none",
                    }}
                />
            )}

            {/* 줌 레벨 표시 */}
            <div
                style={{
                    position: "absolute",
                    right: 10,
                    bottom: 10,
                }}
            >
                {Math.round(zoom * canvasSettings.scale)}%
            </div>

            {/* 리셋 버튼 */}
            <Button
                style={{
                    position: "absolute",
                    left: 10,
                    top: 10,
                }}
                borderRadius={10}
                onClick={resetView}
            >
                Reset
            </Button>

        </div>
    );
}