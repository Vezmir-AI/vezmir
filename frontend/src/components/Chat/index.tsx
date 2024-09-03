import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CreditCardIcon, ChartPieIcon, PencilSquareIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';
import api from '@/api';
import { useConversation } from '@/context/ConversationContext';
import { Message, AIModel } from '@/types';
import { getProviderLogo } from '@/utils';
import ModelSelector from './ModelSelector';
import ChatMessages from './ChatMessages';
import InputMessage from './InputMessage';
import VezmirLogo from '@/assets/vezmir.svg';
import FeedbackForm from './FeedbackForm';

const ChatComponent: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const { chatId } = useParams<{ chatId: string }>();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { currentAIModel, addConversation, selectedAIModel, setCurrentAIModel, resetSelectedAIModel, fetchConversations, conversations } = useConversation();
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
      resetSelectedAIModel(chatId);
    }
  }, [chatId, conversations]);

  useEffect(() => {
    if (!isStreaming) {
      setCurrentAIModel(isVezmirIntelligence ? "Vezmir Intelligence 🔮" : selectedAIModel?.display_name);
    }
  }, [isStreaming, isVezmirIntelligence, selectedAIModel]);

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

    try {
      let url, newChatId, model: AIModel;

      if (isVezmirIntelligence) {
        model = await api.post(`/chat/choose_model/`, { user_message: message });
      } else {
        model = selectedAIModel;
      }
      setIsStreaming(true);
      setCurrentAIModel(model.display_name);
      console.log("using model", model);

      if (!chatId) {
        const newConversationResponse = await addConversation();
        if (!newConversationResponse) {
          throw new Error('Failed to create a new conversation');
        }
        newChatId = newConversationResponse.id;
        api.post(`/chat/conversations/${newChatId}/title/`, { user_message: message })
          .then(fetchConversations)
          .catch(fetchConversations);
        url = `/chat/conversations/${newChatId}/`;
        await new Promise(resolve => setTimeout(resolve, 500));
      } else {
        url = `/chat/conversations/${chatId}/`;
      }

      const userMessage = { role: 'user' as const, content: message, ai_model_details: model };
      setMessages(prevMessages => [...prevMessages, userMessage]);

      let assistantMessage = '';
      setMessages(prevMessages => [...prevMessages, { role: 'assistant', content: assistantMessage, ai_model_details: model }]);

      const payload = { content: message, model_name: model.name };
      const response = await api.post(url, payload, true);
      if (selectedAIModel.name == "vezmir") {
        await fetchConversations();
        // fetch the conversation new ai model
        resetSelectedAIModel(chatId);
        setMessages(prevMessages => [
          ...prevMessages.slice(0, -1),
          { role: 'assistant', content: assistantMessage, ai_model_details: model }
        ]);
      }

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
          { role: 'assistant', content: assistantMessage, ai_model_details: model }
        ]);
        console.log("ehhheooo", model)

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
                  <div className="relative w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-focus:ring-2 peer-focus:ring-[var(--bordeaux-clear)] dark:peer-focus:ring-[var(--bordeaux)] peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[var(--bordeaux)]"></div>
                </label>
                <div className="flex items-center ml-4 mr-4 h-10 relative group">
                  <img src={VezmirLogo} alt="Vezmir Logo" className="w-8 h-8 mr-2 invert" />
                </div>
              </div>
              <div className="flex-grow">
                {!isVezmirIntelligence && <ModelSelector />}
              </div>
            </div>
            {/* <div className="flex space-x-2 ml-4" className="md:hidden">
              <Link to="/dashboard/billing">
                <div className="p-2 rounded-full bg-[var(--gray-700)] hover:bg-[var(--gray-600)] transition-colors duration-200">
                  <CreditCardIcon className="w-6 h-6 text-[var(--bordeaux)]" />
                </div>
              </Link>
              <Link to="/dashboard/usage" className="md:hidden">
                <div className="p-2 rounded-full bg-[var(--gray-700)] hover:bg-[var(--gray-600)] transition-colors duration-200">
                  <ChartPieIcon className="w-6 h-6 text-[var(--bordeaux)]" />
                </div>
              </Link>
              <Link to="/" className="md:hidden">
                <div className="p-2 rounded-full bg-[var(--gray-700)] hover:bg-[var(--gray-600)] transition-colors duration-200">
                  <PencilSquareIcon className="w-6 h-6 text-[var(--bordeaux)]" />
                </div>
              </Link>
            </div> */}
          </div>
        </div>

        {/* Messages - Scrollable area */}
        <div className="flex-grow overflow-y-auto">
          {messages.length === 0 ? (
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
              <p className="text-4xl font-bold text-white">How can I help you today?</p>
            </div>
          ) : (
            <ChatMessages messages={messages} />
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Feedback Button */}
        <div className="fixed bottom-10 right-4 z-20">
          <button
            onClick={() => setShowFeedbackForm(true)}
            className="p-2 rounded-full bg-[var(--bordeaux)] hover:bg-[var(--bordeaux-hover)] transition-colors duration-200"
          >
            <ChatBubbleLeftIcon className="w-8 h-8 text-white" />
          </button>
        </div>

        {/* Input Area - Fixed at the bottom */}
        <div className="bg-[var(--gray-800)] sticky bottom-0 z-10">
          <InputMessage
            selectedModel={currentAIModel}
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
