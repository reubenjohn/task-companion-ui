'use server'

import { getTasks } from '@/app/actions'
import { NewTaskForm } from './new-task-form'
import { NewTaskFormElements } from './new-task-form-elements'
import { TaskCard } from './task-card'


export interface TaskListProps extends React.ComponentProps<'div'> {
}

export async function TaskList({ }: TaskListProps) {
    const tasks = await getTasks();

    return (
        <div className='p-4'>
            <h1 className='text-lg font-semibold m-2'>Tasks</h1>
            <ol>
                {tasks && tasks.map(task =>
                    <TaskCard key={task.id} task={task} />)}
            </ol>
            <NewTaskForm>
                <NewTaskFormElements />
            </NewTaskForm>
        </div>
    )
}
