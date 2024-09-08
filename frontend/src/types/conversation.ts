interface Conversation {
    id: string;
    name: string;
    ai_model: string;
}

interface ChatHistoryProps {
    conversations: Conversation[];
    onDeleteConversation: (id: string) => Promise<void>;
}

interface AIModel {
    id: string;
    name: string;
    provider: string;
    display_name: string;
    hint: string;
}

interface Message {
    role: 'user' | 'assistant';
    content: string;
    ai_model_details: AIModel;
    files?: File[];
}
// TODO add Message? api request and response schema,

export type { Conversation, ChatHistoryProps, AIModel, Message };
