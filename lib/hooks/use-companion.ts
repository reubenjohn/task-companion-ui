import { addEvent } from "@/app/actions"
import { ToolsUse } from "@/components/companion/collapsible-tools-use"
import { useCallback, useState } from "react"
import toast from "react-hot-toast"
import { DraftEvent, MessageEvent } from "../event-types"

export type SendUserPromptCallback = (userId: string, userMessageContent: string) => void
export type StopRespondingCallback = () => void
export type CompanionResponseCompletionCallback = (content: string) => void

export function useCompanion(onResponseCompleted: CompanionResponseCompletionCallback): [string, ToolsUse, boolean, SendUserPromptCallback, StopRespondingCallback] {
    const [webSocket, setWebSocket] = useState<WebSocket | undefined>(undefined)
    const [assistantContent, setAssistantContent] = useState('')
    const [tools, setTools] = useState<ToolsUse>({})

    const stopResponding = useCallback(() => {
        webSocket?.send(JSON.stringify({ command: 'close' }))
    }, [webSocket])

    const sendUserPrompt = (userId: string, userMessageContent: string) => {
        setWebSocket(undefined)
        setAssistantContent('')
        setTools({})

        const wsOrigin = `${window.location.protocol === 'http:' ? 'ws:' : 'wss:'}//${window.location.host}`;
        const newWebSocket = new WebSocket(new URL(`${wsOrigin}/api/ai/companion/chat/${userId}`))

        newWebSocket.onopen = (_) =>
            newWebSocket.send(JSON.stringify({ command: 'respond', payload: { 'user_id': 4802052, user_input: userMessageContent } }));

        newWebSocket.onmessage = ({ data }) => {
            if (data.startsWith('on_tool_start|')) {
                const payload = JSON.parse(data.substring('on_tool_start|'.length))
                setTools(tools => ({ ...tools, [payload.runId]: { runId: payload.runId, name: payload.toolName, inputs: payload.input } }))
            } else if (data.startsWith('on_tool_end|')) {
                const payload = JSON.parse(data.substring('on_tool_end|'.length))
                setTools(tools => ({ ...tools, [payload.runId]: { ...tools[payload.runId], outputs: payload.output } }))
            } else if (data.startsWith('|')) {
                const tokens = data.substring(1);
                setAssistantContent(content => content + tokens)
            }
        }

        newWebSocket.onclose = async (_) => setWebSocket(undefined)

        setWebSocket(newWebSocket)
    }


    if (!webSocket && assistantContent) {
        onResponseCompleted(assistantContent)
        setAssistantContent('')
    }

    const isLoading = !!webSocket;

    return [assistantContent, tools, isLoading, sendUserPrompt, stopResponding]
}