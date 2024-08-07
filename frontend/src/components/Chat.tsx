import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import Header from './Chat/Header';
import ModelSelector from './Chat/ModelSelector';
import ChatHistory from './Chat/ChatHistory';
import ChatMessages from './Chat/ChatMessages';
import { getProviderLogo } from '../utils/providerUtils';
import InputMessage from './Chat/InputMessage';

interface Conversation {
  id: string;
  name: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AiModel {
  id: string;
  name: string;
  provider: string;
  display_name: string;
  hint: string;
}

const ChatComponent: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedModel, setSelectedModel] = useState<AiModel | null>(null);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const { chatId } = useParams<{ chatId: string }>();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const resetMessages = () => {
    setMessages([]);
  };

  useEffect(() => {
    fetchConversations();
    fetchAiModels();
    if (chatId) {
      fetchMessages(chatId);
    }
  }, [chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchConversations = async (): Promise<void> => {
    try {
      const response = await api.get('/chat/conversations/');
      setConversations(response);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const fetchMessages = async (id: string): Promise<void> => {
    try {
      const response = await api.get(`/chat/conversations/${id}/`);
      setMessages(response);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const fetchAiModels = async () => {
    try {
      const response = await api.get('/ai_models/');
      const gpt4o = response.find(model => model.name === 'gpt-4o');
      if (gpt4o) {
        setSelectedModel(gpt4o);
      } else if (response.length > 0) {
        setSelectedModel(response[0]);
      }
    } catch (error) {
      console.error('Error fetching AI models:', error);
    }
  };

  const handleSendMessageToStream = async (message: string): Promise<void> => {
    if (!selectedModel) return;

    try {
      let url, newChatId;

      if (!chatId) {
        const newConversationResponse = await api.post('/chat/conversations/', {});
        if (!newConversationResponse) {
          throw new Error('Failed to create a new conversation');
        }
        newChatId = newConversationResponse.id;
        navigate(`/chat/${newChatId}`, { state: { userMessage: message } });
        url = `/chat/conversations/${newChatId}/`;
        // Add a delay before updating the messages state
        await new Promise(resolve => setTimeout(resolve, 500));
      } else {
        url = `/chat/conversations/${chatId}/`;
      }

      setIsStreaming(true);

      const userMessage = { role: 'user' as const, content: message };
      setMessages(prevMessages => [...prevMessages, userMessage]);

      let assistantMessage = '';
      setMessages(prevMessages => [...prevMessages, { role: 'assistant', content: assistantMessage }]);

      const payload = { content: message, model_name: selectedModel.name };
      const response = await api.post(url, payload, true);

      if (!response) {
          throw new Error('Response body is null');
      }
      const reader = response.getReader();
      const decoder = new TextDecoder('utf-8');

      const processText = async ({ done, value }: ReadableStreamReadResult<Uint8Array>): Promise<void> => {
          if (done) {
              setIsStreaming(false);
              return;
          }

          const chunk = decoder.decode(value, { stream: true });
          assistantMessage += chunk;
          setMessages(prevMessages => [
              ...prevMessages.slice(0, -1),
              { role: 'assistant', content: assistantMessage }
          ]);

          return reader.read().then(processText);
      };

      reader.read().then(processText);

    } catch (error) {
        console.error('Error sending message:', error);
        setIsStreaming(false);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Conversation List */}
      <div className="w-72 bg-gray-850 overflow-y-auto flex flex-col">
        <div className="p-4">
          <Header />
        </div>
        <ChatHistory 
          conversations={conversations} 
          setConversations={setConversations} 
          resetMessages={resetMessages}
        />
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-gray-800 pb-4">
        {/* Model Selector */}
        <div className="p-4 bg-gray-800">
          <ModelSelector selectedModel={selectedModel?.name || ''} setSelectedModel={setSelectedModel} />
        </div>

        {/* Messages */}
        <div className="flex-grow overflow-y-auto p-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
              {selectedModel && (
                <div className="bg-white rounded-full p-2">
                  <img
                    src={getProviderLogo(selectedModel.provider)}
                    alt={`${selectedModel.provider} logo`}
                    className="w-12 h-12"
                  />
                </div>
              )}
              <p className="text-4xl font-bold text-white">How can I help you today?</p>
            </div>
          ) : (
            <ChatMessages messages={messages} />
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <InputMessage
          selectedModel={selectedModel}
          isStreaming={isStreaming}
          onSendMessage={handleSendMessageToStream}
        />
      </div>
    </div>
  );
};

export default ChatComponent;