// components/canvas/GuideCanvas.tsx

import { useEffect, useRef } from "react";
import type { SplitPages } from "@/components/utils/canvas/splitPages";

interface GuideCanvasProps {
    width: number;
    height: number;
    gridPenSize: number;
    pages: SplitPages[] | null;
}

export function GuideCanvas({
    width,
    height,
    gridPenSize,
    pages,
}: GuideCanvasProps) {

    const canvasRef =
        useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;

        if (!canvas) return;

        const ctx = canvas.getContext("2d");

        if (!ctx) return;

        ctx.clearRect(
            0,
            0,
            width,
            height
        );

        if (!pages || pages.length <= 1) return;

        /*
         * 각 페이지의 오른쪽/아래쪽 경계
         */
        ctx.beginPath();

        for (const page of pages) {
            const right =
                page.sourceX +
                page.sourceWidth;

            const bottom =
                page.sourceY +
                page.sourceHeight;

            // 마지막 열이 아니라면 세로선
            if (right < width) {
                ctx.moveTo(right, 0);
                ctx.lineTo(right, height);
            }

            // 마지막 행이 아니라면 가로선
            if (bottom < height) {
                ctx.moveTo(0, bottom);
                ctx.lineTo(width, bottom);
            }
        }

        ctx.strokeStyle =
            "rgba(255, 0, 0, 0.8)";

        ctx.lineWidth = gridPenSize*2;

        ctx.stroke();

    }, [
        width,
        height,
        pages,
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