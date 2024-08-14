import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Conversation, AIModel } from '../types';
import api from '../api';

interface ConversationContext {
    conversations: Conversation[];
    aiModels: AIModel[];
    selectedAIModel: AIModel | null;
    addConversation: () => Promise<Conversation>;
    deleteConversation: (id: string) => void;
    fetchConversations: () => Promise<void>;
    setSelectedAIModel: (model: AIModel) => void;
}

const ConversationContext = createContext<ConversationContext | null>(null);
export const ConversationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const navigate = useNavigate();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [aiModels, setAiModels] = useState<AIModel[]>([]);
    const [selectedAIModel, setSelectedAIModel] = useState<AIModel | null>(null);

    useEffect(() => {
        const initializeData = async () => {
            await fetchConversations();
            await fetchAiModels();
        };

        initializeData();
    }, []);

    useEffect(() => {
        if (aiModels.length > 0) {
            const defaultModel = aiModels.find(model => model.name === 'gpt-4o') || aiModels[0];
            setSelectedAIModel(defaultModel);
        }
    }, [aiModels]);

    const fetchConversations = async () => {
        const convs = await api.get('/chat/conversations/');
        setConversations(convs);
    }

    const addConversation = async () => {
        const newConversation = await api.post('/chat/conversations/');
        setConversations([...conversations, newConversation]);
        navigate(`/chat/${newConversation.id}`);
        return newConversation;
    }

    const deleteConversation = async (id: string) => {
        await api.delete(`/chat/conversations/${id}/`);
        setConversations(conversations.filter((conversation) => conversation.id !== id));
    }

    const fetchAiModels = async () => {
        try {
            const models = await api.get('/ai_models/');
            setAiModels(models);
        } catch (error) {
            console.error('Failed to fetch AI models:', error);
        }
    }

    return (
        <ConversationContext.Provider value={{ 
            conversations, 
            aiModels,
            selectedAIModel,
            addConversation, 
            deleteConversation, 
            fetchConversations,
            setSelectedAIModel
        }}>
            {children}
        </ConversationContext.Provider>
    );
}


export function useConversation() {
    const context = useContext(ConversationContext);
    if (!context) {
        throw new Error('ConversationContext must be used within a ConversationProvider');
    }
    return context;
}