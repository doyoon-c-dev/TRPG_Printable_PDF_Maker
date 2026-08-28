import { createContext } from "react";
import type { ImageData } from "../utils/fileToImage";

export interface ImageContextValue {
    // export interface ImageData {
    //     id : string;
    //     file : File;
    //     image : HTMLImageElement;
    // }
    selectedImage: ImageData | null; //현재 viewport에 보이고 있는 선택된 이미지의 데이터
    setSelectedImage: React.Dispatch<React.SetStateAction<ImageData | null>>;
    uploadedImages: ImageData[];    //현재 업로드된 이미지들의 이미지데이터 배열
    setUploadedImages: React.Dispatch<React.SetStateAction<ImageData[]>>;
}

export const ImageContext = createContext<ImageContextValue | undefined>(undefined);