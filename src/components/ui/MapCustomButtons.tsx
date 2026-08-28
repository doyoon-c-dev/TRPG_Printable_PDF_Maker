import { Button } from "@chakra-ui/react";
import { useCanvasContext } from "../hooks/useCanvasContext";

export function MapCustomButtons() {
    const { isResizingGrid, setIsResizingGrid } = useCanvasContext();

    return (
        <Button
            type="button"
            onClick={() => setIsResizingGrid(true)}
            disabled={isResizingGrid}
        >
            Custom Grid
        </Button>
    );
}