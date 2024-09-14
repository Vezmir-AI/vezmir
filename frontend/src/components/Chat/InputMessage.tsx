import React, { useState, useRef, useEffect } from 'react';
import { PaperClipIcon, XMarkIcon } from '@heroicons/react/24/outline';
import arrowSend from '@/assets/arrowSend.svg';
import { useTheme } from '@/context/ThemeContext';
import { AIModel } from '@/types';

interface InputMessageProps {
  selectedModel: string | null;
  selectedAIModel: AIModel | null;
  isStreaming: boolean;
  onSendMessage: (message: string, files?: File[]) => void;
}

const InputMessage: React.FC<InputMessageProps> = ({ selectedModel, selectedAIModel, isStreaming, onSendMessage }) => {
  const [inputMessage, setInputMessage] = useState<string>('');
  const { locale } = useTheme();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const isPerplexityModel = selectedAIModel?.provider === 'Perplexity';
  const isFileInputDisabled = selectedFiles.length >= 5 || isPerplexityModel;
  const [enableHorizontalScroll, setEnableHorizontalScroll] = useState(false);

  useEffect(() => {
    adjustTextareaHeight();
  }, [inputMessage]);

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;

      const lineHeight = parseInt(window.getComputedStyle(textareaRef.current).lineHeight);
      const visibleLines = Math.floor(textareaRef.current.clientHeight / lineHeight);

      setEnableHorizontalScroll(visibleLines > 6);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() && selectedFiles.length === 0) return;
    onSendMessage(inputMessage, selectedFiles);
    setInputMessage('');
    setSelectedFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const validFiles = files.filter(file => {
        const isValidSize = file.size <= 30 * 1024 * 1024; // 30MB limit
        const isValidType = ['image/jpeg', 'image/png'].includes(file.type);
        return isValidSize && isValidType;
      });
      const newFiles = [...selectedFiles, ...validFiles].slice(0, 5); // Limit to 5 files
      setSelectedFiles(newFiles);
    }
  };

  const handleFileDelete = (index: number) => {
    setSelectedFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  return (
    <form onSubmit={handleSubmit} className="bg-[var(--gray-dark)] mt-auto mb-8">
      {selectedFiles.length > 0 && (
        <div className="flex flex-wrap gap-2 max-w-4xl mx-auto pl-6">
          {selectedFiles.map((file, index) => (
            <div key={index} className="flex items-center bg-[var(--purple)] text-white rounded-t-[15px] px-3 py-1">
              <span className="text-sm truncate max-w-[150px]">
                {file.name.length > 20
                  ? file.name.slice(0, 6) + '...' + file.name.split('.').pop()
                  : file.name}
              </span>
              <button
                type="button"
                onClick={() => handleFileDelete(index)}
                className="ml-2 text-gray-400 hover:text-white p-1 rounded-full"
              >
                <XMarkIcon className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="flex items-center max-w-4xl mx-auto relative bg-[var(--gray-800)]">
        <textarea
          ref={textareaRef}
          value={inputMessage}
          onChange={(e) => {
            setInputMessage(e.target.value);
            adjustTextareaHeight();
          }}
          onKeyDown={handleKeyDown}
          className={`flex-grow p-4 pl-16 pr-16 rounded-[25px] bg-[var(--gray-700)] text-white text-lg border border-[var(--gray-700)] focus:outline-none focus:ring-0 focus:border-[var(--gray-700)] resize-none ${enableHorizontalScroll ? 'overflow-x-auto' : 'overflow-hidden'}`}
          placeholder={isStreaming ? `${selectedModel} is thinking...` : `Message ${selectedModel ?? ''}`}
          rows={1}
          style={{ minHeight: '56px', maxHeight: '200px' }}
        />
        <button
          type="button"
          onClick={() => !isFileInputDisabled && fileInputRef.current?.click()}
          className={`absolute left-3 bottom-2.5 p-2 rounded-full text-lg flex items-center justify-center ${
            isFileInputDisabled ? 'text-gray-400 cursor-not-allowed hover:bg-[var(--purple)]' : 'text-white hover:bg-[var(--purple-hover)]'
          }`}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          disabled={isFileInputDisabled}
        >
          <PaperClipIcon className="h-6 w-6 stroke-width-4 -rotate-45" />
          {showTooltip && (
            <div className="absolute bottom-full left-0 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap">
              {locale('chat_upload_pdf')}
            </div>
          )}
        </button>
        <button
          type="submit"
          className={`absolute right-3 bottom-2.5 p-2 rounded-full text-lg flex items-center justify-center transition-colors duration-200 ${
            inputMessage.trim() ? 'bg-white hover:bg-gray-200' : 'bg-gray-400 hover:bg-gray-400'
          } ${(isStreaming || !inputMessage.trim()) ? 'cursor-not-allowed opacity-50' : ''}`}
          disabled={isStreaming || !inputMessage.trim()}
        >
          <div className="w-6 h-6 flex items-center justify-center">
            <img
              src={arrowSend}
              className={`w-5 h-5`}
            />
          </div>
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          multiple
          accept="image/jpeg,image/png"
          className="hidden"
          disabled={selectedFiles.length >= 5}
        />
      </div>
    </form>
  );
};

export default InputMessage;
