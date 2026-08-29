export interface SplitPagesOptions {
    imageWidth: number;
    imageHeight: number;

    gridSize: number;

    printableWidth: number;
    printableHeight: number;

    isGrid: boolean;
}

export interface SplitPages {
    pageIndex: number;

    sourceX: number;
    sourceY: number;

    sourceWidth: number;
    sourceHeight: number;
}

export function splitPages({
    imageWidth,
    imageHeight,
    gridSize,
    printableWidth,
    printableHeight,
    isGrid
}: SplitPagesOptions): SplitPages[] {

    if (
        imageWidth <= 0 ||
        imageHeight <= 0 ||
        (isGrid && gridSize <= 0) ||
        printableWidth <= 0 ||
        printableHeight <= 0
    ) {
        return [];
    }



    let pageWidth: number;
    let pageHeight: number;
    let pagesX: number;
    let pagesY: number;

    if (isGrid) {
        //한 페이지에 들어갈 grid cell 수
        const cellsPerPageX = Math.floor(printableWidth / gridSize);
        const cellsPerPageY = Math.floor(printableHeight / gridSize);

        if (cellsPerPageX <= 0 || cellsPerPageY <= 0) return [];

        //실제 한 페이지가 차지하는 이미지 영역
        //반드시 grid의 배수
        pageWidth = cellsPerPageX * gridSize;
        pageHeight = cellsPerPageY * gridSize;

        //이미지 전체 크기도 grid에 맞춘다.
        pagesX = Math.ceil(imageWidth / pageWidth);
        pagesY = Math.ceil(imageHeight / pageHeight);

    }
    else {
        //그리드가 없을 때는 그냥 printable 영역을 한 페이지로 사용
        pageWidth = printableWidth;
        pageHeight = printableHeight;

        //올림해야함
        //반올림이나 내림을 하면 이미지가 잘림
        pagesX = Math.ceil(imageWidth / printableWidth);
        pagesY = Math.ceil(imageHeight / printableHeight);
    }


    const pages: SplitPages[] = [];

    let pageIndex = 0;

    for (let y = 0; y < pagesY; y++) {
        for (let x = 0; x < pagesX; x++) {

            const sourceX = x * pageWidth;
            const sourceY = y * pageHeight;


            //이미지의 크기가 페이지보다 클 경우를 대비
            const sourceWidth = Math.min(pageWidth, imageWidth - sourceX);
            const sourceHeight = Math.min(pageHeight, imageHeight - sourceY);

            pages.push({ pageIndex, sourceX, sourceY, sourceWidth, sourceHeight });

            pageIndex++;
        }
    }

    return pages;
}