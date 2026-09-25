import apiClient from "../apiClient";
import type { SplitPages } from "./splitPages";

export interface CalculatePagesOptions {
    imageWidth: number;
    imageHeight: number;
    gridSize: number;
    printableWidth: number;
    printableHeight: number;
    isGrid: boolean;
}

export async function calculatePages(
    options: CalculatePagesOptions,
    signal?: AbortSignal,
): Promise<SplitPages[]> {
    const response = await apiClient.post<SplitPages[]>(
        "/pages/calculate",
        options,
        { signal },
    );

    return response.data;
}