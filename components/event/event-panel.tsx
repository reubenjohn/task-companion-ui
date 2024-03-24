import { ButtonScrollToBottom } from '@/components/button-scroll-to-bottom'
import { PromptForm } from '@/components/prompt-form'
import { Button } from '@/components/ui/button'
import { IconRefresh, IconStop } from '@/components/ui/icons'
import { Event } from '@/lib/event-types'

export interface ChatPanelProps {
  events: Event[]
  input: string
  setInput: (input: string) => void
  onSubmitUserMessage: (message: { content: string }) => Promise<void>
  regenerateResponse: () => void
  isLoading: boolean
  stopResponding: () => void
}

export function EventPanel({
  isLoading,
  stopResponding,
  events,
  onSubmitUserMessage,
  regenerateResponse: reload,
  input,
  setInput
}: ChatPanelProps) {
  const lastEventIsAssistant = events.length > 0 && events[0]?.role == 'system'
  return (
    <div className="w-full bg-gradient-to-b from-muted/30 from-0% to-muted/30 to-50% animate-in duration-300 ease-in-out dark:from-background/10 dark:from-10% dark:to-background/80">
      <ButtonScrollToBottom />
      <div className="mx-auto sm:max-w-2xl sm:px-4">
        <div className="px-4 py-0 space-y-4 border-t shadow-lg bg-background sm:rounded-t-xl sm:border md:py-4">
          {(isLoading || lastEventIsAssistant) && <div className="flex items-center justify-center h-12">
            {isLoading ? (
              <Button
                variant="outline"
                onClick={() => stopResponding()}
                className="bg-background"
              >
                <IconStop className="mr-2" />
                Stop generating
              </Button>
            ) : (
              (
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={() => reload()}>
                    <IconRefresh className="mr-2" />
                    Regenerate response
                  </Button>
                </div>
              )
            )}
          </div>}
          <PromptForm
            onSubmit={async value => {
              await onSubmitUserMessage({
                content: value,
              })
            }}
            input={input}
            setInput={setInput}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  )
}
