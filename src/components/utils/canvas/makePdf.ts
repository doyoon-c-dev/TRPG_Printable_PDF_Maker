import { type SplitPages } from "@/components/utils/canvas/splitPages";
import { jsPDF } from "jspdf";
import { crop } from "@/components/utils/canvas/crop";
import { DEFAULT_DPI, mmToPx, pxToMm } from "@/components/utils/canvas/unit";
import { drawGrid } from "@/components/utils/canvas/drawGrid";
import { type CanvasSettings } from "@/components/context/canvasContext";

interface MakePdfOptions {
    image: HTMLImageElement;
    option: CanvasSettings
    pages: SplitPages[];
}

export interface MadePdf {
    blob: Blob;
    previewUrl: string;
}


export function makePdf({ image, option, pages }: MakePdfOptions): MadePdf | null {

    //단위 변환
    const toMm = (value: number) => option.isPx ? pxToMm(value, DEFAULT_DPI) : value;
    const toPx = (value: number) => option.isPx ? value : mmToPx(value, DEFAULT_DPI);

    //scale 비율 (0~100 → 0.0~1.0)
    const scaleFactor = option.scale * 0.01;

    //PDF를 만들 때는 mm 기준으로 작업하기 때문에 mm로 변환
    const marginTopMm = toMm(option.marginTop);
    const marginBottomMm = toMm(option.marginBottom);
    const marginLeftMm = toMm(option.marginLeft);
    const marginRightMm = toMm(option.marginRight);
    const paperWidthMm = toMm(option.paperWidth);
    const paperHeightMm = toMm(option.paperHeight);

    //실제 출력 가능한 영역
    const printableWidthMm = paperWidthMm - marginLeftMm - marginRightMm;
    const printableHeightMm = paperHeightMm - marginTopMm - marginBottomMm;

    //PDF 생성
    const pdf = new jsPDF({
        orientation: paperWidthMm > paperHeightMm ? "landscape" : "portrait",
        unit: "mm",
        format: [paperWidthMm, paperHeightMm],
        compress: true

    });

    //이미지 크기 조정
    const scaledWidth = image.naturalWidth * option.scale * 0.01;
    const scaledHeight = image.naturalHeight * option.scale * 0.01;

    //유효성 검사
    if (
        pages.length === 0 ||
        scaledWidth <= 0 ||
        scaledHeight <= 0 ||
        printableWidthMm <= 0 ||
        printableHeightMm <= 0
    ) return null;

    const actualGridSize = toPx(option.gridSize) / scaleFactor;

    let previewUrl = "";

    //페이지별로 자르고 PDF에 추가
    pages.forEach((page, index) => {

        if (index > 0) {
            pdf.addPage();
        }

        //이미지 자르기 (page 좌표는 원본 기준)
        const croppedImage = crop(image,
            {
                sourceX: page.sourceX,
                sourceY: page.sourceY,
                sourceWidth: page.sourceWidth,
                sourceHeight: page.sourceHeight
            });

        //그리드 그리기
        if (option.isGrid) {
            drawGrid({
                ctx: croppedImage.getContext("2d")!,
                width: croppedImage.width,
                height: croppedImage.height,
                gridSize: actualGridSize,
                gridPenColor: option.gridPenColor,
                gridPenSize: option.gridPenSize / scaleFactor
            });
        }

        //첫번째 페이지만 미리보기 URL 생성
        if (index === 0) {
            previewUrl = croppedImage.toDataURL("image/png");
        }

        //출력 크기 계산 (원본 px → scaled px → mm)
        const outputWidthMm = toMm(croppedImage.width * scaleFactor);
        const outputHeightMm = toMm(croppedImage.height * scaleFactor);

        //PDF에 이미지 추가
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
        //PDF 파일
        blob: pdf.output("blob"),
        //미리보기 URL
        previewUrl,
    };
}