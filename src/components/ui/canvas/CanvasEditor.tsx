import { useMemo, useEffect, useState } from "react";
import { useCanvas } from "@/components/hooks/useCanvas";
import { ImageCanvas } from "@/components/ui/canvas/ImageCanvas";
import { GridCanvas } from "@/components/ui/canvas/GridCanvas";
import { GuideCanvas } from "@/components/ui/canvas/GuideCanvas";
import { splitPages } from "@/components/utils/canvas/splitPages";

import { useImageContext } from "@/components/hooks/useImageContext";
import { useCanvasContext } from "@/components/hooks/useCanvasContext";
import { DEFAULT_DPI, mmToPx } from "@/components/utils/canvas/unit";
import { Button } from "@chakra-ui/react";
import { useResizingGrid } from "@/components/hooks/useResizingGrid";


export function CanvasEditor() {

    const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });

    //context에서 가져오기
    const { selectedImage } = useImageContext();
    const { canvasSettings, setPages, isResizingGrid, setIsResizingGrid, setCanvasSettings } = useCanvasContext();

    //ImgData에서 image만 가져오기
    const image = selectedImage?.image;

    //scale 비율 (0~100 → 0.0~1.0)
    const scaleFactor = canvasSettings.scale * 0.01;

    //viewport 크기 감지
    useEffect(() => {
        if (!canvas.viewportRef.current) return;

        const observer = new ResizeObserver(([entry]) => {
            const { width, height } = entry.contentRect;

            setViewportSize({ width, height });
        });

        observer.observe(canvas.viewportRef.current);

        return () => observer.disconnect();
    }, []);

    //viewport에 표시될 크기 = 원본 × scale
    //useCanvas에 전달하여 뷰포트 패닝/줌 기준으로 사용
    const displaySize = useMemo(() => {
        if (!image) return { width: 0, height: 0 };

        return {
            width: image.naturalWidth * scaleFactor,
            height: image.naturalHeight * scaleFactor,
        };
    }, [image, scaleFactor]);


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

        const zoomX = viewportSize.width / displaySize.width;
        const zoomY = viewportSize.height / displaySize.height;

        return Math.min(zoomX, zoomY);
    }, [
        displaySize.width,
        displaySize.height,
        viewportSize.width,
        viewportSize.height,
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
    const canvas = useCanvas({
        viewportWidth: viewportSize.width,
        viewportHeight: viewportSize.height,

        canvasWidth: displaySize.width,
        canvasHeight: displaySize.height,

        initialZoom: initialZoom,
        minZoom: minZoom,
        maxZoom: maxZoom,
    });

    const resizingGrid = useResizingGrid({ viewportSize, zoom: canvas.zoom, isResizingGrid, currentGridSize: gridSize, isPx: canvasSettings.isPx, });

    //이미지나 이미지 스케일 변경 시 뷰포트 초기화
    useEffect(() => {
        canvas.resetView();
    }, [image, displaySize.width, displaySize.height, canvas.resetView]);

    //페이지 분할 (원본 좌표계 기준)
    //splitPages가 반환하는 page 좌표도 원본 기준이므로
    //makePdf.ts에서 별도 변환 없이 바로 사용 가능
    const pages = useMemo(() => {

        if (!image) return null;

        return splitPages({

            imageWidth: image.naturalWidth,
            imageHeight: image.naturalHeight,

            gridSize,

            printableWidth,
            printableHeight,

            isGrid: canvasSettings.isGrid,
        });

    }, [image, gridSize, printableWidth, printableHeight, canvasSettings.isGrid]);

    useEffect(() => {
        if (pages) setPages(pages);
    }, [pages, setPages]);

    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        if(e.pointerType === "touch"){
            if(isResizingGrid){
                resizingGrid.handleGridPointerDown(e);
                return;
            }
            else{
                canvas.handlePointerDown(e);
            }
        }

        if(e.button === 0 && isResizingGrid ){
            resizingGrid.handleGridPointerDown(e);
            return;
        }
        
        if(e.button === 2 || !isResizingGrid){
            canvas.handlePointerDown(e);
        }
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (isResizingGrid && (e.buttons === 0 || e.pointerType === "touch")) {
            resizingGrid.handleGridPointerMove(e);
            return;
        }
        else{
            canvas.handlePointerMove(e);
        }
    };

    const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
        if (isResizingGrid && (e.button === 0 || e.pointerType === "touch")) {
            resizingGrid.handleGridPointerUp(e);
            setIsResizingGrid(false);
            return;
        }
        else{
            canvas.handlePointerUp(e);
            setIsResizingGrid(false);
        }
        
    };

    useEffect(() => {
        setCanvasSettings((prev) => ({ ...prev, gridSize: resizingGrid.reSizedGridSize, }));
    }, [resizingGrid.reSizedGridSize]);

    return (
        //뷰포트
        <div
            ref={canvas.viewportRef}
            style={{
                position: "relative",
                zIndex: isResizingGrid ? 10001 : "auto",
                width: "100%",
                height: "100%",
                overflow: "hidden",
                background: "#e5e5e5",
                overscrollBehavior: "none",
                touchAction: "none",
            }}
            onPointerDown={handlePointerDown}
            onContextMenu={canvas.handleContextMenu}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
        >

            {image && //이미지가 있을 때만 렌더링
                <div
                    style={{
                        position: "absolute",

                        left: 0,
                        top: 0,

                        //useCanvas의 패닝/줌 transform 적용
                        transform: canvas.transform,

                        transformOrigin: "0 0",
                    }}
                >
                    {/* 캔버스들은 원본 크기로 그림
                        scale은 CSS transform으로 확대하여 표시 */}
                    <div
                        style={{
                            width: image.naturalWidth,
                            height: image.naturalHeight,
                            transform: `scale(${scaleFactor})`,
                            transformOrigin: "0 0",
                        }}
                    >

                        {/* 이미지 캔버스 */}
                        <ImageCanvas
                            width={image.naturalWidth}
                            height={image.naturalHeight}
                            image={image ? image : null}
                        />
                        {
                            canvasSettings.isGrid &&
                            //그리드가 있을 때만 렌더링
                            //그리드 캔버스
                            <GridCanvas
                                width={image.naturalWidth}
                                height={image.naturalHeight}
                                gridSize={gridSize}
                                gridPenColor={canvasSettings.gridPenColor}
                                gridPenSize={canvasSettings.gridPenSize / scaleFactor}
                            />
                        }

                        {/* 가이드 캔버스 */}
                        <GuideCanvas
                            width={image.naturalWidth}
                            height={image.naturalHeight}
                            gridPenSize={canvasSettings.gridPenSize / scaleFactor}
                            pages={pages}
                        />

                    </div>
                </div>
            }

            {isResizingGrid && resizingGrid.gridBox && (
                //그리드 크기 조절 중인 영역
                <div
                    style={{
                        position: "absolute",
                        left: resizingGrid.gridBox.x,
                        top: resizingGrid.gridBox.y,
                        width: resizingGrid.gridBox.width,
                        height: resizingGrid.gridBox.height,
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
                {Math.round(canvas.zoom * canvasSettings.scale)}%
            </div>

            {/* 리셋 버튼 */}
            <Button
                style={{
                    position: "absolute",
                    left: 10,
                    top: 10,
                }}
                borderRadius={10}
                onClick={canvas.resetView}
            >
                Reset
            </Button>

        </div>
    );
}