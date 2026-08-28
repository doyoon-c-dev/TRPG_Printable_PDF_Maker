
interface CropOptions {

    sourceX: number;
    sourceY: number;
    sourceWidth: number;
    sourceHeight: number;

}

export function crop( sourceCanvas : HTMLCanvasElement | HTMLImageElement, options : CropOptions ) : HTMLCanvasElement {

    const canvas = document.createElement("canvas");

    canvas.width = options.sourceWidth;
    canvas.height = options.sourceHeight;

    const ctx = canvas.getContext("2d");

    if (!ctx) {
        throw new Error("Canvas Context를 생성할 수 없습니다.");
    }

    ctx.drawImage(
        sourceCanvas,

        //원본에서 가져올 영역
        options.sourceX,
        options.sourceY,
        options.sourceWidth,
        options.sourceHeight,

        0,
        0,
        

        //새 캔버스에서 그릴 크기
        options.sourceWidth,
        options.sourceHeight
    );

    return canvas;

}