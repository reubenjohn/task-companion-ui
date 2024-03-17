import { Task } from './types';

export type EventType = "create-task" | "delete-task" | "update-task" | "message";

export interface EventBase extends Record<string, any> {
    type: EventType
    creationUtcMillis: number
}

export interface CreateTaskEvent extends EventBase {
    type: "create-task"
    task: Task
}

export interface DeleteTask extends EventBase {
    type: "delete-task"
    task: Task
}

export interface UpdateTask extends EventBase {
    type: "update-task"
    task: Task
    previousValues: Record<string, any>
}

export type MessageRole = "system" | "user" | "assistant"

export interface MessageEvent extends EventBase {
    type: "message"
    role: MessageRole
    content: string
}

export type Event = CreateTaskEvent | DeleteTask | UpdateTask | MessageEvent

export type DraftEvent<T> = T & { creationUtcMillis: -1 }
