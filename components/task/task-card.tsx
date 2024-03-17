"use client"

import { Task, TaskState } from '@/lib/types';
import { buttonVariants } from '../ui/button';
import { cn } from '@/lib/utils';
import { IconTrash } from '../ui/icons';
import { deleteTask, toggleTask } from '@/app/actions';

export interface TaskProps extends React.ComponentProps<'div'> {
    task: Task
}

export function TaskCard({ task }: TaskProps) {
    async function onDeleteTask(e: React.MouseEvent<HTMLButtonElement>) {
        e.preventDefault()
        await deleteTask(task)
    }
    async function onToggleTask(e: React.ChangeEvent<HTMLInputElement>) {
        e.preventDefault()
        toggleTask(task, e.target.checked ? 'completed' : 'pending')
    }
    return (
        <li className='flex rounded-lg border shadow bg-background p-2 my-2'>
            <input type='checkbox' className='m-2' onChange={onToggleTask} checked={task.state == 'completed'} />
            <span className='flex grow input px-2 focus:outline-0' role='textbox' contentEditable
                style={{ overflow: 'hidden', textOverflow: 'ellipsis', alignItems: 'center' }}>{task.title}</span>

            <button onClick={onDeleteTask}
                className={`${cn(buttonVariants({ variant: 'outline', size: 'icon' }))} left-0 top-4 rounded-full bg-background p-0 sm:left-4`}
                style={{ color: 'red' }}>
                <IconTrash />
            </button>
        </li>
    );
}

