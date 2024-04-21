'use client'

import { addEvent, getAICompanionUrl, getUserId } from '@/app/actions'
import { EmptyScreen } from '@/components/empty-screen'
import { EventList } from '@/components/event/event-list'
import { EventPanel } from '@/components/event/event-panel'
import { EventScrollAnchor } from '@/components/event/event-scroll-anchor'
import { Event, MessageEvent } from '@/lib/event-types'
import { CompanionResponseCompletionCallback, useQueryCompanion } from '@/lib/hooks/use-companion'
import { cn } from '@/lib/utils'
import { useCallback, useState } from 'react'
import { toast } from 'react-hot-toast'
import { AssistantDraftProps } from '../companion/companion-draft'

const IS_PREVIEW = process.env.VERCEL_ENV === 'preview'
export interface ChatProps extends React.ComponentProps<'div'> {
  events: Event[]
  eventsError?: string
}

export function EventWindow({ className, events, eventsError }: ChatProps) {
  const onCompanionResponseCompleted = useCallback<CompanionResponseCompletionCallback>((creationUtcMillis, content) => {
    addEvent<MessageEvent>({
      type: 'message',
      role: 'assistant',
      creationUtcMillis,
      content
    })
      .catch(error => toast.error(`Failed to save assistant message: ${error}`))
  }, [])
  const regenerateResponse = useCallback(() => { toast.error("Regenerating responses is currently not supported") }, [])

  const [assistantContent, tools, isLoading, sendUserPrompt, stopResponding] = useQueryCompanion(onCompanionResponseCompleted)

  const [input, setInput] = useState('')

  const onSubmitUserMessage = useCallback(async (message: { content: string }) => {
    await addEvent<MessageEvent>({
      type: 'message',
      role: 'user',
      creationUtcMillis: Date.now(),
      content: message.content
    })

    sendUserPrompt(await getUserId(), message.content, await getAICompanionUrl())
  }, [sendUserPrompt])

  if (eventsError) {
    toast.error(`Failed to fetch feed: ${JSON.stringify(eventsError)}`)
  }

  const assistantDraft: AssistantDraftProps | undefined = (assistantContent || Object.keys(tools).length > 0) && { content: assistantContent, tools } || undefined

  return (
    <>
      <div className={cn('pt-4 md:pt-4 grow overflow-auto', className)}>
        {events.length ? (
          <>
            <EventList events={events} assistantDraft={assistantDraft} />
            <EventScrollAnchor trackVisibility={isLoading} />
          </>
        ) : (
          <EmptyScreen setInput={setInput} />
        )}
      </div>
      <EventPanel
        events={events}
        input={input}
        setInput={setInput}
        onSubmitUserMessage={onSubmitUserMessage}
        isLoading={isLoading}
        stopResponding={stopResponding}
        regenerateResponse={regenerateResponse}
      />
    </>
  )
}
