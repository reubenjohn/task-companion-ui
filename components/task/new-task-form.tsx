"use client"

import { addTask } from "@/app/actions";
import { TaskPriority } from "@/lib/types";
import toast from "react-hot-toast";

export interface NewTaskBarProps extends React.ComponentProps<'div'> {
    children: React.ReactNode
}

export function NewTaskForm({ children }: NewTaskBarProps) {
    async function onCreateTask(formData: FormData) {
        const title = (formData.get('title')?.valueOf() as string).trim() || ""
        if (!title) {
            toast.error("Cannot create a task without a title")
            return
        }
        await addTask({ title, priority: TaskPriority.Unknown })
    }
    return (
        <form action={onCreateTask} className='flex row my-2 justify-center'>
            {children}
        </form>
    )
}
