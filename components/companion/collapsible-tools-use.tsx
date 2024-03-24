import * as Accordion from "@radix-ui/react-accordion";
import { CollapsibleToolUse, ToolUse } from './collapsible-tool-use';

export type ToolsUse = Record<ToolUse['runId'], ToolUse>;

export interface CollapsibleToolsUseProps {
    tools: ToolsUse;
}

export function CollapsibleToolsUse(tools: CollapsibleToolsUseProps) {
    return (<>
        {tools && <Accordion.Root type="single" collapsible className='AccordionRoot mb-4' orientation='horizontal'>
            {Object.values(tools).map(toolUse => <CollapsibleToolUse {...toolUse} />)}
        </Accordion.Root>}
    </>);
}
