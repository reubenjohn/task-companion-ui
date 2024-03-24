import * as Accordion from '@radix-ui/react-accordion';
import { EventRow } from '../event/event-row';
import { CollapsibleToolUse } from './collapsible-tool-use';
import { ToolsUse } from './collapsible-tools-use';


export interface AssistantDraftProps {
    content: string;
    tools: ToolsUse;
}

export function AssistantDraft({ content, tools }: AssistantDraftProps) {
    return (<>
        {content && <EventRow event={{ type: 'message', role: 'assistant', 'creationUtcMillis': -1, 'content': content }} />}
        {tools && <Accordion.Root type="single" collapsible className='AccordionRoot mb-4' orientation='vertical'>
            {Object.values(tools).map(toolUse => <CollapsibleToolUse {...toolUse} />)}
        </Accordion.Root>}
    </>)
}

