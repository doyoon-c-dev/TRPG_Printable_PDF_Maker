// utils/canvas/drawGrid.ts

export interface DrawGridOptions {
    ctx: Pick<CanvasRenderingContext2D, "beginPath" | "moveTo" | "lineTo" | "stroke"> & {
        strokeStyle: string | CanvasGradient | CanvasPattern;
        lineWidth: number;
    };
    width: number;
    height: number;
    gridSize: number;
    gridPenColor: string;
    gridPenSize: number;
}

export function drawGrid({
    ctx,
    width,
    height,
    gridSize,
    gridPenColor,
    gridPenSize
}: DrawGridOptions) {
    if (
        !Number.isFinite(gridSize) ||
        gridSize <= 0 ||
        !Number.isFinite(gridPenSize) ||
        gridPenSize <= 0
    ) return;

    ctx.strokeStyle = gridPenColor;
    ctx.lineWidth = gridPenSize;

    ctx.beginPath();

    // 세로선
    for (let x = 0; x <= width; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
    }

    // 가로선
    for (let y = 0; y <= height; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
    }

    ctx.stroke();
}