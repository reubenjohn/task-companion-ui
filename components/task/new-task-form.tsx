"use client"

import { addTask } from "@/app/actions";
import { TaskPriority } from '@/lib/task-types';
import { cn } from "@/lib/utils";
import { ChangeEvent, useCallback, useState } from "react";
import toast from "react-hot-toast";
import { BarLoader, BounceLoader } from "react-spinners";
import { buttonVariants } from "../ui/button";
import { IconPlus } from "../ui/icons";

export interface NewTaskBarProps extends React.ComponentProps<'div'> {
}

export function NewTaskForm({ }: NewTaskBarProps) {
    const [title, setTitle] = useState('')
    const [isLoading, setLoading] = useState(false)
    const onTitleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => setTitle(e.target.value), [setTitle])

    async function onCreateTask(formData: FormData) {
        setLoading(true)

        const title = (formData.get('title')?.valueOf() as string).trim() || ""
        if (!title) {
            toast.error("Cannot create a task without a title")
            return
        }
        await addTask({ title, priority: TaskPriority.unknown })

        await new Promise(r => setTimeout(r, 1000))
        setLoading(false)
        setTitle('')
    }

    return (
        <form action={onCreateTask} className="flex flex-col justify-center">
            <div className="flex row w-full my-2 justify-center">
                <div className='grow rounded-lg border bg-background p-2'>
                    <input type='text' name='title' value={title} placeholder="Type to add a new task..." onChange={onTitleChange} disabled={isLoading}
                        className='w-full grow h-8 px-2 focus:outline-0' />
                </div>
                <button disabled={isLoading}
                    className={`${cn(buttonVariants({ variant: 'outline', size: 'sm' }))} left-0 top-4 rounded-full bg-background p-0 sm:left-4 m-2`}>
                    {isLoading ? <BounceLoader color="#36d7b7" size={'16px'} /> : <IconPlus />}
                </button>
            </div>
            <BarLoader color="#36d7b7" loading={isLoading} width={'100%'} />
        </form>
    )
}
