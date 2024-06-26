'use server'

import { kv } from '@vercel/kv'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { auth } from '@/auth'
import { CreateTaskEvent, DeleteTask, DraftEvent, Event, UpdateTask } from '@/lib/event-types'
import { NewTaskData, Task, TaskState } from '@/lib/task-types'
import { type Chat } from '@/lib/types'
import { env } from 'process'


export async function getAICompanionUrl(): Promise<string> {
  return env["AI_WEBSOCKET_API_URL"] || ''
}

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

export async function getUserId(): Promise<UserId> {
  const userId = (await auth())?.user.id
  if (!userId) { throw new Error("No user ID. Is the user authenticated?") }
  return userId
}

const getTaskListKey = (userId: UserId) => `user:tasklist:${userId}:default`

type KVPipeline = ReturnType<typeof kv.multi>

export async function addTask(taskData: NewTaskData) {
  const userId = await getUserId()

  const taskListKey = getTaskListKey(userId)
  const taskKey = new Date().getTime() + Math.random()
  const creationUtcMillis = Date.now()
  const task: Task = {
    id: taskKey,
    title: taskData.title,
    state: 'pending',
    priority: taskData.priority as number,
    eventKeys: [creationUtcMillis]
  }

  const transaction = kv.multi()
  console.log(`User '${userId}' adding task '${JSON.stringify(task)}' to list ${taskListKey}`)
  transaction.zadd(taskListKey, { score: task.id, member: JSON.stringify(task) })

  const event: CreateTaskEvent = {
    type: "create-task",
    creationUtcMillis,
    task
  }
  const resultHandler = await addEventToPipeline(event, transaction)

  const [createTaskResult, addEventResult]: [number | null, number | null]
    = await transaction.exec()

  if (createTaskResult == 0) { throw new Error(`Failed to create task`) }
  resultHandler(addEventResult)

  revalidatePath("/")
  return task
}

export async function getTasks(): Promise<Task[]> {
  const userId = await getUserId()

  try {
    const taskListKey = getTaskListKey(userId);
    console.log(`User '${userId}' fetching tasklist ${taskListKey}`);
    const tasks: Task[] = await kv.zrange(taskListKey, 0, 100)
    const results = tasks.filter(task => task)
    console.log(`User '${userId}' parsed ${results.length} tasks from tasklist ${taskListKey}`)

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
  transaction.zremrangebyscore(taskListKey, taskId, taskId)
  const event: DeleteTask = {
    type: 'delete-task',
    creationUtcMillis: Date.now(),
    task,
  };
  const resultHandler = await addEventToPipeline(event, transaction)
  const [deleteTaskResult, addEventResult] =
    await transaction.exec<[number, number | null]>()
  console.log(`User '${userId}' deleted task ${taskId} with delTaskResult=${deleteTaskResult}`)
  if (deleteTaskResult != 1) { throw new Error("Failed to delete task") }
  resultHandler(addEventResult)
  revalidatePath("/")
}

export async function toggleTask(taskData: Task, newState: TaskState) {
  if (taskData.state == newState) { throw new Error(`Task is already in ${newState} state`) }

  const userId = await getUserId()

  const taskListKey = getTaskListKey(userId)
  const taskId = taskData.id

  const creationUtcMillis = Date.now()
  const task: Task = {
    ...taskData,
    state: newState,
    eventKeys: [...taskData.eventKeys, creationUtcMillis]
  }

  const transaction = kv.multi()
  console.log(`User '${userId}' modifying task '${JSON.stringify(task)}'`)
  transaction.zremrangebyscore(taskListKey, taskId, taskId)
  transaction.zadd(taskListKey, { score: taskId, member: JSON.stringify(task) })

  const event: UpdateTask = {
    type: "update-task",
    creationUtcMillis,
    task,
    previousValues: { state: taskData.state }
  }
  const resultHandler = await addEventToPipeline(event, transaction)

  const [removePreviousResult, addTaskResult, addEventResult]: [number | null, number | null, number | null]
    = await transaction.exec()

  if (removePreviousResult != 1) { throw new Error(`Task did not exist`) }
  if (addTaskResult != 1) { throw new Error(`Updated task was not created`) }
  resultHandler(addEventResult)

  revalidatePath("/")
  return task
}

const getFeedKey = (userId: string) => `user:feed:${userId}:default`

export async function addEvent<T extends Event>(eventData: T) {
  const pipeline = kv.pipeline()
  const handleResult = await addEventToPipeline(eventData, pipeline)
  const [result]: [number | null] = await pipeline.exec()
  return handleResult(result)
}

export async function addEventToPipeline(
  event: Event,
  pipeline: KVPipeline
): Promise<(result: number | null) => Event> {
  const userId = await getUserId()

  const feedKey = getFeedKey(userId)

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
