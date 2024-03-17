// Inspired by Chatbot-UI and modified to fit the needs of this project
// @see https://github.com/mckaywrigley/chatbot-ui/blob/main/components/Chat/ChatMessage.tsx


import { UpdateTask } from '@/lib/event-types';
import { TaskState } from '@/lib/types';
import { IconEdit, IconTrash } from '../ui/icons';

export interface TaskEventUpdateRowProps {
  event: UpdateTask
}

export function TaskEventUpdateRow({ event: { type, creationUtcMillis, task: { title, state } } }: TaskEventUpdateRowProps) {
  const timestamp = new Date(creationUtcMillis);
  return (
    <div>
      <div className='flex flex-row'>
        <div>
          <div className='border rounded-lg p-2 bg-muted-background'>
            <IconEdit />
          </div>
        </div>
        <div className='flex flex-col w-full mx-2'>

          <h2 className=''>Task Updated</h2>
          <p className='text-sm dark:prose-invert prose prose-p:leading-relaxed prose-pre:p-0'>
            {timestamp.toLocaleDateString()} {timestamp.toLocaleTimeString()}
          </p>

          <div className='flex grow w-full rounded-lg border shadow-sm background bg-background p-2 mt-1'>
            <input type='checkbox' className='m-2' checked={state == 'completed'} />
            <span className='flex grow input px-2 focus:outline-0' role='textbox' contentEditable
              style={{ overflow: 'hidden', textOverflow: 'ellipsis', alignItems: 'center' }}>{title}</span>
          </div>
        </div>
      </div>

    </div>
  )
}
