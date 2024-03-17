import { kv } from '@vercel/kv'
import { OpenAIStream, StreamingTextResponse } from 'ai'
import OpenAI from 'openai'

import { addEvent } from '@/app/actions'
import { auth } from '@/auth'
import { DraftEvent, EventType, MessageEvent, MessageRole } from '@/lib/event-types'
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
      const messageEvent: DraftEvent<MessageEvent> = {
        type: 'message',
        role: 'system',
        creationUtcMillis: -1,
        content: completion
      }
      await addEvent(messageEvent)
    }
  })

  return new StreamingTextResponse(stream)
}
