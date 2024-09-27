import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { DiscussionMessage } from '@/types';
import renderContent from './renderContent';
import { getProviderLogo, getProviderColor } from '@/utils/providerUtils';
import { ClipboardDocumentIcon, CheckIcon, PaperClipIcon, ArrowPathIcon, ChevronLeftIcon, ChevronRightIcon, PencilIcon } from '@heroicons/react/24/outline';
import api from '@/api';
import { useTheme } from '@/context/ThemeContext';
import Lottie from 'react-lottie';
import animationData from '@/assets/animation/vezmir_moving.json';

interface ChatMessagesProps {
  messages: DiscussionMessage[];
  handleRewrite: (messageId: string, content: string) => Promise<void>;
  handleRegeneration: (messageId: string) => Promise<void>;
  handleNavigation: (messageId: string, targetId: string) => void;
}

const defaultOptions = {
  loop: true,
  autoplay: true,
  animationData: animationData,
  rendererSettings: {
    preserveAspectRatio: 'xMidYMid slice'
  }
};

const ChatMessages: React.FC<ChatMessagesProps> = ({ messages, handleRewrite, handleRegeneration, handleNavigation }) => {
  const { chatId } = useParams();
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({});
  const { locale } = useTheme();
  const [imageUrls, setImageUrls] = useState<{ [key: string]: string }>({});
  const [editingMessageId, setEditingMessageId] = useState<string>(""); // if null then will show eveytime new messages are added
  const [editedContent, setEditedContent] = useState<string>('');
  const editTextareaRef = useRef<HTMLTextAreaElement>(null);
  const editMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchImages = async () => {
      const newImageUrls: { [key: string]: string } = {};
      for (const msg of messages) {
        if (msg.files) {
          for (const file of msg.files) {
            if (file.type.startsWith('image/') && !imageUrls[file.url]) {
              try {
                const url = `/chat/file/${chatId}/${file.name}/`;
                const blob = await api.get(url);
                const objectUrl = URL.createObjectURL(blob);
                newImageUrls[file.url] = objectUrl;
              } catch (error) {
                console.error('Error fetching image:', error);
              }
            }
          }
        }
      }
      setImageUrls(prev => ({ ...prev, ...newImageUrls }));
    };

    if (chatId) {
      fetchImages();
    }

    return () => {
      Object.values(imageUrls).forEach(URL.revokeObjectURL);
    };
  }, [messages]);

  useEffect(() => {
    if (editingMessageId && editTextareaRef.current) {
      editTextareaRef.current.focus();
      editTextareaRef.current.setSelectionRange(editedContent.length, editedContent.length);
      editTextareaRef.current.style.height = 'auto';
      editTextareaRef.current.style.height = `${editTextareaRef.current.scrollHeight}px`;

    }
  }, [editingMessageId]);

  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && editingMessageId) {
        handleEditCancel();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [editingMessageId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (editingMessageId && editMenuRef.current && !editMenuRef.current.contains(event.target as Node)) {
        handleEditCancel();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [editingMessageId]);

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedStates(prev => ({ ...prev, [content]: true }));
    setTimeout(() => setCopiedStates(prev => ({ ...prev, [content]: false })), 2000);
  };

  const handleEditClick = (messageId: string, content: string) => {
    setEditingMessageId(messageId);
    setEditedContent(content);
  };

  const handleEditCancel = () => {
    setEditingMessageId("");
    setEditedContent('');
  };

  const handleEditSubmit = async () => {
    if (editingMessageId) {
      await handleRewrite(editingMessageId, editedContent);
      setEditingMessageId("");
      setEditedContent('');
    }
  };

  const adjustTextareaHeight = (element: HTMLTextAreaElement) => {
    element.style.height = 'auto';
    element.style.height = `${element.scrollHeight}px`;
  };

  return (
    <div className="flex-grow overflow-y-auto p-4 space-y-4 max-w-4xl mx-auto mb-4">
      {messages.map((msg, index) => (
        <div
          key={index}
          className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`${msg.role === 'user'
              ? 'bg-gray-700 text-white rounded-2xl rounded-br-sm'
              : 'bg-gray-800 text-white rounded-3xl rounded-tl-sm mb-6'
              } px-3 py-2 text-base flex items-start relative ${editingMessageId === msg.id ? 'w-full' : 'max-w-[80%]'}`}
          >
            {msg.role === 'assistant' && (
              <div className="mr-3 flex-shrink-0 mt-1 relative group">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getProviderColor(msg.ai_model_details?.provider || 'vezmir')}`}>
                  <img
                    src={getProviderLogo(msg.ai_model_details?.provider || 'vezmir')}
                    alt={`${msg.ai_model_details?.provider || 'AI'} logo`}
                    className="w-6 h-6"
                  />
                </div>
                {msg.ai_model_details?.name && (
                  <div
                    className={`absolute hidden group-hover:flex items-center h-6 bg-opacity-75 text-white text-xs px-2 py-1 rounded-md -top-7 left-full ml-2 whitespace-nowrap ${getProviderColor(msg.ai_model_details?.provider || 'vezmir')}`}
                    style={{ width: 'max-content', transition: 'width 0.3s ease-out' }}
                  >
                    {messages[index].ai_model_details?.display_name}
                  </div>
                )}
              </div>
            )}
            {msg.role && (<div className="w-full break-words">
              {msg.files && msg.files.length > 0 && (
                <>
                  <div className="mb-2 flex flex-wrap gap-2">
                    {msg.files.map((file, fileIndex) => (
                      <div key={fileIndex} className="flex flex-col items-center bg-gray-600 text-white rounded-lg p-2">
                        {file.type.startsWith('image/') ? (
                          <img
                            src={imageUrls[file.url] || file.url}
                            alt={file.name}
                            className="w-40 h-40 object-cover rounded-md mb-1"
                          />
                        ) : (
                          <div className="w-20 h-20 flex items-center justify-center bg-gray-700 rounded-md mb-1">
                            <PaperClipIcon className="h-8 w-8" />
                          </div>
                        )}
                        <span className="truncate max-w-[80px] text-xs">
                          {file.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
              {editingMessageId === msg.id ? (
                <div ref={editMenuRef} className="w-full">
                  <textarea
                    ref={editTextareaRef}
                    value={editedContent}
                    onChange={(e) => {
                      setEditedContent(e.target.value);
                      adjustTextareaHeight(e.target);
                    }}
                    className="w-full bg-gray-700 text-white rounded-2xl rounded-br-sm px-3 py-2 text-base resize-none outline-none break-words overflow-hidden"
                    style={{ height: 'auto', minHeight: '56px' }}
                  />
                  <div className="flex justify-end mt-2 space-x-2">
                    <button
                      onClick={handleEditCancel}
                      className="px-3 py-1 text-sm bg-gray-600 text-white rounded-full hover:bg-gray-500"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleEditSubmit}
                      className="px-3 py-1 text-sm bg-vezmir text-white rounded-full hover:bg-vezmir-hover"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                renderContent(msg.content, index, copiedStates, setCopiedStates)
              )}
              {msg.isStreaming && (
                <div className="inline-block w-12 h-12">
                  <Lottie options={defaultOptions} height={40} width={40} />
                </div>
              )}
              {!msg.isStreaming && (msg.role === 'assistant' ? (
                <div className="absolute -bottom-6 left-0 flex space-x-2 mt-2 ml-12">
                  <button
                    onClick={() => handleCopy(msg.content)}
                    className="p-1 rounded bg-gray-700 hover:bg-gray-600 transition-colors flex items-center space-x-1"
                    title="Copy message"
                  >
                    {copiedStates[msg.content] ? (
                      <>
                        <CheckIcon className="h-4 w-4 text-white" />
                        <span className="text-xs text-white">{locale('chat_copy')}</span>
                      </>
                    ) : (
                      <>
                        <ClipboardDocumentIcon className="h-4 w-4 text-white" />
                        <span className="text-xs text-white">{locale('chat_copy')}</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleRegeneration(msg.parent!)}
                    className="p-1 rounded bg-gray-700 hover:bg-gray-600 transition-colors flex items-center space-x-1"
                    title="Regenerate response"
                  >
                    <ArrowPathIcon className="h-4 w-4 text-white" />
                    <span className="text-xs text-white">{locale('chat_regenerate')}</span>
                  </button>
                </div>
              ) : (
                <>
                  <div className="absolute -bottom-6 bg-gray-700 right-0 flex items-center space-x-2 mt-2 rounded-bl-md overflow-hidden">
                    {msg.navigation && (
                      <>
                        <button
                          className={`p-1 rounded ${msg.navigation.previous ? 'bg-gray-700 hover:bg-gray-600 cursor-pointer' : 'bg-gray-700 hover:bg-gray-700'} transition-colors`}
                          title={msg.navigation.previous ? "Previous message" : "No previous message"}
                          disabled={!msg.navigation.previous}
                          onClick={() => {
                            if (msg.id && msg.navigation && msg.navigation.previous) {
                              handleNavigation(msg.id, msg.navigation.previous)
                            }
                          }}
                        >
                          <ChevronLeftIcon className="h-4 w-4 text-white" />
                        </button>
                        <span className="text-xs text-white">{msg.navigation.position}</span>
                        <button
                          className={`p-1 rounded ${msg.navigation.next ? 'bg-gray-700 hover:bg-gray-600 cursor-pointer' : 'bg-gray-700 hover:bg-gray-700'} transition-colors`}
                          title="Next message"
                          disabled={!msg.navigation.next}
                          onClick={() => {
                            if (msg.id && msg.navigation && msg.navigation.next) {
                              handleNavigation(msg.id, msg.navigation.next)
                            }
                          }}
                        >
                          <ChevronRightIcon className="h-4 w-4 text-white" />
                        </button>
                      </>
                    )}

                  </div>
                </>
              ))}
            </div>
            )}

          </div>
          {msg.role === 'user' && !editingMessageId && (
            <button
              onClick={() => handleEditClick(msg.id || '', msg.content)}
              className="p-1 rounded bg-gray-800 hover:bg-gray-600 transition-colors flex items-center space-x-1 ml-2 mb-3 self-end"
              title="Rewrite message"
            >
              <PencilIcon className="h-5 w-5 text-white" />
            </button>
          )}
        </div>
      ))}

    </div>
  );
};

export default ChatMessages;
