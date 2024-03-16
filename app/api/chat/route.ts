import { kv } from '@vercel/kv'
import { OpenAIStream, StreamingTextResponse } from 'ai'
import OpenAI from 'openai'

import { addEvent } from '@/app/actions'
import { auth } from '@/auth'
import { EventType, MessageEvent, MessageRole } from '@/lib/event-types'
import { nanoid } from '@/lib/utils'

export const runtime = 'edge'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(req: Request) {
  const json = await req.json()
  const { messages, previewToken } = json
  const userId = (await auth())?.user.id

  if (!userId) {
    return new Response('Unauthorized', {
      status: 401
    })
  }

  if (previewToken) {
    openai.apiKey = previewToken
  }

  const res = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages,
    temperature: 0.7,
    stream: true
  })

  const stream = OpenAIStream(res, {
    async onCompletion(completion) {
      const title = json.messages[0].content.substring(0, 100)
      const id = json.id ?? nanoid()
      const createdAt = Date.now()
      const path = `/chat/${id}`
      const payload = {
        id,
        title,
        userId,
        createdAt,
        path,
        messages: [
          ...messages,
          {
            content: completion,
            role: 'assistant'
          }
        ]
      }
      await kv.hset(`chat:${id}`, payload)
      await kv.zadd(`user:chat:${userId}`, {
        score: createdAt,
        member: `chat:${id}`
      })

      const messageEvent: MessageEvent = {
        type: EventType.UserMessage,
        role: MessageRole.User,
        creationUtcMillis: createdAt ?? 0,
        content: completion
      }
      await addEvent(messageEvent)
    }
  })

  return new StreamingTextResponse(stream)
}
