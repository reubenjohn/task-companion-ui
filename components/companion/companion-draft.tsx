import * as Accordion from '@radix-ui/react-accordion';
import { EventRow } from '../event/event-row';
import { CollapsibleToolUse } from './collapsible-tool-use';
import { CollapsibleToolsUse, ToolsUse } from './collapsible-tools-use';


export interface AssistantDraftProps {
    content: string;
    tools: ToolsUse;
}

export function AssistantDraft({ content, tools }: AssistantDraftProps) {
    return (<>
        {content && <EventRow event={{ type: 'message', role: 'assistant', 'creationUtcMillis': -1, 'content': content }} />}
        <CollapsibleToolsUse tools={tools} />
    </>)
}

