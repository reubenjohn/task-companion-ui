'use server'

import { kv } from '@vercel/kv'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { auth } from '@/auth'
import { NewTaskData, Task, TaskState, type Chat } from '@/lib/types'

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

export async function createNewTask(taskData: NewTaskData) {
  const userId = (await auth())?.user.id

  const taskListId = `user:tasklist:${userId}:default`;
  const taskId = `task:${crypto.randomUUID()}`;
  const newTask: Task = {
    id: taskId,
    title: taskData.title,
    state: TaskState.PENDING,
    priority: taskData.priority as number
  };

  const transaction = kv.multi()
  console.log(`User '${userId}' Creating new task '${JSON.stringify(newTask)}'`)
  transaction.hset(taskId, newTask)
  console.log(`User '${userId}' adding task '${taskId}' to list ${taskListId}`)
  transaction.zadd(taskListId, { score: newTask.priority, member: taskId })
  const results = await transaction.exec()
  revalidatePath("/")
  return newTask
}

export async function getTasks(): Promise<Task[]> {
  const userId = (await auth())?.user.id;

  try {
    const taskListId = `user:tasklist:${userId}:default`;
    console.log(`User '${userId}' fetching tasklist ${taskListId}`);
    const taskIds: string[] = await kv.zrange(taskListId, 0, -1, { rev: true })

    console.log(`User '${userId}' found ${taskIds.length} task IDs in tasklist ${taskListId}`)
    if (taskIds.length == 0) {
      return [];
    }

    const pipeline = kv.pipeline()
    for (const taskId of taskIds) {
      pipeline.hgetall(taskId)
    }
    const results = (await pipeline.exec()).filter(task => task) as Task[]
    console.log(`User '${userId}' fetched ${results.length} tasks from tasklist ${taskListId}`)

    return results
  } catch (error) {
    return []
  }
}

export async function deleteTask(taskId: string): Promise<boolean> {
  const userId = (await auth())?.user.id;

  try {
    const taskListId = `user:tasklist:${userId}:default`;
    console.log(`User '${userId}' deleting task '${taskId}' from tasklist '${taskListId}'`);

    const transaction = kv.multi()
    transaction.zrem(taskListId, taskId)
    transaction.del(taskId)
    const results = await transaction.exec<[number, number]>()
    console.log(`User '${userId}' deleted task ${taskId} with result: ${results}`)
    revalidatePath("/")
    return (results[0] + results[1]) >= 2
  } catch (error) {
    return false
  }
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
