import { useEffect, useRef } from "react";
import { drawGrid } from "@/components/utils/canvas/drawGrid";

interface GridCanvasProps {
    width: number;
    height: number;

    gridSize: number;
    gridPenColor: string;
    gridPenSize: number;
    renderScale?: number; // 최대 해상도 제한 (픽셀 단위)
}

export function GridCanvas({ width, height, gridSize, gridPenColor, gridPenSize, renderScale=1 }: GridCanvasProps) {

    const canvasRef = useRef<HTMLCanvasElement>(null);

    const canvasWidth = Math.max(1, Math.round(width * renderScale));
    const canvasHeight = Math.max(1, Math.round(height * renderScale));

    useEffect(() => {
        const canvas = canvasRef.current;

        if (!canvas) return;

        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        //캔버스 초기화
        ctx.clearRect(0, 0, width, height);

        //그리드 그리기
        ctx.setTransform(renderScale, 0, 0, renderScale, 0, 0);
        drawGrid({ ctx, width, height, gridSize, gridPenColor, gridPenSize: gridPenSize * renderScale });

    }, [width, height, gridSize, gridPenColor, gridPenSize, renderScale]);

    return (
        <canvas
            ref={canvasRef}
            width={width}
            height={height}
            style={{
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
                width: `${width}px`,
                height: `${height}px`,
            }}
        />
    );
}