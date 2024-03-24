import * as Accordion from '@radix-ui/react-accordion';
import { IconArrowDown } from '../ui/icons';
import { cn } from '@/lib/utils';


export interface ToolUse {
    runId: string
    name: string
    inputs: object
    outputs?: string
}

export interface CollapsibleToolUseProps extends ToolUse {
}

export function CollapsibleToolUse({ runId, name, inputs, outputs }: CollapsibleToolUseProps) {
    const outputText = outputs || 'Processing...'
    const usageState = outputs ? 'Used' : 'Using'
    return (
        <Accordion.Item className='AccordionItem' value={runId}>
            <AccordianHeader><p>{`🔧 ${usageState} tool: `}<strong>{name}</strong></p></AccordianHeader>
            <Accordion.AccordionContent className='AccordionContent p-1'>

                <Accordion.Root type="single" className='AccordionRoot' orientation='vertical' defaultValue="Outputs">
                    <Accordion.Item className='AccordionItem' value="Inputs">
                        <AccordianHeader>Inputs</AccordianHeader>
                        <Accordion.AccordionContent className='AccordionContent'>
                            <div className='AccordionContentText'>{JSON.stringify(inputs)}</div>
                        </Accordion.AccordionContent>
                    </Accordion.Item>
                    <Accordion.Item className='AccordionItem' value="Outputs">
                        <AccordianHeader>Outputs</AccordianHeader>
                        <Accordion.AccordionContent className='AccordionContent'>
                            <pre className='AccordionContentText'>{outputText}</pre>
                        </Accordion.AccordionContent>
                    </Accordion.Item>
                </Accordion.Root>

            </Accordion.AccordionContent>
        </Accordion.Item>
    )
}

export function AccordianHeader({ children, className, triggerClassName }: { children: React.ReactNode, className?: string, triggerClassName?: string }) {
    return (
        <Accordion.AccordionHeader className={cn('AccordianHeader', className)}>
            <Accordion.AccordionTrigger className={cn('AccordionTrigger w-full', triggerClassName)}>
                {children}
                <IconArrowDown className="AccordionChevron" aria-hidden />
            </Accordion.AccordionTrigger>
        </Accordion.AccordionHeader>
    )
}
