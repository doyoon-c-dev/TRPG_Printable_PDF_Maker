import { useEffect, useRef } from "react";

interface ImageCanvasProps {
    width: number;
    height: number;
    image: HTMLImageElement | null;
    renderScale?: number; // 최대 해상도 제한 (픽셀 단위)
}

export function ImageCanvas({ width, height, image, renderScale=1 }: ImageCanvasProps) {

    const canvasRef = useRef<HTMLCanvasElement>(null);

    const canvasWidth = Math.max(1, Math.round(width * renderScale));
    const canvasHeight = Math.max(1, Math.round(height * renderScale));

     useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.setTransform(renderScale, 0, 0, renderScale, 0, 0);
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        if (!image) return;

        ctx.drawImage(image, 0, 0, width, height);
    }, [image, width, height]);

    return (
        <canvas
            ref={canvasRef}
            width={canvasWidth}
            height={canvasHeight}
            style={{
                position: "absolute",
                inset: 0,
                width: `${width}px`,
                height: `${height}px`,
                pointerEvents: "none",
            }}
        />
    );
}