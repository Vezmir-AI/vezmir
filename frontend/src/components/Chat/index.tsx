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
import { PhotoIcon, ChatBubbleLeftRightIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const ChatComponent: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [discussion, setDiscussion] = useState<DiscussionMessage[]>([]);
  const { locale, isPageVisible } = useTheme();
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const { chatId } = useParams<{ chatId: string }>();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { currentAIModel, addConversation, selectedAIModel, setSelectedAIModel, setCurrentAIModel, resetSelectedAIModel, conversations, fetchConversation } = useConversation();
  const [isVezmirIntelligence, setIsVezmirIntelligence] = useState(() => {
    const saved = localStorage.getItem('isVezmirIntelligence');
    return saved ? JSON.parse(saved) : false;
  });
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [pendingContent, setPendingContent] = useState('');
  const [isImageMode, setIsImageMode] = useState(() => {
    const saved = localStorage.getItem('isImageMode');
    return saved ? JSON.parse(saved) : false;
  });

  const handleModeChange = (newMode: boolean) => {
    setIsImageMode(newMode);
    localStorage.setItem('isImageMode', JSON.stringify(newMode));
    if (newMode) {
      setIsVezmirIntelligence(false);
      localStorage.setItem('isVezmirIntelligence', JSON.stringify(false));
    }
  };

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
      setDiscussion(prevDiscussion => [...prevDiscussion.map(message => ({ ...message, isStreaming }))])
      setCurrentAIModel(isVezmirIntelligence ? "Vezmir Intelligence 🔮" : selectedAIModel?.display_name);
    }
  }, [isStreaming, isVezmirIntelligence, selectedAIModel]);

  const resetDiscussion = useCallback(() => {
    setDiscussion([]);
  }, []);

  useEffect(() => {
    if (chatId && !isStreaming) {
      fetchMessages(chatId);
    }
  }, [chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [discussion]);

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

  const updateDiscussionWithMessages = () => {
    setDiscussion(prevDiscussion => prevDiscussion.map((msg, index) => {
      if (index < prevDiscussion.length - 1 && !msg.children!.includes(prevDiscussion[index + 1].id!)) {
        msg.children!.push(prevDiscussion[index + 1].id!);
      }
      if (!msg.parent) return { ...msg, isStreaming };
      const { navigation } = getParent(msg);
      return { ...msg, isStreaming, navigation: navigation || undefined };
    }));
  };

  const getParent = (message: Message) => {
    let navigation;
    if (!message.parent) return { parent: null, navigation };
    const parent = messages.find(msg => msg.id === message.parent);
    if (!parent) {
      return { parent, navigation };
    }
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
    currentDiscussion.push(current)
    return currentDiscussion.reverse();
  };

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
      const response = await fetchConversation(id);
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

      // Create a new AbortController instance
      const controller = new AbortController();
      setAbortController(controller);

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

      await streamResponse(userMessage.id, controller.signal);

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
      setIsStreaming(true);
      const controller = new AbortController();
      setAbortController(controller);

      const index = discussion.findIndex(msg => msg.id === messageId);
      if (index === -1) throw "Message Rewrite not found";
      const selectedModel = discussion[index].ai_model_details;
      setSelectedAIModel(selectedModel);
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
      if (discussion[index].role !== 'user') throw "Message Rewrite is not a user message";
      const url = `/chat/conversations/${chatId}/`;
      const files = await fetchFiles(discussion[index].files ?? []);
      const parent = discussion[index].parent;
      if (!parent) throw "Message Rewrite has no parent";
      const { userMessage, model } = await sendMessageAndGetId(newMessage, parent, url, files);

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

      await streamResponse(userMessage.id, controller.signal);
    } catch (error) {
      console.error('Error rewriting message:', error);
    }
  };

  const fetchFiles = async (fileMetadata: any[]): Promise<File[]> => {
    const files: File[] = [];
    for (const file of fileMetadata) {
      try {
        const url = `/chat/file/${chatId}/${file.name}/`;
        const blob = await api.get(url);
        const fetchedFile = new File([blob], file.name, { type: file.type });
        files.push(fetchedFile);
      } catch (error) {
        console.error('Error fetching file:', error);
      }
    }
    return files;
  };

  const sendMessageAndGetId = async (message: string, previousMessageId: string, url: string, files?: File[]): Promise<{ userMessage: any, model: any }> => {
    const formData = new FormData();
    formData.append('content', message);
    formData.append('model_name', selectedAIModel.name);
    formData.append('is_vezmir_intelligence', isVezmirIntelligence.toString());
    formData.append('parent', previousMessageId);

    if (files && files.length > 0) {
      files.forEach((file) => {
        formData.append('files', file);
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

  const streamResponse = async (userMessageId: string, signal: AbortSignal): Promise<void> => {
    const response = await api.post("/chat/conversations/stream/", { message_id: userMessageId }, true, false, signal);
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
              assistantMessage += newContent;

              // Update pending content regardless of page visibility
              setPendingContent(assistantMessage);

              // Only update UI if page is visible
              if (isPageVisible) {
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
      setMessages(prevMessages => [...prevMessages, { ...data, content: assistantMessage }]);
      setIsStreaming(false);
    };

    processText();
  };

  // Add this effect to update the UI when the page becomes visible
  useEffect(() => {
    if (isPageVisible && pendingContent) {
      setDiscussion(prevDiscussion => [
        ...prevDiscussion.slice(0, -1),
        { ...prevDiscussion[prevDiscussion.length - 1], content: pendingContent, isStreaming }
      ]);
    }
  }, [isPageVisible, pendingContent]);

  const handleAbortStream = () => {
    if (abortController) {
      abortController.abort();
      console.error('Aborted stream');
      setIsStreaming(false);
      window.location.reload(); // reload is the quick fix found to display the whole last message
    }
  };

  return (
    <div className="flex h-screen bg-[var(--gray-800)]">
      <div className="flex-1 flex flex-col bg-[var(--gray-800)] pl-4 overflow-hidden">

        {/* Model Selector + buttons - Fixed at the top */}
        <div className="sticky top-0 z-10 bg-[var(--gray-800)] shadow-sm w-full pl-12 md:pl-0">
          <div className="flex items-center p-4 h-20"> {/* Set a fixed height */}
            {/* Model Selector */}
            <div className="flex-grow flex items-center h-full">
              <div className="flex items-center h-full">
                {/* Text/Image mode toggle */}
                <label className="inline-flex items-center cursor-pointer mr-5">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={isImageMode}
                    onChange={() => handleModeChange(!isImageMode)}
                  />
                  <div className="relative w-11 h-6 bg-gray-200 rounded-full peer bg-gray-700 peer-focus:ring-2 peer-focus:ring-[var(--purple-clear)] peer-focus:ring-[var(--purple)] peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all border-gray-600 peer-checked:bg-[var(--purple)]"></div>
                  <span className="ml-2">
                    {isImageMode ? (
                      <PhotoIcon className="h-8 w-8 text-gray-300" />
                    ) : (
                      <ChatBubbleLeftRightIcon className="h-8 w-8 text-gray-300" />
                    )}
                  </span>
                </label>

                {/* Vezmir Intelligence toggle (only shown in text mode) */}
                {!isImageMode && (
                  <>
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
                  </>
                )}
              </div>
              <div className="flex-grow">
                {!isVezmirIntelligence && <ModelSelector isImageMode={isImageMode} />}
              </div>
            </div>

            {/* New Chat Button */}
            <Link to="/" className="ml-2 sm:hidden">
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
            onAbortStream={handleAbortStream} // Pass the handleAbortStream function
          />
        </div>
      </div>
      <FeedbackForm isOpen={showFeedbackForm} onClose={() => setShowFeedbackForm(false)} />
    </div>
  );
};

export default ChatComponent;
