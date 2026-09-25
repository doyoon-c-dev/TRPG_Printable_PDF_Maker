import { useContext } from "react";
import { ImageContext } from "../context/imageContext";

export function useImageContext() {
    const context = useContext(ImageContext);

    if (!context) {
        throw new Error("useImageContext must be used within MapContextProvider");
    }

    return context;
}