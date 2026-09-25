import { useContext } from "react";
import { PdfContext } from "../context/pdfContext";

export function usePdfContext() {
    const context = useContext(PdfContext);

    if (!context) {
        throw new Error("usePdfContext must be used within MapContextProvider");
    }

    return context;
}