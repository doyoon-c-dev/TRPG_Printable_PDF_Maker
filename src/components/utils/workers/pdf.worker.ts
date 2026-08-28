/// <reference lib="webworker" />

import { jsPDF } from "jspdf";
import { DEFAULT_DPI, mmToPx, pxToMm } from "../canvas/unit";
import { drawGrid } from "../canvas/drawGrid";
import type { CanvasSettings } from "../../context/canvasContext";
import type { SplitPages } from "../canvas/splitPages";

interface PdfWorkerRequest {
    image: ImageBitmap;
    option: CanvasSettings;
    pages: SplitPages[];
}

interface PdfWorkerResult {
    pdf: ArrayBuffer;
    preview: Blob;
}

const worker = self as DedicatedWorkerGlobalScope;

const crop = (
    source: OffscreenCanvas,
    sourceX: number,
    sourceY: number,
    sourceWidth: number,
    sourceHeight: number
) => {
    const canvas = new OffscreenCanvas(
        Math.max(1, Math.round(sourceWidth)),
        Math.max(1, Math.round(sourceHeight))
    );
    const context = canvas.getContext("2d");

    if (!context) {
        throw new Error("Canvas Context를 생성할 수 없습니다.");
    }

    context.drawImage(
        source,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        0,
        0,
        canvas.width,
        canvas.height
    );

    return canvas;
};

const blobToDataUrl = async (blob: Blob) => {
    const bytes = new Uint8Array(await blob.arrayBuffer());
    let binary = "";

    for (let index = 0; index < bytes.length; index += 0x8000) {
        binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
    }

    return `data:${blob.type};base64,${btoa(binary)}`;
};

worker.onmessage = async ({ data }: MessageEvent<PdfWorkerRequest>) => {
    try {
        const { image, option, pages } = data;
        const toMm = (value: number) => option.isPx ? pxToMm(value, DEFAULT_DPI) : value;
        const toPx = (value: number) => option.isPx ? value : mmToPx(value, DEFAULT_DPI);
        const paperWidthMm = toMm(option.paperWidth);
        const paperHeightMm = toMm(option.paperHeight);
        const marginTopMm = toMm(option.marginTop);
        const marginBottomMm = toMm(option.marginBottom);
        const marginLeftMm = toMm(option.marginLeft);
        const marginRightMm = toMm(option.marginRight);
        const printableWidthMm = paperWidthMm - marginLeftMm - marginRightMm;
        const printableHeightMm = paperHeightMm - marginTopMm - marginBottomMm;
        const scaledWidth = Math.round(image.width * option.scale * 0.01);
        const scaledHeight = Math.round(image.height * option.scale * 0.01);

        if (pages.length === 0 || scaledWidth <= 0 || scaledHeight <= 0 || printableWidthMm <= 0 || printableHeightMm <= 0) {
            throw new Error("PDF를 생성할 수 있는 페이지 또는 크기가 없습니다.");
        }

        const pdf = new jsPDF({
            orientation: paperWidthMm > paperHeightMm ? "landscape" : "portrait",
            unit: "mm",
            format: [paperWidthMm, paperHeightMm],
            compress: true,
        });
        const scaledCanvas = new OffscreenCanvas(scaledWidth, scaledHeight);
        const context = scaledCanvas.getContext("2d");

        if (!context) {
            throw new Error("Canvas Context를 생성할 수 없습니다.");
        }

        context.drawImage(image, 0, 0, scaledWidth, scaledHeight);
        image.close();

        if (option.isGrid) {
            drawGrid({
                ctx: context,
                width: scaledWidth,
                height: scaledHeight,
                gridSize: toPx(option.gridSize),
                gridPenColor: option.gridPenColor,
                gridPenSize: option.gridPenSize,
            });
        }

        const pagesWidth = Math.max(...pages.map((page) => page.sourceX + page.sourceWidth), 0);
        const pagesHeight = Math.max(...pages.map((page) => page.sourceY + page.sourceHeight), 0);
        const pageScaleX = scaledWidth / pagesWidth;
        const pageScaleY = scaledHeight / pagesHeight;
        const fullPageWidth = Math.max(...pages.map((page) => page.sourceWidth * pageScaleX), 0);
        const fullPageHeight = Math.max(...pages.map((page) => page.sourceHeight * pageScaleY), 0);
        const outputScale = Math.min(printableWidthMm / fullPageWidth, printableHeightMm / fullPageHeight);
        let preview: Blob | null = null;

        for (let index = 0; index < pages.length; index++) {
            const page = pages[index];
            if (index > 0) pdf.addPage();

            const croppedCanvas = crop(
                scaledCanvas,
                page.sourceX * pageScaleX,
                page.sourceY * pageScaleY,
                page.sourceWidth * pageScaleX,
                page.sourceHeight * pageScaleY
            );
            const croppedBlob = await croppedCanvas.convertToBlob({ type: "image/png" });
            const imageData = await blobToDataUrl(croppedBlob);

            if (index === 0) preview = croppedBlob;

            pdf.addImage(
                imageData,
                "PNG",
                marginLeftMm,
                marginTopMm,
                croppedCanvas.width * outputScale,
                croppedCanvas.height * outputScale
            );
        }

        if (!preview) throw new Error("PDF 미리보기를 생성할 수 없습니다.");

        const result: PdfWorkerResult = {
            pdf: pdf.output("arraybuffer"),
            preview,
        };
        worker.postMessage(result, [result.pdf]);
    } catch (error) {
        worker.postMessage({
            error: error instanceof Error ? error.message : "PDF 생성에 실패했습니다.",
        });
    }
};
