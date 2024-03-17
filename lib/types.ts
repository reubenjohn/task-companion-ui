import { type Message } from 'ai'

export type TaskState = 'pending' | 'completed'

export enum TaskPriority {
  Unknown,
  Critical,
  High,
  Medium,
  Low,
  Obsolete = 99
}

export interface NewTaskData extends Record<string, any> {
  title: string
  priority: TaskPriority
}

export interface Task extends Record<string, any> {
  id: string
  title: string
  state: TaskState
}

export interface Chat extends Record<string, any> {
  id: string
  title: string
  createdAt: Date
  userId: string
  path: string
  messages: Message[]
  sharePath?: string
}

export type ServerActionResult<Result> = Promise<
  | Result
  | {
    error: string
  }
>
