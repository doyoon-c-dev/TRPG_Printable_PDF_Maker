import { useEffect, useRef } from "react";
import type { SplitPages } from "@/components/utils/canvas/splitPages";

interface GuideCanvasProps {
    width: number;
    height: number;
    gridPenSize: number;
    pages: SplitPages[] | null;
    renderScale?: number; // 최대 해상도 제한 (픽셀 단위)
}

export function GuideCanvas({ width, height, gridPenSize, pages, renderScale=1 }: GuideCanvasProps) {

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

        ctx.clearRect(0, 0, width, height);
        ctx.setTransform(renderScale, 0, 0, renderScale, 0, 0);

        if (!pages || pages.length <= 1) return;

        //각 페이지의 오른쪽/아래쪽 경계
        ctx.beginPath();

        for (const page of pages) {
            const right = page.sourceX + page.sourceWidth;
            const bottom = page.sourceY + page.sourceHeight;

            //마지막 열이 아니라면 세로선을 그림
            if (right < width) {
                ctx.moveTo(right, 0);
                ctx.lineTo(right, height);
            }

            //마지막 행이 아니라면 가로선을 그림
            if (bottom < height) {
                ctx.moveTo(0, bottom);
                ctx.lineTo(width, bottom);
            }
        }

        ctx.strokeStyle = "rgba(255, 0, 0, 0.8)";
        ctx.lineWidth = gridPenSize * 2 * renderScale;
        ctx.stroke();

    }, [width, height, pages, gridPenSize]);

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