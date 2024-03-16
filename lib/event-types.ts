import { Task } from './types';

export type EventType = "create-task" | "delete-task" | "modify-task" | "message";

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

export interface ModifyTask extends EventBase {
    type: "modify-task"
    task: Task
    previousValues: Record<string, any>
}

export type MessageRole = "system" | "user" | "assistant"

export interface MessageEvent extends EventBase {
    type: "message"
    role: MessageRole
    content: string
}

export type Event = CreateTaskEvent | DeleteTask | ModifyTask | MessageEvent

export type DraftEvent<T> = T & { creationUtcMillis: -1 }
