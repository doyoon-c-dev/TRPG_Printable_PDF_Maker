import axios from "axios";
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
    const response = await axios.post<SplitPages[]>(
        "/api/pages/calculate",
        options,
        { signal },
    );

    return response.data;
}