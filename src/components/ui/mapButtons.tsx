import { Box, Text, Grid, GridItem, HStack, Button, Field, InputGroup, NumberInput, Switch, ColorPicker, parseColor, Portal, VStack } from "@chakra-ui/react";
import type { CanvasSettings } from "@/components/context/canvasContext";
import { useCanvasContext } from "@/components/hooks/useCanvasContext";
import { usePdfContext } from "@/components/hooks/usePdfContext";
import { mmToPx, pxToMm } from "@/components/utils/canvas/unit";
import { LuArrowRightLeft } from "react-icons/lu";
import { HelpTooltip } from "@/components/ui/HelpTooltip";


export const MapButtons = () => {

    //context에서 가져오기
    const { canvasSettings, setCanvasSettings, isResizingGrid, setIsResizingGrid } = useCanvasContext();
    const { addPdf, isLoading } = usePdfContext();

    //값 변경 함수
    //K는 keyof CanvasSettings의 타입
    //value는 CanvasSettings[K]의 타입
    const handleValueChange = <K extends keyof CanvasSettings>(key: K, value: CanvasSettings[K]) => {
        setCanvasSettings(prev => ({ ...prev, [key]: value }));
    };

    //숫자 입력 컴포넌트
    //K는 keyof CanvasSettings의 타입
    //value는 CanvasSettings[K]의 타입
    const numberInput = <K extends keyof CanvasSettings>(
        field: K,
        value: CanvasSettings[K],
        min: number,
        max: number,
        step: number,
    ) => (

        <NumberInput.Root
            value={String(value)}
            width="200px"
            min={min}
            max={max}
            step={step}
            onValueChange={(details) => {
                if (Number.isFinite(details.valueAsNumber)) {
                    handleValueChange(field, details.valueAsNumber as CanvasSettings[K]);
                }
            }}
            defaultValue="0"
        >
            <NumberInput.Control />
            <InputGroup
                startElementProps={{ pointerEvents: "auto" }}
                startElement={
                    <NumberInput.Scrubber>
                        <LuArrowRightLeft />
                    </NumberInput.Scrubber>
                }
            >
                <NumberInput.Input />
            </InputGroup>
        </NumberInput.Root>
    );

    //필드 컴포넌트
    //control에는 numberInput이 들어감
    const field = (label: string, control: React.ReactNode) => (
        <Field.Root width="auto">
            <Field.Label>{label}</Field.Label>
            {control}
        </Field.Root>
    );

    //단위 변경 함수
    //isPx가 true이면 mm -> px, false이면 px -> mm
    //isPx가 변경되면 모든 숫자 값을 변환
    const handleIsPxCange = () => {
        const isPx = !canvasSettings.isPx;
        const change = (value: number) => isPx ? Math.round(mmToPx(value, 300)) : Math.round(pxToMm(value, 300) * 10) / 10;
        setCanvasSettings((prev) => ({
            ...prev,
            marginTop: change(prev.marginTop),
            marginBottom: change(prev.marginBottom),
            marginLeft: change(prev.marginLeft),
            marginRight: change(prev.marginRight),
            paperWidth: change(prev.paperWidth),
            paperHeight: change(prev.paperHeight),
            gridSize: change(prev.gridSize),
            isPx: isPx
        }));
    }

    return (
        <Box display="flex" justifyContent="center" alignItems="flex-start" width="30%">
            <Grid
                templateColumns="repeat(2, 1fr)"
                gap={4}
                width="100%"
            >
                {/* Margin */}
                <GridItem colSpan={2}>
                    <HStack>
                        <Text fontWeight="bold">
                            Margin
                        </Text>
                        <HelpTooltip>
                            <Text>
                                Margin is the space between the edge of the paper and the grid.
                            </Text>
                        </HelpTooltip>
                    </HStack>
                </GridItem>

                {field("Top", numberInput("marginTop", canvasSettings.marginTop, 0, canvasSettings.isPx ? 1000 : 50, canvasSettings.isPx ? 1 : 0.1))}

                {field("Right", numberInput("marginRight", canvasSettings.marginRight, 0, canvasSettings.isPx ? 1000 : 50, canvasSettings.isPx ? 1 : 0.1))}

                {field("Bottom", numberInput("marginBottom", canvasSettings.marginBottom, 0, canvasSettings.isPx ? 1000 : 50, canvasSettings.isPx ? 1 : 0.1))}

                {field("Left", numberInput("marginLeft", canvasSettings.marginLeft, 0, canvasSettings.isPx ? 1000 : 50, canvasSettings.isPx ? 1 : 0.1))}

                {/* Paper */}
                <GridItem colSpan={2} mt={5}>
                    <HStack>
                        <Text fontWeight="bold">
                            Paper
                        </Text>
                        <HelpTooltip>
                            <Text>
                                Paper is the size of the paper.
                            </Text>
                        </HelpTooltip>
                    </HStack>
                </GridItem>

                {field("Width", numberInput("paperWidth", canvasSettings.paperWidth, 1, canvasSettings.isPx ? 10000 : 500, canvasSettings.isPx ? 1 : 0.1))}

                {field("Height", numberInput("paperHeight", canvasSettings.paperHeight, 1, canvasSettings.isPx ? 10000 : 500, canvasSettings.isPx ? 1 : 0.1))}

                {/* Grid */}
                <GridItem colSpan={2} mt={5}>
                    <HStack>
                        <Text fontWeight="bold">
                            Grid
                        </Text>
                        <HelpTooltip>
                            <Text>
                                Grid is the size of the grid.
                            </Text>
                        </HelpTooltip>
                    </HStack>
                </GridItem>

                <Field.Root width="auto">
                    <Field.Label>Show Grid</Field.Label>
                    <Switch.Root
                        checked={canvasSettings.isGrid}
                        onCheckedChange={(details) => handleValueChange("isGrid", details.checked)}
                    >
                        <Switch.HiddenInput />
                        <Switch.Control />
                    </Switch.Root>
                </Field.Root>

                {field("Grid Size", numberInput("gridSize", canvasSettings.gridSize, 1, canvasSettings.isPx ? 1000 : 50, canvasSettings.isPx ? 1 : 0.1))}

                <Field.Root width="auto">
                    <Field.Label>Pen Color</Field.Label>
                    <ColorPicker.Root
                        width="auto"
                        defaultValue={parseColor(canvasSettings.gridPenColor)}
                        size="sm"
                        onValueChange={(e) => handleValueChange("gridPenColor", e.valueAsString)}
                    >
                        <ColorPicker.HiddenInput />
                        <ColorPicker.Control>
                            <ColorPicker.Input />
                            <ColorPicker.Trigger />
                        </ColorPicker.Control>
                        <Portal>
                            <ColorPicker.Positioner>
                                <ColorPicker.Content>
                                    <ColorPicker.Area />
                                    <HStack>
                                        <ColorPicker.EyeDropper size="xs" variant="outline" />
                                        <ColorPicker.Sliders />
                                    </HStack>
                                </ColorPicker.Content>
                            </ColorPicker.Positioner>
                        </Portal>
                    </ColorPicker.Root>

                </Field.Root>

                {field("Pen Size(px)", numberInput("gridPenSize", canvasSettings.gridPenSize, 1, 30, 1))}

                {/* 단위 */}
                <GridItem colSpan={2} mt={5}>
                    <HStack>
                        <Text fontWeight="bold">
                            Unit
                        </Text>
                        <HelpTooltip>
                            <Text>
                                default unit is px. If you want to use mm, change the unit.
                                dpi is 300. So if you use mm, the size of the paper will be different from the size of the paper in px.
                            </Text>
                        </HelpTooltip>
                    </HStack>
                </GridItem>
                <HStack gap={3}>
                    <Text>mm</Text>
                    <Switch.Root
                        checked={canvasSettings.isPx}
                        onCheckedChange={handleIsPxCange}
                    >
                        <Switch.HiddenInput />
                        <Switch.Control />
                    </Switch.Root>
                    <Text>px</Text>
                </HStack>

                {/* Scale */}
                {field("Scale", numberInput("scale", canvasSettings.scale, 1, 1000, 1))}

                {/* Custom Grid */}
                <VStack mt={5} alignItems="flex-start">
                    <HStack>
                        <Text fontWeight="bold">
                            Custom Grid
                        </Text>
                        <HelpTooltip>
                            <Text>
                                Click and drag within the viewport to set the grid size.
                            </Text>
                        </HelpTooltip>
                    </HStack>
                    <Button
                        type="button"
                        onClick={() => setIsResizingGrid(true)}
                        disabled={isResizingGrid}
                    >
                        Custom Grid
                    </Button>
                </VStack>

                {/* Add PDF */}
                <VStack mt={5} alignItems="flex-start">
                    <HStack>
                        <Text fontWeight="bold">
                            Add PDF
                        </Text>
                        <HelpTooltip>
                            <Text>
                                convert image to pdf and add to list.
                            </Text>
                        </HelpTooltip>
                    </HStack>
                    <Button
                        onClick={addPdf}
                        disabled={isLoading}>
                        convert pdf
                    </Button>
                </VStack>
            </Grid>
        </Box>
    );
}