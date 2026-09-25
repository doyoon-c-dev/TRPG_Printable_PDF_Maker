// utils/canvas/unit.ts

export const DEFAULT_DPI = 300;

export const pxToMm = (px: number, dpi = DEFAULT_DPI): number => {
    return px * 25.4 / dpi;
};

export const mmToPx = (mm: number, dpi = DEFAULT_DPI): number => {
    return mm * dpi / 25.4;
};