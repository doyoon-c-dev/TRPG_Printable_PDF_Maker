// components/canvas/CanvasEditor.tsx

import {
    useMemo, useEffect, useState
} from "react";

import {
    useCanvas,
} from "../../hooks/useCanvas";

import {
    ImageCanvas,
} from "./ImageCanvas";

import {
    GridCanvas,
} from "./GridCanvas";

import {
    GuideCanvas,
} from "./GuideCanvas";

import {
    splitPages,
} from "../../utils/canvas/splitPages";

import { useImageContext } from "@/components/hooks/useImageContext";
import { useCanvasContext } from "@/components/hooks/useCanvasContext";
import { DEFAULT_DPI, mmToPx, pxToMm } from "@/components/utils/canvas/unit";


export function CanvasEditor()
{
    
    const { selectedImage } = useImageContext();
    const { canvasSettings, setPages, isResizingGrid, setIsResizingGrid, setCanvasSettings } = useCanvasContext();

    const image = selectedImage?.image;
    
    const displaySize = useMemo(() => {
        if (!image) return { width: 0, height: 0 };

        return {
            width: image.naturalWidth * canvasSettings.scale * 0.01,
            height: image.naturalHeight * canvasSettings.scale * 0.01,
        };
    }, [image, canvasSettings.scale]);

    const viewportWidth = 700
    const viewportHeight = 700
    const [isDraggingGrid, setIsDraggingGrid] = useState(false);
    const [gridBox, setGridBox] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
    const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);


    //////////////////////////////
    const toPx = (value: number) => canvasSettings.isPx ? value :  mmToPx(value, DEFAULT_DPI);
    const marginTop = toPx(canvasSettings.marginTop);
    const marginBottom = toPx(canvasSettings.marginBottom);
    const marginLeft = toPx(canvasSettings.marginLeft);
    const marginRight = toPx(canvasSettings.marginRight);
    const gridSize = toPx(canvasSettings.gridSize);
    const paperWidth = toPx(canvasSettings.paperWidth);
    const paperHeight = toPx(canvasSettings.paperHeight);
    //////////////////////////////

    const printableWidth = paperWidth - marginRight - marginLeft;
    const printableHeight = paperHeight - marginTop - marginBottom;

    const minZoom = useMemo(() => {
        if (
            displaySize.width <= 0 ||
            displaySize.height <= 0
        ) {
            return 0.1;
        }

        const zoomX =
            viewportWidth / displaySize.width;

        const zoomY =
            viewportHeight / displaySize.height;

        return Math.min(zoomX, zoomY);
    }, [
        displaySize.width,
        displaySize.height,
        viewportWidth,
        viewportHeight,
    ]);

    const maxZoom = useMemo(() => {
        return minZoom * 3;
    }, [minZoom]);

    const initialZoom = useMemo(() => {
        if (!image) return 1;
        return minZoom;

    }, [image, minZoom])

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

    useEffect(() => {
        resetView();

    }, [image, displaySize.width, displaySize.height, resetView]);

    const getViewportPoint = (event: React.MouseEvent) => {
        const rect = event.currentTarget.getBoundingClientRect();

        return {
            x: Math.min(Math.max(event.clientX - rect.left, 0), viewportWidth),
            y: Math.min(Math.max(event.clientY - rect.top, 0), viewportHeight),
        };
    };

    const handleGridMouseDown = (event: React.MouseEvent) => {
        if (!isResizingGrid || event.button !== 0) return;

        event.preventDefault();
        event.stopPropagation();

        const point = getViewportPoint(event);
        setDragStart(point);
        setGridBox({ x: point.x, y: point.y, width: 0, height: 0 });
        setIsDraggingGrid(true);
    };

    const getSquareBox = (
        start: { x: number; y: number },
        end: { x: number; y: number }
    ) => {
        const directionX = end.x >= start.x ? 1 : -1;
        const directionY = end.y >= start.y ? 1 : -1;
        const requestedSize = Math.max(
            Math.abs(end.x - start.x),
            Math.abs(end.y - start.y)
        );
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

    const handleGridMouseMove = (event: React.MouseEvent) => {
        if (!isDraggingGrid || !dragStart) return;

        const point = getViewportPoint(event);
        setGridBox(getSquareBox(dragStart, point));
    };

    const handleGridMouseUp = (event: React.MouseEvent) => {
        if (!isDraggingGrid || !dragStart) return;

        const point = getViewportPoint(event);
        const squareBox = getSquareBox(dragStart, point);
        const selectedSize = squareBox.width / zoom;

        if (selectedSize > 0) {
            const gridSize = canvasSettings.isPx
                ? Math.round(selectedSize)
                : Math.round(pxToMm(selectedSize, DEFAULT_DPI)*10)/10;

            setCanvasSettings((previous) => ({ ...previous, gridSize }));
        }

        setIsDraggingGrid(false);
        setDragStart(null);
        setGridBox(null);
        setIsResizingGrid(false);
    };

    const pages = useMemo(() => {

        if(!image) return null;

            return splitPages({

            imageWidth: displaySize.width,
            imageHeight: displaySize.height,

            gridSize,

            printableWidth,
            printableHeight,

            isGrid: canvasSettings.isGrid,
        });

    }, [image, displaySize.width, displaySize.height, gridSize, printableWidth, printableHeight, canvasSettings.isGrid]);

    useEffect(() => {
        if(pages) setPages(pages);
    }, [pages, setPages]);

    return (
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
            { image && 
            <div
                style={{
                    position: "absolute",

                    left: 0,
                    top: 0,

                    width: displaySize.width,
                    height: displaySize.height,

                    transform,

                    transformOrigin: "0 0",
                }}
            >

                <ImageCanvas
                    width={displaySize.width}
                    height={displaySize.height}
                    image={image ? image : null}
                />
                {
                    canvasSettings.isGrid &&
                
                    <GridCanvas
                        width={displaySize.width}
                        height={displaySize.height}
                        gridSize={gridSize}
                        gridPenColor={canvasSettings.gridPenColor}
                        gridPenSize={canvasSettings.gridPenSize}
                    />
                }

                <GuideCanvas
                    width={displaySize.width}
                    height={displaySize.height}
                    gridPenSize={canvasSettings.gridPenSize}
                    pages={pages}
                />

            </div>
            }

            {isResizingGrid && gridBox && (
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

            <div
                style={{
                    position: "absolute",
                    right: 10,
                    bottom: 10,
                }}
            >
                {Math.round(zoom*canvasSettings.scale)}%
            </div>

            <button
                type="button"
                onClick={resetView}
            >
                Reset
            </button>

        </div>
    );
}