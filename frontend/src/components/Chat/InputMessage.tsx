  import React, { useState, useRef, useEffect } from 'react';
import SendIcon from '@/UI/svg/SendIcon';

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
      textareaRef.current.style.overflowY = scrollHeight > maxHeight ? 'auto' : 'hidden';
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
    <form onSubmit={handleSubmit} className="p-4 bg-[var(--gray-dark)] mt-auto">
      <div className="flex items-center max-w-4xl mx-auto relative bg-[var(--gray-800)]">
        <textarea
          ref={textareaRef}
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-grow p-4 pr-16 rounded-[25px] bg-[var(--gray-700)] text-white text-lg border border-[var(--gray-700)] focus:outline-none focus:ring-0 focus:border-[var(--gray-700)] resize-none overflow-hidden"
          placeholder={`Message ${selectedModel?.display_name || ''}`}
          rows={1}
          style={{ minHeight: '56px', maxHeight: '120px' }}
        />
        <button
          type="submit"
          className={`absolute right-3 bottom-2.5 p-2 rounded-full text-lg flex items-center justify-center transition-colors duration-200 ${
            inputMessage.trim() ? 'bg-white text-gray-800 hover:bg-gray-400' : 'bg-gray-400 text-white hover:bg-gray-400'
          } ${(isStreaming || !inputMessage.trim()) ? 'cursor-not-allowed opacity-50' : ''}`}
          disabled={isStreaming || !inputMessage.trim()}
        >
          <SendIcon />
        </button>
      </div>
    </form>
  );
};

export default InputMessage;