import { ToolsUse } from "@/components/companion/collapsible-tools-use"
import { useCallback, useState } from "react"
import toast from "react-hot-toast"

export type SendUserPromptCallback = (userId: string, userMessageContent: string, companionUrl: string) => void
export type StopRespondingCallback = () => void
export type CompanionResponseCompletionCallback = (creationUtcMillis: number, content: string) => void

export function queryCompanion(onResponseCompleted: CompanionResponseCompletionCallback): [string, ToolsUse, boolean, SendUserPromptCallback, StopRespondingCallback] {
    const [webSocket, setWebSocket] = useState<WebSocket | undefined>(undefined)
    const [assistantContent, setAssistantContent] = useState('')
    const [creationUtcMillis, setCreationUtcMillis] = useState<number | null>(null)
    const [tools, setTools] = useState<ToolsUse>({})

    const stopResponding = useCallback(() => {
        webSocket?.send(JSON.stringify({ command: 'close' }))
    }, [webSocket])

    const sendUserPrompt = (userId: string, userMessageContent: string, companionUrl: string) => {
        setWebSocket(undefined)
        setAssistantContent('')
        setTools({})

        const newWebSocket = new WebSocket(new URL(`${companionUrl}/companion/chat/${userId}`))

        newWebSocket.onopen = (_) =>
            newWebSocket.send(JSON.stringify({ command: 'respond', payload: { user_input: userMessageContent } }));

        newWebSocket.onmessage = ({ data }) => {
            if (data.startsWith('message_time|')) {
                setCreationUtcMillis(data.substring('message_time|'.length))
            } else if (data.startsWith('on_tool_start|')) {
                const payload = JSON.parse(data.substring('on_tool_start|'.length))
                setTools(tools => ({ ...tools, [payload.runId]: { runId: payload.runId, name: payload.toolName, inputs: payload.input } }))
            } else if (data.startsWith('on_tool_end|')) {
                const payload = JSON.parse(data.substring('on_tool_end|'.length))
                setTools(tools => ({ ...tools, [payload.runId]: { ...tools[payload.runId], outputs: payload.output } }))
            } else if (data.startsWith('|')) {
                const tokens = data.substring(1)
                setAssistantContent(content => content + tokens)
            } else if (data.startsWith('error|')) {
                const message = data.substring('error|'.length)
                toast.error(message)
            }
        }

        newWebSocket.onclose = async (_) => setWebSocket(undefined)

        setWebSocket(newWebSocket)
    }


    if (!webSocket && assistantContent) {
        if (creationUtcMillis == null) {
            throw new Error(`Assistant response completed but no creation timestamp was received`)
        }
        onResponseCompleted(creationUtcMillis, assistantContent)
        setAssistantContent('')
    }

    const isLoading = !!webSocket;

    return [assistantContent, tools, isLoading, sendUserPrompt, stopResponding]
}