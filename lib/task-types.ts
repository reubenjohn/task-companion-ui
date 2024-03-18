
export type TaskState = 'pending' | 'completed';

export enum TaskPriority {
    Unknown,
    Critical,
    High,
    Medium,
    Low,
    Obsolete = 99
}

export interface NewTaskData extends Record<string, any> {
    title: string;
    priority: TaskPriority;
}

export interface Task extends Record<string, any> {
    id: number;
    title: string;
    state: TaskState;
}
