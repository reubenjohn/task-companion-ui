import { Separator } from '@/components/ui/separator'
import { Event } from '@/lib/event-types'
import { AssistantDraft, AssistantDraftProps } from '../companion/companion-draft'
import { EventRow } from './event-row'

export interface ChatListProps {
  events: Event[]
  assistantDraft?: AssistantDraftProps;
}


export function EventList({ events, assistantDraft }: ChatListProps) {
  if (!events.length) {
    return null
  }

  return (
    <ol className="relative mx-auto max-w-2xl overflow-auto px-4 mb-8">
      {events.toReversed().map((event, index) => (
        <li key={index}>
          <EventRow event={event} />
          {(index < events.length - 1 || assistantDraft) && (
            <Separator className="my-2 md:my-4" />
          )}
        </li>
      ))}
      {assistantDraft && <li >
        <AssistantDraft {...assistantDraft} />
      </li>}
    </ol>
  )
}
