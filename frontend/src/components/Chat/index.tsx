import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { CreditCardIcon, ChartPieIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import api from '@/api';
import { useConversation } from '@/context/ConversationContext';
import { Message } from '@/types';
import { getProviderLogo } from '@/utils';
import ModelSelector from './ModelSelector';
import ChatMessages from './ChatMessages';
import InputMessage from './InputMessage';


const ChatComponent: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const { chatId } = useParams<{ chatId: string }>();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { addConversation, fetchConversation, selectedAIModel, updateConversation } = useConversation();

  useEffect(() => {
    if (!chatId) {
      resetMessages();
    }
  }, [chatId]);

  const resetMessages = useCallback(() => {
    setMessages([]);
  }, []);

  useEffect(() => {
    if (chatId) {
      fetchMessages(chatId);
    }
  }, [chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleConversationDeleted = (event: CustomEvent<{ id: string }>) => {
      if (event.detail.id === chatId) {
        resetMessages();
      }
    };

    window.addEventListener('conversationDeleted', handleConversationDeleted as EventListener);

    return () => {
      window.removeEventListener('conversationDeleted', handleConversationDeleted as EventListener);
    };
  }, [chatId, resetMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = async (id: string): Promise<void> => {
    try {
      const response = await api.get(`/chat/conversations/${id}/`);
      setMessages(response);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };



  const handleSendMessageToStream = async (message: string): Promise<void> => {
    if (!selectedAIModel) return;

    try {
      let url, newChatId;

      if (!chatId) {
        const newConversationResponse = await addConversation();
        if (!newConversationResponse) {
          throw new Error('Failed to create a new conversation');
        }
        newChatId = newConversationResponse.id;
        navigate(`/chat/${newChatId}`, { state: { userMessage: message } });
        url = `/chat/conversations/${newChatId}/`;
        await new Promise(resolve => setTimeout(resolve, 500));
      } else {
        url = `/chat/conversations/${chatId}/`;
        newChatId = chatId;
      }

      setIsStreaming(true);

      const userMessage = { role: 'user' as const, content: message };
      setMessages(prevMessages => [...prevMessages, userMessage]);

      let assistantMessage = '';
      setMessages(prevMessages => [...prevMessages, { role: 'assistant', content: assistantMessage }]);

      const payload = { content: message, model_name: selectedAIModel?.name || '' };
      const response = await api.post(url, payload, true);

      if (!response) {
        throw new Error('Response body is null');
      }
      const reader = response.getReader();
      const decoder = new TextDecoder('utf-8');

      let isTitle = false;
      let title = '';

      const processText = async ({ done, value }: ReadableStreamReadResult<Uint8Array>): Promise<void> => {
        if (done) {
          setIsStreaming(false);
          return;
        }

        const chunk = decoder.decode(value, { stream: true });
        
        if (chunk.startsWith('TITLE:')) {
          isTitle = true;
          title = chunk.slice(6);
        } else if (isTitle) {
          if (chunk.includes('\n')) {
            isTitle = false;
            updateConversation(newChatId, title.trim());
          } else {
            title += chunk;
          }
        } else {
          assistantMessage += chunk;
          setMessages(prevMessages => [
            ...prevMessages.slice(0, -1),
            { role: 'assistant', content: assistantMessage }
          ]);
        }

        return reader.read().then(processText);
      };

      reader.read().then(processText);

    } catch (error) {
      console.error('Error sending message:', error);
      setIsStreaming(false);
    }
  };

  return (
    <div className="flex h-screen bg-[var(--gray-800)]">
      <div className="flex-1 flex flex-col bg-[var(--gray-800)] pl-4">

        {/* Model Selector + buttons - Fixed at the top */}
        <div className="sticky top-0 z-10 bg-[var(--gray-800)] shadow-sm w-full">
          <div className="flex items-center p-4">
            {/* Model Selector */}
            <div className="flex-grow">
              <ModelSelector />
            </div>
            <div className="flex space-x-2 ml-4">
              <Link to="/dashboard/billing">
                <div className="p-2 rounded-full bg-[var(--gray-700)] hover:bg-[var(--gray-600)] transition-colors duration-200">
                  <CreditCardIcon className="w-6 h-6 text-[var(--bordeaux-clear)]" />
                </div>
              </Link>
              <Link to="/dashboard/usage">
                <div className="p-2 rounded-full bg-[var(--gray-700)] hover:bg-[var(--gray-600)] transition-colors duration-200">
                  <ChartPieIcon className="w-6 h-6 text-[var(--bordeaux-clear)]" />
                </div>
              </Link>
              <Link to="/" className="md:hidden">
                <div className="p-2 rounded-full bg-[var(--gray-700)] hover:bg-[var(--gray-600)] transition-colors duration-200">
                  <PencilSquareIcon className="w-6 h-6 text-[var(--bordeaux-clear)]" />
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Messages - Scrollable area */}
        <div className="flex-grow overflow-y-auto">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
              {selectedAIModel && (
                <div className="bg-white rounded-full p-2">
                  <img
                    src={getProviderLogo(selectedAIModel.provider)}
                    alt={`${selectedAIModel.provider} logo`}
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

        {/* Input Area - Fixed at the bottom */}
        <div className="p-4 bg-[var(--gray-800)] sticky bottom-0 z-10">
          <InputMessage
            selectedModel={selectedAIModel}
            isStreaming={isStreaming}
            onSendMessage={handleSendMessageToStream}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatComponent;