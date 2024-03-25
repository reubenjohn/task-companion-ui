'use client'

import { cn } from "@/lib/utils";
import { ChangeEvent, useCallback, useState } from "react";
import { buttonVariants } from "../ui/button";
import { IconPlus } from "../ui/icons";

export interface NewTaskBarProps extends React.ComponentProps<'div'> {
}

export function NewTaskFormElements({ }: NewTaskBarProps) {
    const [title, setTitle] = useState('')
    const onTitleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => setTitle(e.target.value), [setTitle])
    return (
        <>
            <div className='grow rounded-lg border bg-background p-2'>
                <input type='text' name='title' value={title} className='w-full grow h-8 px-2 focus:outline-0' placeholder="Type to add a new task..." onChange={onTitleChange} />
            </div>
            <button className={`${cn(buttonVariants({ variant: 'outline', size: 'sm' }))} left-0 top-4 rounded-full bg-background p-0 sm:left-4 m-2`}>
                <IconPlus />
            </button>
        </>
    )
}
