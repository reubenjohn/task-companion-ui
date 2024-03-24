import { Event } from '@/lib/event-types';
import { MessageEventRow } from './message-event-row';
import { TaskEventRow } from './task-event-row';
import { TaskEventUpdateRow } from './task-event-update-row';


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
