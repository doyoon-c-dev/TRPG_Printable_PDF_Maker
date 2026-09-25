import { useContext } from "react";
import { CanvasContext } from "../context/canvasContext";

export function useCanvasContext() {
    const context = useContext(CanvasContext);

    if (!context) {
        throw new Error("useCanvasContext must be used within MapContextProvider");
    }

    return context;
}