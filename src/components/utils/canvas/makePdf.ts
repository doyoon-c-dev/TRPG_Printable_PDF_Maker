import { type SplitPages } from "./splitPages";
import { jsPDF } from "jspdf";
import { crop } from "./crop";
import { DEFAULT_DPI, mmToPx, pxToMm } from "./unit";
import { drawGrid } from "./drawGrid";
import { type CanvasSettings } from "@/components/context/canvasContext";

interface MakePdfOptions {

    image : HTMLImageElement;
    option : CanvasSettings
    pages : SplitPages[];
}

export interface MadePdf {
    blob: Blob;
    previewUrl: string;
}


export function makePdf({
    image, 

    option,
    pages
}: MakePdfOptions): MadePdf | null {

    const toMm = (value: number) => option.isPx ? pxToMm(value, DEFAULT_DPI) : value;
    const toPx = (value: number) => option.isPx ? value : mmToPx(value, DEFAULT_DPI);

    const marginTopMm = toMm(option.marginTop);
    const marginBottomMm = toMm(option.marginBottom);
    const marginLeftMm = toMm(option.marginLeft);
    const marginRightMm = toMm(option.marginRight);
    const paperWidthMm = toMm(option.paperWidth);
    const paperHeightMm = toMm(option.paperHeight);
    const printableWidthMm = paperWidthMm - marginLeftMm - marginRightMm;
    const printableHeightMm = paperHeightMm - marginTopMm - marginBottomMm;

    const pdf = new jsPDF({
        orientation : paperWidthMm > paperHeightMm ? "landscape" : "portrait",
        unit : "mm",
        format: [paperWidthMm, paperHeightMm],
        compress: true

    });
    
    const scaledWidth = Math.round(image.naturalWidth * option.scale * 0.01);
    const scaledHeight = Math.round(image.naturalHeight * option.scale * 0.01);

    if (
        pages.length === 0 ||
        scaledWidth <= 0 ||
        scaledHeight <= 0 ||
        printableWidthMm <= 0 ||
        printableHeightMm <= 0
    ) return null;

    const scaledCanvas = document.createElement("canvas");
    scaledCanvas.width = scaledWidth
    scaledCanvas.height = scaledHeight

    const ctx = scaledCanvas.getContext("2d");

    if (!ctx) return null;

    ctx.drawImage( image, 0, 0, scaledWidth, scaledHeight );

    if( option.isGrid){
        drawGrid({
                ctx, 
                width : scaledWidth, 
                height : scaledHeight, 
                gridSize : toPx(option.gridSize), 
                gridPenColor : option.gridPenColor, 
                gridPenSize : option.gridPenSize 
            });
    }
    
    const pagesWidth = Math.max(
        ...pages.map((page) => page.sourceX + page.sourceWidth),
        0
    );
    const pagesHeight = Math.max(
        ...pages.map((page) => page.sourceY + page.sourceHeight),
        0
    );
    const pageScaleX = pagesWidth > 0 ? scaledWidth / pagesWidth : 1;
    const pageScaleY = pagesHeight > 0 ? scaledHeight / pagesHeight : 1;
    const fullPageWidth = Math.max(
        ...pages.map((page) => page.sourceWidth * pageScaleX),
        0
    );
    const fullPageHeight = Math.max(
        ...pages.map((page) => page.sourceHeight * pageScaleY),
        0
    );
    const outputScale = Math.min(
        printableWidthMm / fullPageWidth,
        printableHeightMm / fullPageHeight
    );

    
    let previewUrl = "";

    pages.forEach((page, index) => {
        if(index>0){
            pdf.addPage();
        }

        const croppedImage = crop(scaledCanvas,
                            {
                                sourceX: page.sourceX * pageScaleX,
                                sourceY: page.sourceY * pageScaleY,
                                sourceWidth: page.sourceWidth * pageScaleX,
                                sourceHeight: page.sourceHeight * pageScaleY
                            });

        if (index === 0) {
            previewUrl = croppedImage.toDataURL("image/png");
        }

        const outputWidthMm = croppedImage.width * outputScale;
        const outputHeightMm = croppedImage.height * outputScale;

        pdf.addImage(
            croppedImage,
            "PNG",
            marginLeftMm,
            marginTopMm,
            outputWidthMm,
            outputHeightMm,

        );
    });

    return {
        blob: pdf.output("blob"),
        previewUrl,
    };
}