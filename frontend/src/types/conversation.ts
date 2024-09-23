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

interface File {
    name: string;
    url: string;
    type: string;
}

interface Message {
    id: string | null;
    role: 'user' | 'assistant' | null;
    content: string;
    ai_model_details: AIModel;
    files?: File[];
    parent: string | null;
    children?: string[];
}

interface DiscussionMessage extends Message {
    isStreaming?: boolean;
    navigation?: {
        next: string | null;
        previous: string | null;
        position: string;
    }
}

// TODO add Message? api request and response schema,

export type { Conversation, ChatHistoryProps, AIModel, Message, DiscussionMessage };
