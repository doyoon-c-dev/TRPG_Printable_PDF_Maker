// components/canvas/GridCanvas.tsx

import {
    useEffect,
    useRef,
} from "react";

import {
    drawGrid
} from "@/components/utils/canvas/drawGrid";

interface GridCanvasProps {
    width: number;
    height: number;

    gridSize: number;
    gridPenColor: string;
    gridPenSize: number;
}

export function GridCanvas({
    width,
    height,
    gridSize,
    gridPenColor,
    gridPenSize
}: GridCanvasProps) {

    const canvasRef =
        useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas =
            canvasRef.current;

        if (!canvas) return;

        const ctx =
            canvas.getContext("2d");

        if (!ctx) return;

        ctx.clearRect(0, 0, width, height);

        drawGrid({
            ctx,
            width,
            height,
            gridSize,
            gridPenColor,
            gridPenSize
        });

    }, [
        width,
        height,
        gridSize,
        gridPenColor,
        gridPenSize
    ]);

    return (
        <canvas
            ref={canvasRef}
            width={width}
            height={height}
            style={{
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
            }}
        />
    );
}