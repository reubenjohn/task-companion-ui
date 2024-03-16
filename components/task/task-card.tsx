import { Task, TaskState } from '@/lib/types';

export interface TaskProps extends React.ComponentProps<'div'> {
    task: Task
}

export function TaskCard({ task: { id, title, state } }: TaskProps) {
    return (
        <li className='flex rounded-lg border bg-background p-2 my-2'>
            <input type='checkbox' className='m-2' checked={state == TaskState.COMPLETED} />
            <span className='input' role='textbox' contentEditable style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</span>
        </li>
    );
}

