import React, { useState, useEffect } from 'react';
import { Message } from '@/types';
import renderContent from './renderContent/renderContent';
import { getProviderLogo, getProviderColor } from '@/utils/providerUtils';
import { ClipboardDocumentIcon, ArrowPathIcon, CheckIcon } from '@heroicons/react/24/outline';

interface ChatMessagesProps {
  messages: Message[];
  isStreaming: boolean;
  onRegenerateMessage: (messageIndex: number) => void;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({ messages, isStreaming, onRegenerateMessage }) => {
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({});

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedStates(prev => ({ ...prev, [content]: true }));
    setTimeout(() => setCopiedStates(prev => ({ ...prev, [content]: false })), 2000);
  };

  return (
    <div className="flex-grow overflow-y-auto p-4 space-y-4 max-w-4xl mx-auto mb-4">
      {messages.map((msg, index) => (
        <div
          key={index}
          className={`flex ${
            msg.role === 'user' ? 'justify-end' : 'justify-start'
          }`}
        >
          <div
            className={`max-w-[80%] ${
              msg.role === 'user'
                ? 'bg-[var(--gray-700)] text-white rounded-3xl rounded-br-sm'
                : 'bg-[var(--gray-800)] text-white rounded-3xl rounded-tl-sm'
            } px-3 py-2 text-base flex items-start relative`}
          >
            {msg.role !== 'user' && (
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
            <div className="relative flex-grow">
              {renderContent(msg.content, index, copiedStates, setCopiedStates)}
              {!isStreaming && msg.role === 'assistant' && (
                <div className="absolute -bottom-6 left-0 flex space-x-2 mt-2">
                  <button
                    onClick={() => handleCopy(msg.content)}
                    className="p-1 rounded bg-[var(--gray-700)] hover:bg-[var(--gray-600)] transition-colors flex items-center space-x-1"
                    title="Copy message"
                  >
                    {copiedStates[msg.content] ? (
                      <>
                        <CheckIcon className="h-4 w-4 text-white" />
                        <span className="text-xs text-white">Copy</span>
                      </>
                    ) : (
                      <>
                        <ClipboardDocumentIcon className="h-4 w-4 text-white" />
                        <span className="text-xs text-white">Copy</span>
                      </>
                    )}
                  </button>
                  {/* <button
                    onClick={() => onRegenerateMessage(index)}
                    className="p-1 rounded bg-[var(--gray-700)] hover:bg-[var(--gray-600)] transition-colors flex items-center space-x-1"
                    title="Regenerate response"
                  >
                    <ArrowPathIcon className="h-4 w-4 text-white" />
                    <span className="text-xs text-white">Retry</span>
                  </button> */}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChatMessages;
