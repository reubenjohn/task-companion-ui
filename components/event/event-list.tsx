
import { Separator } from '@/components/ui/separator'
import { Event } from '@/lib/event-types'
import { MessageEventRow } from './message-event-row'
import { TaskEventRow } from './task-event-row'
import { TaskEventUpdateRow } from './task-event-update-row'

export interface EventRowProps {
  event: Event
}

export function EventRow({ event }: EventRowProps) {
  switch (event.type) {
    case 'message':
      return <MessageEventRow event={event} />
    case 'create-task':
    case 'delete-task':
      return <TaskEventRow event={event} />
    case 'update-task':
      return <TaskEventUpdateRow event={event} />
    default:
      return JSON.stringify(event)
  }
}

export interface ChatListProps {
  events: Event[]
}

export function EventList({ events }: ChatListProps) {
  if (!events.length) {
    return null
  }

  return (
    <ol className="relative mx-auto max-w-2xl px-4">
      {events.toReversed().map((event, index) => (
        <li key={index}>
          <EventRow event={event} />
          {index < events.length - 1 && (
            <Separator className="my-2 md:my-4" />
          )}
        </li>
      ))}
    </ol>
  )
}
