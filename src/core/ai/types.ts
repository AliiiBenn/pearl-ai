export type Model = {
    displayName: string 
    name: string
}

export const availableModels: Model[] = [
    {name: "deepseek/deepseek-chat-v3-0324:free", displayName: "DeepSeek V3 (free)"},
    {name: "deepseek/deepseek-r1-0528:free", displayName: "DeepSeek R1 (free)"}
]