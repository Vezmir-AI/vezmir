import React, { useState } from 'react';
import { Message } from '@/types';
import renderContent from './renderContent/renderContent';

interface ChatMessagesProps {
  messages: Message[];
}

const ChatMessages: React.FC<ChatMessagesProps> = ({ messages }) => {
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({});

  return (
    <div className="flex-grow overflow-y-auto p-4 space-y-4">
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
            } p-3`}
          >
            {renderContent(msg.content, index, copiedStates, setCopiedStates)}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChatMessages;