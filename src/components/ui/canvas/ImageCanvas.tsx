// components/canvas/ImageCanvas.tsx

import {
    useEffect,
    useRef,
} from "react";

interface ImageCanvasProps {
    width: number;
    height: number;
    image: HTMLImageElement | null;
}

export function ImageCanvas({
    width,
    height,
    image,
}: ImageCanvasProps) {

    const canvasRef =
        useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas =
            canvasRef.current;

        if (!canvas) return;

        const ctx =
            canvas.getContext("2d");

        if (!ctx) return;

        ctx.clearRect(
            0,
            0,
            width,
            height
        );

        if (!image) return;

        ctx.drawImage( image, 0, 0, width, height );

    }, [
        image,
        width,
        height,
    ]);

    return (
        <canvas
            ref={canvasRef}
            width={width}
            height={height}
            style={{
                position: "absolute",
                inset: 0,
            }}
        />
    );
}