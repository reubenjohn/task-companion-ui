'use server'

import { getTasks } from '@/app/actions'
import { NewTaskForm } from './new-task-form'
import { TaskCard } from './task-card'


export interface TaskListProps extends React.ComponentProps<'div'> {
}

export async function TaskList({ }: TaskListProps) {
    const tasks = await getTasks();
    const firstCompletedTaskIndex = tasks.findLastIndex(task => task.state != 'completed') + 1
    const activeTasks = tasks.slice(0, firstCompletedTaskIndex)
    const completedTasks = tasks.slice(firstCompletedTaskIndex)

    return (
        <div className='w-full max-w-2xl p-4'>
            <h1 className='text-lg font-semibold m-2'>Tasks</h1>
            <NewTaskForm />
            <div className='overflow-auto'>
                {activeTasks.length > 0 && <>
                    <div className='border mt-2 mb-8' />
                    <ol>
                        {activeTasks.map(task =>
                            <TaskCard key={task.id} task={task} />)}
                    </ol>
                </>}
                {completedTasks.length > 0 && <>
                    <div className='border my-4' />
                    <h1 className='text-lg font-semibold m-2'>Completed Tasks</h1>
                    <ol>
                        {completedTasks.map(task =>
                            <TaskCard key={task.id} task={task} />)}
                    </ol>
                </>}
            </div>
        </div>
    )
}
