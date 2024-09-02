import React, { useState, useEffect } from 'react';
import { Message } from '@/types';
import renderContent from './renderContent/renderContent';
import { getProviderLogo, getProviderColor } from '@/utils/providerUtils';

interface ChatMessagesProps {
  messages: Message[];
}

const ChatMessages: React.FC<ChatMessagesProps> = ({ messages }) => {
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
  }, [messages]);

  return (
    <div className="flex-grow overflow-y-auto p-4 space-y-4 max-w-4xl mx-auto">
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
            } px-3 py-2 text-base flex items-start`}
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
                    {messages[index].ai_model_details?.name}
                  </div>
                )}
              </div>
            )}
            <div className="relative group flex-grow">
              {renderContent(msg.content, index, copiedStates, setCopiedStates)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChatMessages;
