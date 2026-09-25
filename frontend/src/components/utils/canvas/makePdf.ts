import apiClient from "../apiClient";
import type { CanvasSettings } from "@/components/context/canvasContext";

interface MakePdfOptions {
    file: File;
    imageWidth: number;
    imageHeight: number;
    option: CanvasSettings;
}

interface GeneratedPdfResponse {
    pdfBase64: string;
    previewBase64: string;

}

export interface MadePdf {
    blob: Blob;
    previewUrl: string;
}

function base64ToBlob(base64: string, type: string): Blob {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);

    for (let index = 0; index < binary.length; index++) {
        bytes[index] = binary.charCodeAt(index);
    }

    return new Blob([bytes], { type });
}

export async function makePdf({
    file,
    imageWidth,
    imageHeight,
    option,
}: MakePdfOptions): Promise<MadePdf> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append(
        "request",
        new Blob([
            JSON.stringify({
                imageWidth,
                imageHeight,
                settings: option,
            }),
        ], { type: "application/json" }),
    );

    const response = await apiClient.post<GeneratedPdfResponse>(
        "/pdfs/generate",
        formData,
    );

    return {
        blob: base64ToBlob(response.data.pdfBase64, "application/pdf"),
        previewUrl: `data:image/png;base64,${response.data.previewBase64}`,
    };
}

