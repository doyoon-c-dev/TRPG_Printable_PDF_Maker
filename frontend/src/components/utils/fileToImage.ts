import axios from "axios";

export interface ImageData {
    key: string;
    file: File;
    image: HTMLImageElement;
    objectUrl: string;
}

const getFileKey = (file: File) => `${file.name}:${file.size}:${file.lastModified}:${file.type}`;
const MAX_IMAGE_DIMENSION = 4096;

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



    // return createImageBitmap(file)
    //     .then(async (bitmap) => {
    //         const longestSide = Math.max(bitmap.width, bitmap.height);
    //         const resizeFactor = Math.min(1, MAX_IMAGE_DIMENSION / longestSide);
    //         const width = Math.max(1, Math.round(bitmap.width * resizeFactor));
    //         const height = Math.max(1, Math.round(bitmap.height * resizeFactor));
    //         const canvas = document.createElement("canvas");
    //         canvas.width = width;
    //         canvas.height = height;

    //         const context = canvas.getContext("2d");
    //         if (!context) {
    //             bitmap.close();
    //             throw new Error("이미지를 처리하지 못했습니다.");
    //         }

    //         context.drawImage(bitmap, 0, 0, width, height);
    //         bitmap.close();

    //         const blob = await new Promise<Blob | null>((resolve) => {
    //             canvas.toBlob(resolve, file.type === "image/png" ? "image/png" : "image/jpeg", 0.9);
    //         });
    //         canvas.width = 0;
    //         canvas.height = 0;

    //         if (!blob) throw new Error("이미지를 처리하지 못했습니다.");

    //         const objectUrl = URL.createObjectURL(blob);
    //         const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    //             loadImage(objectUrl, resolve, () => reject(new Error("이미지를 처리하지 못했습니다.")));
    //         });

    //         return { key: getFileKey(file), file, image, objectUrl };
    //     })
    //     .catch(() => {
    //         throw new Error("이미지를 불러오지 못했습니다.");
    //     });

    try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await axios.post(
            "/api/images/process",
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