import { type Message } from 'ai'

import { ChatMessage } from '@/components/chat-message'
import { Separator } from '@/components/ui/separator'
import { Event, EventType } from '@/lib/event-types'

export interface EventRowProps {
  event: Event
}

export function EventRow({ event }: EventRowProps) {
  switch (event.type) {
    case 'message':
      return <ChatMessage event={event} />
    default:
      return JSON.stringify(event)
  }
}

export interface ChatListProps {
  events: Event[]
}

export function ChatList({ events }: ChatListProps) {
  if (!events.length) {
    return null
  }

  return (
    <div className="relative mx-auto max-w-2xl px-4">
      {events.toReversed().map((event, index) => (
        <div key={index}>
          <EventRow event={event} />
          {index < events.length - 1 && (
            <Separator className="my-2 md:my-4" />
          )}
        </div>
      ))}
    </div>
  )
}
