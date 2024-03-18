'use server'

import { kv } from '@vercel/kv'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { auth } from '@/auth'
import { CreateTaskEvent, DeleteTask, DraftEvent, Event, UpdateTask } from '@/lib/event-types'
import { NewTaskData, Task, TaskPriority, TaskState } from '@/lib/task-types'
import { type Chat } from '@/lib/types'

export async function getChats(userId?: string | null) {
  if (!userId) {
    return []
  }

  try {
    const pipeline = kv.pipeline()
    const chats: string[] = await kv.zrange(`user:chat:${userId}`, 0, -1, { rev: true })

    for (const chat of chats) {
      pipeline.hgetall(chat)
    }

    const results = await pipeline.exec()

    return results as Chat[]
  } catch (error) {
    return []
  }
}

type UserId = string

async function getUserId(): Promise<UserId> {
  const userId = (await auth())?.user.id
  if (!userId) { throw new Error("No user ID. Is the user authenticated?") }
  return userId
}

const getTaskListKey = (userId: UserId) => `user:tasklist:${userId}:default`
const getTaskKey = (taskId: Event['id']) => `task:${taskId}`

type KVPipeline = ReturnType<typeof kv.multi>

export async function addTask(taskData: NewTaskData) {
  const userId = await getUserId()

  const taskListKey = getTaskListKey(userId)
  const taskKey = getTaskKey(crypto.randomUUID())
  const task: Task = {
    id: taskKey,
    title: taskData.title,
    state: 'pending',
    priority: taskData.priority as number
  }

  const transaction = kv.multi()
  console.log(`User '${userId}' Creating new task '${JSON.stringify(task)}'`)
  transaction.hset(taskKey, task)
  console.log(`User '${userId}' adding task '${taskKey}' to list ${taskListKey}`)
  transaction.zadd(taskListKey, { score: task.priority, member: taskKey })

  const event: DraftEvent<CreateTaskEvent> = {
    type: "create-task",
    creationUtcMillis: -1,
    task
  }
  const resultHandler = await addEventToPipeline(event, transaction)

  const [createTaskResult, addToListResult, addEventResult]: [number | null, number | null, number | null]
    = await transaction.exec()

  if (createTaskResult == 0) { throw new Error(`Failed to create task`) }
  if (addToListResult != 1) { throw new Error(`Failed to add task to list`) }
  resultHandler(addEventResult)

  revalidatePath("/")
  return task
}

export async function getTasks(): Promise<Task[]> {
  const userId = await getUserId()

  try {
    const taskListKey = getTaskListKey(userId);
    console.log(`User '${userId}' fetching tasklist ${taskListKey}`);
    const taskKeys: string[] = await kv.zrange(taskListKey, TaskPriority.Unknown, TaskPriority.Obsolete, { byScore: true })

    console.log(`User '${userId}' found ${taskKeys.length} task IDs in tasklist ${taskListKey}`)
    if (taskKeys.length == 0) { return []; }

    const pipeline = kv.pipeline()
    for (const taskKey of taskKeys) {
      pipeline.hgetall(taskKey)
    }
    const results = (await pipeline.exec()).filter(task => task) as Task[]
    console.log(`User '${userId}' fetched ${results.length} tasks from tasklist ${taskListKey}`)

    return results
  } catch (error) {
    return []
  }
}

export async function deleteTask(task: Task) {
  const userId = await getUserId()
  const taskId = task.id;

  const taskListKey = getTaskListKey(userId)
  console.log(`User '${userId}' deleting task '${taskId}' from tasklist '${taskListKey}'`);

  const transaction = kv.multi()
  transaction.zrem(taskListKey, taskId)
  transaction.del(taskId)
  const event: DraftEvent<DeleteTask> = {
    type: 'delete-task',
    creationUtcMillis: -1,
    task,
  };
  const resultHandler = await addEventToPipeline(event, transaction)
  const [removeFromTaskListResult, deleteTaskResult, addEventResult] =
    await transaction.exec<[number, number, number | null]>()
  console.log(`User '${userId}' deleted task ${taskId} with 
    remFromTaskListResult=${removeFromTaskListResult}, delTaskResult=${deleteTaskResult}`)
  if (removeFromTaskListResult != 1) { throw new Error("Failed to remove task from list") }
  if (deleteTaskResult != 1) { throw new Error("Failed to delete task") }
  resultHandler(addEventResult)
  revalidatePath("/")
}

export async function toggleTask(taskData: Task, newState: TaskState) {
  if (taskData.state == newState) { throw new Error(`Task is already in ${newState} state`) }

  const userId = await getUserId()

  const taskListKey = getTaskListKey(userId)
  const taskKey = taskData.id

  const task: Task = {
    id: taskKey,
    title: taskData.title,
    state: newState,
    priority: taskData.priority
  }

  const transaction = kv.multi()
  console.log(`User '${userId}' modifying task '${JSON.stringify(task)}'`)
  transaction.hset(taskKey, task)

  const event: DraftEvent<UpdateTask> = {
    type: "update-task",
    creationUtcMillis: -1,
    task,
    previousValues: { state: taskData.state }
  }
  const resultHandler = await addEventToPipeline(event, transaction)

  const [nAddedFields, addEventResult]: [number | null, number | null, number | null]
    = await transaction.exec()

  if (nAddedFields && nAddedFields > 0) { throw new Error(`Unexpectedly added new fields to task`) }
  resultHandler(addEventResult)

  revalidatePath("/")
  return task
}

const getFeedKey = (userId: string) => `user:feed:${userId}:default`

export async function addEvent(eventData: DraftEvent<Event>) {
  const pipeline = kv.pipeline()
  const handleResult = await addEventToPipeline(eventData, pipeline)
  const [result]: [number | null] = await pipeline.exec()
  return handleResult(result)
}

export async function addEventToPipeline(
  eventData: DraftEvent<Event>,
  pipeline: KVPipeline
): Promise<(result: number | null) => Event> {
  const userId = await getUserId()

  const feedKey = getFeedKey(userId)
  const event = { ...eventData, creationUtcMillis: Date.now() } as Event;

  console.log(`User '${userId}' adding event '${JSON.stringify(event)}' to list ${feedKey}`)
  const scoreMember = { score: event.creationUtcMillis, member: JSON.stringify(event) }
  const handleResult = (result: number | null) => {
    if (result != 1) { throw new Error("Failed to add event to feed") }
    revalidatePath("/")
    return event
  }

  pipeline.zadd(feedKey, scoreMember)
  return handleResult
}

export async function getFeed(startIndex: number = 0, endIndex: number = 20): Promise<Event[]> {
  const userId = await getUserId()

  const feedKey = getFeedKey(userId)
  console.log(`User '${userId}' fetching feed '${feedKey}'`);
  const eventJsons: Event[] = await kv.zrange(feedKey, startIndex, endIndex, { rev: true })

  console.log(`User '${userId}' found ${eventJsons.length} events in feed '${feedKey}'`)
  if (eventJsons.length == 0) {
    return [];
  }

  const events: Event[] = eventJsons.filter(json => json);
  console.log(`User '${userId}' parsed ${events.length} events from feed '${feedKey}'`)

  return events
}

export async function getChat(id: string, userId: string) {
  const chat = await kv.hgetall<Chat>(`chat:${id}`)

  if (!chat || (userId && chat.userId !== userId)) {
    return null
  }

  return chat
}

export async function removeChat({ id, path }: { id: string; path: string }) {
  const session = await auth()

  if (!session) {
    return {
      error: 'Unauthorized'
    }
  }

  //Convert uid to string for consistent comparison with session.user.id
  const uid = String(await kv.hget(`chat:${id}`, 'userId'))

  if (uid !== session?.user?.id) {
    return {
      error: 'Unauthorized'
    }
  }

  await kv.del(`chat:${id}`)
  await kv.zrem(`user:chat:${session.user.id}`, `chat:${id}`)

  revalidatePath('/')
  return revalidatePath(path)
}

export async function clearChats() {
  const session = await auth()

  if (!session?.user?.id) {
    return {
      error: 'Unauthorized'
    }
  }

  const chats: string[] = await kv.zrange(`user:chat:${session.user.id}`, 0, -1)
  if (!chats.length) {
    return redirect('/')
  }
  const pipeline = kv.pipeline()

  for (const chat of chats) {
    pipeline.del(chat)
    pipeline.zrem(`user:chat:${session.user.id}`, chat)
  }

  await pipeline.exec()

  revalidatePath('/')
  return redirect('/')
}

export async function getSharedChat(id: string) {
  const chat = await kv.hgetall<Chat>(`chat:${id}`)

  if (!chat || !chat.sharePath) {
    return null
  }

  return chat
}

export async function shareChat(id: string) {
  const session = await auth()

  if (!session?.user?.id) {
    return {
      error: 'Unauthorized'
    }
  }

  const chat = await kv.hgetall<Chat>(`chat:${id}`)

  if (!chat || chat.userId !== session.user.id) {
    return {
      error: 'Something went wrong'
    }
  }

  const payload = {
    ...chat,
    sharePath: `/share/${chat.id}`
  }

  await kv.hmset(`chat:${chat.id}`, payload)

  return payload
}
