// Inspired by Chatbot-UI and modified to fit the needs of this project
// @see https://github.com/mckaywrigley/chatbot-ui/blob/main/components/Chat/ChatMessage.tsx


import { IconPlus } from '@/components/ui/icons'
import { CreateTaskEvent } from '@/lib/event-types'
import { TaskState } from '@/lib/types'

export interface TaskEventRowProps {
  event: CreateTaskEvent
}

export function TaskEventRow({ event: { creationUtcMillis, task: { title, state } } }: TaskEventRowProps) {
  const timestamp = new Date(creationUtcMillis);
  return (
    <div>
      <div className='flex flex-row'>
        <div><div className='border rounded-lg p-2 bg-background'>📜</div></div>
        <div className='flex flex-col w-full m-2'>
          <h2 className=''>Task Created</h2>
          <p className='dark:prose-invert prose prose-p:leading-relaxed prose-pre:p-0'>
            {timestamp.toLocaleDateString()} {timestamp.toLocaleTimeString()}
          </p>
          <div className='flex grow w-full rounded-lg border shadow-sm background bg-background p-2'>
            <input type='checkbox' className='m-2' checked={state == TaskState.COMPLETED} />
            <span className='flex grow input px-2 focus:outline-0' role='textbox' contentEditable
              style={{ overflow: 'hidden', textOverflow: 'ellipsis', alignItems: 'center' }}>{title}</span>
          </div>
        </div>
      </div>

    </div>
  )
}
