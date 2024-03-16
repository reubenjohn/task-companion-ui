import { Task } from './types';

export enum EventType {
    CreateTask,
    DeleteTask,
    ModifyTask,

    UserMessage,
}

export interface EventBase extends Record<string, any> {
    type: EventType
    creationUtcMillis: number
}
export enum TaskActionType {
    Create,
    Delete,
    Modify
}
export interface CreateTask extends EventBase {
    type: EventType.CreateTask
    taskId: Task['id']
}
export interface DeleteTask extends EventBase {
    type: EventType.DeleteTask
    taskId: Task['id']
}

export interface ModifyTask extends EventBase {
    type: EventType.ModifyTask
    taskId: Task['id']
    modification: Record<string, any>
}

export enum MessageRole {
    System,
    User,
    Assistant
}

export interface MessageEvent extends EventBase {
    type: EventType.UserMessage
    role: MessageRole
    content: string
}

export type Event = CreateTask | DeleteTask | ModifyTask | MessageEvent
