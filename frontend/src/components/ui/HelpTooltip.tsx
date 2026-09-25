import { Tooltip } from "@chakra-ui/react";
import { CircleHelp } from "lucide-react";
import { useEffect, useRef, useState } from "react";


interface HelpTooltipProps {
    children: React.ReactNode;
}

export function HelpTooltip({ children }: HelpTooltipProps) {
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        if (!open) return;

        const handleOutsidePointerDown = (event: PointerEvent) => {
            if (!containerRef.current?.contains(event.target as Node)) {
                setOpen(false);
            }
        };

        document.addEventListener("pointerdown", handleOutsidePointerDown);
        return () => document.removeEventListener("pointerdown", handleOutsidePointerDown);
    }, [open]);

    return (
        <span ref={containerRef}>
            <Tooltip.Root
                open={open}
                onOpenChange={(details) => setOpen(details.open)}
                openDelay={300}
                closeDelay={100}
            >
                <Tooltip.Trigger asChild>
                    <CircleHelp
                        size={18}
                        strokeWidth={2}
                        style={{
                            cursor: "help",
                            touchAction: "manipulation",
                        }}
                        onPointerDown={(event) => {
                            if (event.pointerType === "touch") {
                                event.preventDefault();
                                setOpen((currentOpen) => !currentOpen);
                            }
                        }}
                    />
                </Tooltip.Trigger>

                <Tooltip.Positioner>
                    <Tooltip.Content>
                        {children}
                    </Tooltip.Content>
                </Tooltip.Positioner>
            </Tooltip.Root>
        </span>
    );
}