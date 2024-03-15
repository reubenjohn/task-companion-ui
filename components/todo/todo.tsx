'use client'

import { useChat, type Message } from 'ai/react'

import { ChatList } from '@/components/chat-list'
import { ChatPanel } from '@/components/chat-panel'
import { ChatScrollAnchor } from '@/components/chat-scroll-anchor'
import { EmptyScreen } from '@/components/empty-screen'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog'
import { useLocalStorage } from '@/lib/hooks/use-local-storage'
import { cn } from '@/lib/utils'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { Button } from '../ui/button'
import { Input } from '../ui/input'

const IS_PREVIEW = process.env.VERCEL_ENV === 'preview'

export interface TaskProps extends React.ComponentProps<'div'> {
    key: string
    title: string
}

export function Task({ key, title }: TaskProps) {
    return (
        <li key={key} className='flex rounded-lg border bg-background p-2 my-2'>
            <input type='checkbox' className='m-2'></input>
            <span className='input' role='textbox' contentEditable style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</span>
        </li>
    );
}

export interface ChatProps extends React.ComponentProps<'div'> {
    initialTodos?: string[]
    id?: string
}

export function Todo({ id, initialTodos, className }: ChatProps) {
    const router = useRouter()
    const path = usePathname()
    const [todos, setTodos] = useLocalStorage<string[] | undefined>(
        'ai-token',
        ['todo1', 'todo2']
    )
    // const todos = ['asd', 'def']
    return (
        <div className='p-4'>
            <h1 className='text-lg font-semibold m-2'>Tasks</h1>
            <ol>
                {todos && todos.map(todo => <Task key={todo} title={todo} />)}
            </ol>
        </div>
    )
}
