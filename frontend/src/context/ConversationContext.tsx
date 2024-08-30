import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/api';
import { Conversation, AIModel } from '@/types';
import { useAuth } from './AuthContext';
import { useProfile } from './ProfileContext';

interface ConversationContext {
    conversations: Conversation[];
    aiModels: AIModel[];
    selectedAIModel: AIModel | null;
    addConversation: () => Promise<Conversation>;
    deleteConversation: (id: string) => void;
    fetchConversations: () => Promise<void>;
    setSelectedAIModel: (model: AIModel) => void;
    updateConversation: (id: string, name: string) => void;
    resetSelectedAIModel: (chatId?: string) => void;
}

const ConversationContext = createContext<ConversationContext | null>(null);
export const ConversationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const { user } = useProfile();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [aiModels, setAiModels] = useState<AIModel[]>([]);
    const [selectedAIModel, setSelectedAIModel] = useState<AIModel | null>(null);

    useEffect(() => {
        const initializeData = async () => {
            await fetchConversations();
            await fetchAiModels();
        };

        if (isAuthenticated) {
            initializeData();
        }
    }, [isAuthenticated]);

    useEffect(() => {
        if (aiModels.length > 0) {
            const defaultModel = aiModels.find(model => model.name === user?.preferred_model) || aiModels[0];
            setSelectedAIModel(defaultModel);
        }
    }, [aiModels]);

    const resetSelectedAIModel = (chatId: string = "") => {
        if (chatId) {
            const chat = conversations.find(conversation => conversation.id === chatId);
            if (chat) {
                const defaultModel = aiModels.find(model => model.id === chat.ai_model) || aiModels[0];
                setSelectedAIModel(defaultModel);
            }
        } else {
            const defaultModel = aiModels.find(model => model.id === user?.preferred_model) || aiModels[0];
            setSelectedAIModel(defaultModel);
        }
    }

    const fetchConversations = async () => {
        const convs = await api.get('/chat/conversations/');
        setConversations(convs);
    }

    const addConversation = async () => {
        const newConversation = await api.post('/chat/conversations/');
        // removed because it was causing a re-render of the conversations
        // will refetch conversations in the Chat component when title is generated
        // setConversations([...conversations, newConversation]);
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


    const updateConversation = (id: string, name: string) => {
        setConversations(prevConversations =>
            prevConversations.map(conv =>
                conv.id === id ? { ...conv, name } : conv
            )
        );
    };

    return (
        <ConversationContext.Provider value={{
            conversations,
            aiModels,
            selectedAIModel,
            addConversation,
            deleteConversation,
            fetchConversations,
            updateConversation,
            setSelectedAIModel,
            resetSelectedAIModel,
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
