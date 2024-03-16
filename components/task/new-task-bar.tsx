"use client"

import { createNewTask } from "@/app/actions";
import { cn } from "@/lib/utils";
import { buttonVariants } from "../ui/button";
import { IconPlus } from "../ui/icons";
import { TaskPriority } from "@/lib/types";
import toast from "react-hot-toast";

export interface NewTaskBarProps extends React.ComponentProps<'div'> {
}

export function NewTaskBar({ }: NewTaskBarProps) {
    async function onCreateTask(formData: FormData) {
        const title = (formData.get('title')?.valueOf() as string).trim() || ""
        if (!title) {
            toast.error("Cannot create a task without a title")
            return
        }
        await createNewTask({ title, priority: TaskPriority.Unknown })
    }
    return (
        <form action={onCreateTask} className='flex row my-2 justify-center'>
            <div className='grow rounded-lg border bg-background p-2'>
                <input type='text' name='title' className='w-full grow h-8' />
            </div>
            <button className={`${cn(buttonVariants({ variant: 'outline', size: 'sm' }))} left-0 top-4 rounded-full bg-background p-0 sm:left-4 m-2`}>
                <IconPlus />
            </button>
        </form>
    )
}
