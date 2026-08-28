export interface ImageData {
  id : string;
  file : File;
  image : HTMLImageElement;
}

export function fileToImage(
    file: File
): Promise<ImageData> {

    return new Promise((resolve, reject) => {

        const objectUrl =
            URL.createObjectURL(file);

        const image =
            new Image();

        image.onload = () => {
            resolve({id : crypto.randomUUID(),
                     file : file,
                     image : image});
        };

        image.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            reject(
                new Error(
                    "이미지를 불러오지 못했습니다."
                )
            );
        };

        image.src = objectUrl;
    });
}