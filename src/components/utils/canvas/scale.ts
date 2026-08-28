export interface ScaleOptions {
    image: HTMLImageElement;
    scale: number;
}

export function scaleImage({
    image,
    scale,
}: ScaleOptions): HTMLCanvasElement {

    const scaledWidth = image.naturalWidth * scale * 0.01;

    const scaledHeight = image.naturalHeight * scale * 0.01;

    const canvas = document.createElement("canvas");

    canvas.width = scaledWidth;
    canvas.height = scaledHeight;

    const ctx =
        canvas.getContext("2d");

    if (!ctx) {
        throw new Error(
            "CanvasRenderingContext2D를 생성할 수 없습니다."
        );
    }

    ctx.drawImage( image, 0, 0, scaledWidth, scaledHeight );

    return canvas;
}