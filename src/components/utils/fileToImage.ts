export interface ImageData {
    key: string;
    file: File;
    image: HTMLImageElement;
}

const getFileKey = (file: File) => `${file.name}:${file.size}:${file.lastModified}:${file.type}`;

export function fileToImage(file: File): Promise<ImageData> {

    return new Promise((resolve, reject) => {

        const objectUrl = URL.createObjectURL(file);

        const image = new Image();

        image.onload = () => {
            resolve({
                key: getFileKey(file),
                file: file,
                image: image
            });
        };

        image.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            reject(new Error("이미지를 불러오지 못했습니다."));
        };

        image.src = objectUrl;
    });
}