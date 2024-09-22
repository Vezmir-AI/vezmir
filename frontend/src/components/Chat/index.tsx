import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { ChatBubbleLeftIcon } from '@heroicons/react/24/outline';
import api from '@/api';
import { useConversation } from '@/context/ConversationContext';
import { Message, DiscussionMessage } from '@/types';
import { getProviderLogo } from '@/utils';
import ModelSelector from './ModelSelector';
import ChatMessages from './ChatMessages';
import InputMessage from './InputMessage';
import VezmirLogo from '@/assets/vezmir.svg';
import FeedbackForm from './FeedbackForm';
import { useTheme } from '@/context/ThemeContext';
import { PencilSquareIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const ChatComponent: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [discussion, setDiscussion] = useState<DiscussionMessage[]>([]);
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
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  useEffect(() => {
    if (!chatId) {
      resetDiscussion();
      resetSelectedAIModel();
    } else {
      resetSelectedAIModel(chatId, selectedAIModel);
    }
  }, [chatId, conversations]);

  useEffect(() => {
    if (!isStreaming) {
      setDiscussion(prevDiscussion => [...prevDiscussion.map(message => ({ ...message, isStreaming: false }))])
      setCurrentAIModel(isVezmirIntelligence ? "Vezmir Intelligence 🔮" : selectedAIModel?.display_name);
    }
  }, [isStreaming, isVezmirIntelligence, selectedAIModel]);

  const resetDiscussion = useCallback(() => {
    setDiscussion([]);
  }, []);

  useEffect(() => {
    setDiscussion([])
    if (chatId && !isStreaming) {
      fetchMessages(chatId);
    }
  }, [chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [discussion]);


  const updateDiscussionWithMessages = () => {
    for (let i = 0; i < discussion.length - 1; i++) {
      if (!discussion[i].children!.includes(discussion[i + 1].id!)) {
        discussion[i].children!.push(discussion[i + 1].id!);
        messages[i].children!.push(messages[i + 1].id!);
        const updatedDiscussion = discussion.map(msg => {
          const { navigation } = getParent(msg);
          return { ...msg, isStreaming: false, navigation: navigation || undefined };
        });
        setDiscussion(updatedDiscussion);
        setMessages(messages);
        console.log("oui", discussion[i].id);
        return;
      }
    }
  };

  const getParent = (message: Message) => {
    let navigation;
    if (!message.parent) throw "Message has no parent";
    const parent = messages.find(msg => msg.id === message.parent);
    if (!parent) {
      console.error("Parent message not found")
      return { parent, navigation };
    };
    if (!parent.children) {
      console.error("Message parent has no children");
      return { parent, navigation };
    }
    const position = parent.children.indexOf(message.id || '');
    navigation = parent.children.length === 1 ? null : {
      next: null,
      previous: parent.children[position - 1],
      position: `${position + 1}/${parent.children.length}`
    };
    return { parent, navigation };
  };

  const buildCurrentDiscussion = () => {
    let current = messages[messages.length - 1];
    const currentDiscussion = [];
    do {
      const { parent, navigation } = getParent(current);
      currentDiscussion.push({
        ...current,
        navigation: navigation || undefined
      });
      current = parent!;
    } while (current.parent);
    return currentDiscussion.reverse();
  };

  useEffect(() => {
    if (messages.length === 0 || isStreaming) return;

    if (discussion.length > 0) {
      updateDiscussionWithMessages();
    } else {
      setDiscussion(buildCurrentDiscussion());
    }
  }, [messages]);

  useEffect(() => {
    const handleConversationDeleted = (event: CustomEvent<{ id: string }>) => {
      if (event.detail.id === chatId) {
        resetDiscussion();
      }
    };

    window.addEventListener('conversationDeleted', handleConversationDeleted as EventListener);

    return () => {
      window.removeEventListener('conversationDeleted', handleConversationDeleted as EventListener);
    };
  }, [chatId, resetDiscussion]);

  const getChildren = (message: Message, position?: number): DiscussionMessage[] => {
    if (!message.children) return [];
    position = position || message.children.length - 1;
    let navigation;
    const messageId = message.children?.[position];
    const childMessage = messages.find(msg => msg.id === messageId);
    if (!childMessage) return [];
    if (message.children.length > 1) {
      navigation = {
        previous: message.children[position - 1],
        next: message.children[position + 1],
        position: `${position + 1}/${message.children.length}`
      }
    }
    return [
      {
        ...childMessage,
        navigation
      },
      ...getChildren(childMessage),
    ]
  }

  const scrollToBottom = () => {
    if (shouldAutoScroll && chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  const handleScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10; // 10px threshold
      setShouldAutoScroll(isAtBottom);
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

  const handleNavigation = (messageId: string, targetId: string) => {
    const currentIndex = discussion.findIndex(msg => msg.id === messageId)
    if (currentIndex === -1) throw "Message Navigation not found"
    const target = messages.find(msg => msg.id === targetId)
    if (!target) throw "Message Navigation target not found"

    // Find the parent message to determine navigation
    const parentMessage = messages.find(msg => msg.children?.includes(targetId))
    let navigation: DiscussionMessage['navigation'] | undefined;
    if (parentMessage && parentMessage.children) {
      const position = parentMessage.children.indexOf(targetId)
      navigation = {
        previous: parentMessage.children[position - 1],
        next: parentMessage.children[position + 1],
        position: `${position + 1}/${parentMessage.children.length}`
      }
    }
    const children = getChildren(target)
    setDiscussion(prevDiscussion => [...prevDiscussion.slice(0, currentIndex), { ...target, navigation }, ...children])
  }

  const handleSendMessageToStream = async (message: string, files?: File[]): Promise<void> => {
    try {
      setIsStreaming(true);

      // Add user message with temporary file URLs
      setDiscussion(prevDiscussion => [...prevDiscussion,
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

      setMessages(prevMessages => {
        const updatedMessages = [...prevMessages];
        if (previousMessageId) {
          const parentIndex = updatedMessages.findIndex(msg => msg.id === previousMessageId);
          if (parentIndex !== -1) {
            updatedMessages[parentIndex] = {
              ...updatedMessages[parentIndex],
              children: [...(updatedMessages[parentIndex].children || []), userMessage.id]
            };
          }
        }
        return [...updatedMessages, userMessage];
      });

      setCurrentAIModel(model.display_name);
      setSelectedAIModel(model);
      setDiscussion(prevDiscussion => [
        ...prevDiscussion.slice(0, -2), { ...userMessage, }, {
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

  const handleRegeneration = async (messageId: string): Promise<void> => {
    try {
      setIsStreaming(true);
      const index = discussion.findIndex(msg => msg.id === messageId);
      if (index === -1) throw "Message Regeneration not found";
      setDiscussion(prevDiscussion => [...prevDiscussion.slice(0, index)]);
      handleRewrite(messageId, discussion[index].content);
    } catch (error) {
      console.error('Error regenerating message:', error);
    }
  };

  const handleRewrite = async (messageId: string, newMessage: string): Promise<void> => {
    try {
      setIsStreaming(true)
      const index = discussion.findIndex(msg => msg.id === messageId)
      if (index === -1) throw "Message Rewrite not found"
      const selectedModel = discussion[index].ai_model_details
      setSelectedAIModel(selectedModel)
      setDiscussion(prevDiscussion => [
        ...prevDiscussion.slice(0, index),
        { ...prevDiscussion[index], content: newMessage },
        {
          id: null,
          role: 'assistant',
          content: '',
          ai_model_details: selectedModel,
          isStreaming: true,
          parent: null
        }
      ]);
      if (discussion[index].role !== 'user') throw "Message Rewrite is not a user message"
      const url = `/chat/conversations/${chatId}/`;
      const files = (discussion[index].files as File[] | undefined)
      const parent = discussion[index].parent;
      if (!parent) throw "Message Rewrite has no parent"
      const { userMessage, model } = await sendMessageAndGetId(newMessage, parent!, url, files);

      setMessages(prevMessages => {
        const updatedMessages = [...prevMessages];
        if (parent) {
          const parentIndex = updatedMessages.findIndex(msg => msg.id === parent);
          if (parentIndex !== -1) {
            updatedMessages[parentIndex] = {
              ...updatedMessages[parentIndex],
              children: [...(updatedMessages[parentIndex].children || []), userMessage.id]
            };
          }
        }
        return [...updatedMessages, userMessage];
      });
      setCurrentAIModel(model.display_name);
      setSelectedAIModel(model);
      setDiscussion(prevDiscussion => [
        ...prevDiscussion.slice(0, -2), { ...userMessage, }, {
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
      console.error('Error rewriting message:', error);
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
    const response = await api.post("/chat/conversations/stream/", { message_id: userMessageId }, true);
    if (!response) {
      throw new Error('Response body is null');
    }

    let assistantMessage = '';
    let data: any;
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
              data = JSON.parse(jsonStr);
              const newContent = data.content || '';

              for (const char of newContent) {
                assistantMessage += char;
                setDiscussion(prevDiscussion => [
                  ...prevDiscussion.slice(0, -1),
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
      setMessages(prevMessages => [...prevMessages, { ...data, content: assistantMessage }])
      setIsStreaming(false);
    };

    processText();
  };


  return (
    <div className="flex h-screen bg-[var(--gray-800)]">
      <div className="flex-1 flex flex-col bg-[var(--gray-800)] pl-4 overflow-hidden">

        {/* Model Selector + buttons - Fixed at the top */}
        <div className="sticky top-0 z-10 bg-[var(--gray-800)] shadow-sm w-full pl-10">
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

            {/* New Chat Button */}
            <Link to="/" className="ml-2">
              <div className="p-2 rounded-full bg-[var(--gray-700)] hover:bg-[var(--gray-600)] transition-colors duration-200">
                <PencilSquareIcon className="w-6 h-6 text-[var(--purple-clear)]" />
              </div>
            </Link>
          </div>
        </div>

        {/* Messages - Scrollable area */}
        <div
          ref={chatContainerRef}
          className="flex-grow overflow-y-auto w-screen sm:w-full"
          onScroll={handleScroll}
        >
          {!chatId && messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full space-y-4 px-4">
              {selectedAIModel && (
                <div className="bg-white rounded-full p-2 mx-auto">
                  <img
                    src={isVezmirIntelligence ? getProviderLogo('vezmir') : getProviderLogo(selectedAIModel.provider)}
                    alt={`${selectedAIModel.provider} logo`}
                    className="w-10 h-10 sm:w-12 sm:h-12"
                  />
                </div>
              )}
              <p className="text-xl sm:text-4xl font-bold text-white text-center">
                {isVezmirIntelligence
                  ? locale('chat_vezmir_intelligence_activated')
                  : locale('chat_how_can_i_help_you_today')}
              </p>
            </div>
          ) : (
            <ChatMessages
              messages={discussion}
              handleRewrite={handleRewrite}
              handleRegeneration={handleRegeneration}
              handleNavigation={handleNavigation}
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
