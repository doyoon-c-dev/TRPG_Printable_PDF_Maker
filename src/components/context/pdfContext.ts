import { createContext } from "react";

export interface GeneratedPdf {
    id: string; 
    name: string;
    blob: Blob;
    previewUrl: string;
    createdAt: number;
}

export interface PdfContextValue {
    isLoading: boolean;                 //true : pdf생성 혹은 merge download 중
    loadingMessage: string;             //pdf 생성 중 혹은 merge download 중
    generatedPdfs: GeneratedPdf[];      //선택된 이미지로 만든 pdf의 배열
    addPdf: () => Promise<void>;        //generatedPdfs 에 pdf 추가
    deletePdf: (id: string) => void;    //generatedPdfs에서 pdf 제거
    downloadPdf: (id: string) => void;  //개별 pdf 다운로드
    mergePdfs: () => Promise<void>;     //모든 pdf 병합 후 다운로드
}

export const PdfContext = createContext<PdfContextValue | undefined>(undefined);