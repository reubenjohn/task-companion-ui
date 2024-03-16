'use server'


import { getTasks } from '@/app/actions'
import { NewTaskBar } from './new-task-bar'
import { TaskCard } from './task-card'

const IS_PREVIEW = process.env.VERCEL_ENV === 'preview'

export interface TaskListProps extends React.ComponentProps<'div'> {
    initialTodos?: string[]
    id?: string
}

export async function TaskList({ id, initialTodos, className }: TaskListProps) {
    const tasks = await getTasks();

    return (
        <div className='p-4'>
            <h1 className='text-lg font-semibold m-2'>Tasks</h1>
            <ol>
                {tasks && tasks.map(task =>
                    <TaskCard key={task.id} task={task} />)}
            </ol>
            <NewTaskBar></NewTaskBar>
        </div>
    )
}
