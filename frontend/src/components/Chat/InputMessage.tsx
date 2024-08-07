import React, { useState, useRef, useEffect } from 'react';
import SendIcon from '../../UI/svg/SendIcon';

interface InputMessageProps {
  selectedModel: { display_name: string } | null;
  isStreaming: boolean;
  onSendMessage: (message: string) => void;
}

const InputMessage: React.FC<InputMessageProps> = ({ selectedModel, isStreaming, onSendMessage }) => {
  const [inputMessage, setInputMessage] = useState<string>('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    adjustTextareaHeight();
  }, [inputMessage]);

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      const lineHeight = 24;
      const maxHeight = lineHeight * 4;
      textareaRef.current.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    onSendMessage(inputMessage);
    setInputMessage('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    } else if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault();
      setInputMessage(prev => prev + '\n');
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
        }
      }, 0);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-gray-800 mt-auto">
      <div className="flex items-center max-w-4xl mx-auto">
        <textarea
          ref={textareaRef}
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-grow p-4 rounded-l-xl bg-gray-700 text-white text-lg border border-gray-600 focus:outline-none focus:ring-0 focus:border-gray-600 resize-none overflow-y-auto"
          placeholder={`Message ${selectedModel?.display_name || ''}`}
          rows={1}
          style={{ minHeight: '56px', maxHeight: '120px' }}
        />
        <button
          type="submit"
          className="bg-gray-400 text-white p-4 rounded-r-xl text-lg flex items-center justify-center hover:bg-gray-300"
          disabled={isStreaming}
        >
          <SendIcon className="w-6 h-6" />
        </button>
      </div>
    </form>
  );
};

export default InputMessage;