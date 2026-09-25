import apiClient from "./apiClient";

export interface ImageData {
    key: string;
    file: File;
    image: HTMLImageElement;
    objectUrl: string;
}

const getFileKey = (file: File) => `${file.name}:${file.size}:${file.lastModified}:${file.type}`;

const loadImage = (src: string, onLoad: (image: HTMLImageElement) => void, onError: () => void) => {
    const image = new Image();

    image.onload = () => onLoad(image);
    image.onerror = onError;
    image.src = src;
};

export function loadOriginalImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const objectUrl = URL.createObjectURL(file);

        loadImage(objectUrl, (image) => {
            URL.revokeObjectURL(objectUrl);
            resolve(image);
        }, () => {
            URL.revokeObjectURL(objectUrl);
            reject(new Error("이미지를 불러오지 못했습니다."));
        });
    });
}

export async function fileToImage(file: File): Promise<ImageData> {

    try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await apiClient.post(
            "/images/process",
            formData,
            {
                responseType: "blob",
            }
        );

        const objectUrl = URL.createObjectURL(response.data);

        const image = await new Promise<HTMLImageElement>((resolve, reject) => {
            loadImage(
                objectUrl,
                resolve,
                () => reject(new Error("이미지를 처리하지 못했습니다."))
            );
        });

        return {
            key: getFileKey(file),
            file,
            image,
            objectUrl,
        };
    } catch {
        throw new Error("이미지를 불러오지 못했습니다.");
    }
}