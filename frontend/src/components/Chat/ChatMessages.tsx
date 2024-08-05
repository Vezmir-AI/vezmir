import React from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatMessagesProps {
  messages: Message[];
}

const ChatMessages: React.FC<ChatMessagesProps> = ({ messages }) => {
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
                ? 'bg-gray-700 text-white rounded-3xl rounded-br-sm'
                : 'bg-gray-800 text-white rounded-3xl rounded-tl-sm'
            } p-3`}
          >
            {msg.content}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChatMessages;