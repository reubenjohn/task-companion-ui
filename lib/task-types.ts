import { EventBase } from "./event-types";

export type TaskState = 'pending' | 'completed';

export enum TaskPriority {
    unknown,
    critical,
    high,
    medium,
    low,
    obsolete = 99
}

export interface NewTaskData extends Record<string, any> {
    title: string;
    priority: TaskPriority;
}

export interface Task extends Record<string, any> {
    id: number;
    title: string;
    state: TaskState;
    eventKeys: EventBase['creationUtcMillis'][],
}
