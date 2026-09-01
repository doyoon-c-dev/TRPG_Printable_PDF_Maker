import { Tooltip } from "@chakra-ui/react";
import { CircleHelp } from "lucide-react";

interface HelpTooltipProps {
    children: React.ReactNode;
}

export function HelpTooltip({ children }: HelpTooltipProps) {
    return (
        <Tooltip.Root openDelay={300} closeDelay={100}>
            <Tooltip.Trigger asChild>
                <CircleHelp
                    size={18}
                    strokeWidth={2}
                    style={{
                        cursor: "help",
                    }}
                />
            </Tooltip.Trigger>

            <Tooltip.Positioner>
                <Tooltip.Content>
                    {children}
                </Tooltip.Content>
            </Tooltip.Positioner>
        </Tooltip.Root>
    );
}