import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { ChatBubbleLeftIcon } from '@heroicons/react/24/outline';
import api from '@/api';
import { useConversation } from '@/context/ConversationContext';
import { Message } from '@/types';
import { getProviderLogo } from '@/utils';
import ModelSelector from './ModelSelector';
import ChatMessages from './ChatMessages';
import InputMessage from './InputMessage';
import VezmirLogo from '@/assets/vezmir.svg';
import FeedbackForm from './FeedbackForm';
import { useTheme } from '@/context/ThemeContext';

const ChatComponent: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const { locale } = useTheme();
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const { chatId } = useParams<{ chatId: string }>();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { currentAIModel, addConversation, selectedAIModel, setSelectedAIModel, setCurrentAIModel, resetSelectedAIModel, conversations } = useConversation();
  const [isVezmirIntelligence, setIsVezmirIntelligence] = useState(() => {
    const saved = localStorage.getItem('isVezmirIntelligence');
    return saved ? JSON.parse(saved) : false;
  });
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);

  useEffect(() => {
    if (!chatId) {
      resetMessages();
      resetSelectedAIModel();
    } else {
      resetSelectedAIModel(chatId, selectedAIModel);
    }
  }, [chatId, conversations]);

  useEffect(() => {
    if (!isStreaming) {
      setMessages(prevMessages => [...prevMessages.map(message => ({ ...message, isStreaming: false }))])
      setCurrentAIModel(isVezmirIntelligence ? "Vezmir Intelligence 🔮" : selectedAIModel?.display_name);
    }
  }, [isStreaming, isVezmirIntelligence, selectedAIModel]);

  const resetMessages = useCallback(() => {
    setMessages([]);
  }, []);

  useEffect(() => {
    if (chatId && !isStreaming) {
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
    messagesEndRef.current?.scrollIntoView({ block: "end" });
  };

  const fetchMessages = async (id: string): Promise<void> => {
    try {
      const response = await api.get(`/chat/conversations/${id}/`);
      setMessages(response);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSendMessageToStream = async (message: string, files?: File[]): Promise<void> => {
    try {
      setIsStreaming(true);

      // Add user message with temporary file URLs
      setMessages(prevMessages => [...prevMessages,
      {
        id: null,
        role: 'user',
        content: message,
        ai_model_details: selectedAIModel,
        isStreaming: false,
        parent: null,
      }, {
        id: null,
        role: 'assistant',
        content: '',
        ai_model_details: selectedAIModel,
        isStreaming: true,
        parent: null
      }]);

      // I. Initialize the process
      let url: string, newChatId: string, previousMessageId: string;

      if (!chatId) {
        const newConversationResponse = await addConversation(message);
        if (!newConversationResponse) {
          throw new Error('Failed to create a new conversation');
        }
        previousMessageId = newConversationResponse.initial_message;
        newChatId = newConversationResponse.id;
        url = `/chat/conversations/${newChatId}/`;
      } else {
        previousMessageId = messages[messages.length - 1]?.id || '';
        url = `/chat/conversations/${chatId}/`;
      }
      const { userMessage, model } = await sendMessageAndGetId(message, previousMessageId, url, files);

      setCurrentAIModel(model.display_name);
      setSelectedAIModel(model);
      setMessages(prevMessages => [
        ...prevMessages.slice(0, -2), { ...userMessage, }, {
          id: null,
          role: 'assistant',
          content: '',
          ai_model_details: selectedAIModel,
          isStreaming: true,
          parent: userMessage.id
        },
      ]);

      await streamResponse(userMessage.id);

    } catch (error) {
      console.error('Error sending message:', error);
      setIsStreaming(false);
    }
  };


  const sendMessageAndGetId = async (message: string, previousMessageId: string, url: string, files?: File[]): Promise<{ userMessage: any, model: any }> => {
    const formData = new FormData();
    formData.append('content', message);
    formData.append('model_name', selectedAIModel.name);
    formData.append('is_vezmir_intelligence', isVezmirIntelligence);
    formData.append('parent', previousMessageId);

    if (files && files.length > 0) {
      files.forEach((file) => {
        formData.append(`files`, file);
      });
    }

    return api.post(url, formData, false, true)
      .then(({ user_message, model }) => {
        return { userMessage: user_message, model };
      })
      .catch((error) => {
        setIsStreaming(false);
        console.error('Error sending message:', error);
        throw error;
      });
  };

  const streamResponse = async (userMessageId: string): Promise<void> => {
    setMessages(prevMessages => [
      ...prevMessages,
    ]);

    const response = await api.post("/chat/conversations/stream/", { message_id: userMessageId }, true);
    if (!response) {
      throw new Error('Response body is null');
    }

    let assistantMessage = '';
    const reader = response.getReader();
    const decoder = new TextDecoder('utf-8');

    const processText = async (): Promise<void> => {
      let buffer = '';
      const speed = 800; // Characters per second
      const interval = 1000 / speed; // Milliseconds between each character

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim().startsWith('data:')) {
            try {
              const jsonStr = line.trim().slice(5).trim();
              const data = JSON.parse(jsonStr);
              const newContent = data.content || '';

              for (const char of newContent) {
                assistantMessage += char;
                setMessages(prevMessages => [
                  ...prevMessages.slice(0, -1),
                  { ...data, content: assistantMessage, isStreaming: true }
                ]);
                await new Promise(resolve => setTimeout(resolve, interval));
              }
            } catch (error) {
              console.error('Error parsing JSON:', error, 'Line:', line);
            }
          }
        }
      }
      setIsStreaming(false);
    };

    processText();
  };


  return (
    <div className="flex h-screen bg-[var(--gray-800)]">
      <div className="flex-1 flex flex-col bg-[var(--gray-800)] pl-4">

        {/* Model Selector + buttons - Fixed at the top */}
        <div className="sticky top-0 z-10 bg-[var(--gray-800)] shadow-sm w-full">
          <div className="flex items-center p-4 h-20"> {/* Set a fixed height */}
            {/* Model Selector */}
            <div className="flex-grow flex items-center h-full"> {/* Add h-full */}
              <div className="flex items-center h-full"> {/* Add h-full */}
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={isVezmirIntelligence}
                    onChange={() => {
                      setIsVezmirIntelligence(!isVezmirIntelligence);
                      localStorage.setItem('isVezmirIntelligence', JSON.stringify(!isVezmirIntelligence));
                    }}
                  />
                  <div className="relative w-11 h-6 bg-gray-200 rounded-full peer bg-gray-700 peer-focus:ring-2 peer-focus:ring-[var(--purple-clear)] peer-focus:ring-[var(--purple)] peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all border-gray-600 peer-checked:bg-[var(--purple)]"></div>
                </label>
                <div className="flex items-center ml-4 mr-4 h-10 relative group">
                  <img
                    src={VezmirLogo}
                    alt="Vezmir Logo"
                    className="w-8 h-8 mr-2 invert"
                  />
                  <div className="absolute bottom-0 left-0 mb-[-76px] hidden group-hover:block">
                    <div className="bg-[var(--purple)] text-white px-4 py-2 rounded-lg shadow-lg whitespace-nowrap ">
                      <p className="font-bold mb-1">{locale('chat_vezmir_intelligence')}</p>
                      <p className="text-sm">{locale('chat_vezmir_intelligence_description')}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex-grow">
                {!isVezmirIntelligence && <ModelSelector />}
              </div>
            </div>
          </div>
        </div>

        {/* Messages - Scrollable area */}
        <div className="flex-grow overflow-y-auto">
          {!chatId && messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
              {selectedAIModel && (
                <div className="bg-white rounded-full p-2">
                  <img
                    src={isVezmirIntelligence ? getProviderLogo('vezmir') : getProviderLogo(selectedAIModel.provider)}
                    alt={`${selectedAIModel.provider} logo`}
                    className="w-12 h-12"
                  />
                </div>
              )}
              <p className="text-4xl font-bold text-white">
                {isVezmirIntelligence
                  ? locale('chat_vezmir_intelligence_activated')
                  : locale('chat_how_can_i_help_you_today')}
              </p>
            </div>
          ) : (
            <ChatMessages
              messages={messages}
            />
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Feedback Button */}
        <div className="fixed bottom-28 right-2 z-20 xl:bottom-10 xl:right-4">
          <button
            onClick={() => setShowFeedbackForm(true)}
            className="p-2 rounded-full bg-[var(--purple)] hover:bg-[var(--purple-hover)] transition-colors duration-200"
          >
            <ChatBubbleLeftIcon className="w-8 h-8 text-white" />
          </button>
        </div>

        {/* Input Area - Fixed at the bottom */}
        <div className="bg-[var(--gray-800)] sticky bottom-0 z-10">
          <InputMessage
            selectedModel={currentAIModel}
            selectedAIModel={selectedAIModel}
            isStreaming={isStreaming}
            onSendMessage={handleSendMessageToStream}
          />
        </div>
      </div>
      <FeedbackForm isOpen={showFeedbackForm} onClose={() => setShowFeedbackForm(false)} />
    </div>
  );
};

export default ChatComponent;
