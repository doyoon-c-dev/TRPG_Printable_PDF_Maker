export interface SplitPagesOptions {
    imageWidth: number;
    imageHeight: number;

    gridSize: number;

    printableWidth: number;
    printableHeight: number;

    isGrid : boolean;
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
        ( isGrid && gridSize <= 0) ||
        printableWidth <= 0 ||
        printableHeight <= 0
    ) {
        return [];
    }



    let pageWidth: number;
    let pageHeight: number;
    let pagesX: number;
    let pagesY: number;

    if(isGrid){
        /*
        * 한 페이지에 들어갈 grid cell 수
        */
        const cellsPerPageX = Math.floor(
            printableWidth / gridSize
        );

        const cellsPerPageY = Math.floor(
            printableHeight / gridSize
        );

        if (
            cellsPerPageX <= 0 ||
            cellsPerPageY <= 0
        ) {
            return [];
        }

        /*
        * 실제 한 페이지가 차지하는 이미지 영역
        *
        * 반드시 grid의 배수
        */
        pageWidth =
            cellsPerPageX * gridSize;

        pageHeight =
            cellsPerPageY * gridSize;

        /*
        * 이미지 전체 크기도 grid에 맞춘다.
        *
        * 여기서는 빈 공간을 추가하는 것이 아니라
        * 호출하는 쪽에서 이미지 자체를 이 크기로
        * 스케일링해서 사용한다는 전제.
        */
        pagesX = Math.ceil(
            imageWidth / pageWidth
        );

        pagesY = Math.ceil(
            imageHeight / pageHeight
        );

    }
    else{
        pageWidth = printableWidth;
        pageHeight = printableHeight;

        pagesX = Math.ceil(imageWidth / printableWidth);
        pagesY = Math.ceil(imageHeight / printableHeight);
    }
    

    const pages: SplitPages[] = [];

    let pageIndex = 0;

    for (let y = 0; y < pagesY; y++) {
        for (let x = 0; x < pagesX; x++) {

            const sourceX =
                x * pageWidth;

            const sourceY =
                y * pageHeight;

            const sourceWidth =
                Math.min(
                    pageWidth,
                    imageWidth - sourceX
                );

            const sourceHeight =
                Math.min(
                    pageHeight,
                    imageHeight - sourceY
                );

            pages.push({
                pageIndex,

                sourceX,
                sourceY,

                sourceWidth,
                sourceHeight,
            });

            pageIndex++;
        }
    }

    return pages;
}