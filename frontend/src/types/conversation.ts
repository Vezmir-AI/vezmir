interface Conversation {
    id: string;
    name: string;
}

interface ChatHistoryProps {
    conversations: Conversation[];
    onDeleteConversation: (id: string) => Promise<void>;
}

interface AIModels {
    id: string;
    name: string;
    provider: string;
    display_name: string;
    hint: string;
}

// TODO add Message? api request and response schema, 

export type { Conversation, ChatHistoryProps, AIModels };
