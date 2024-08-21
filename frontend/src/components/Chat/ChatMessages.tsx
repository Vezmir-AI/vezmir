import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatMessagesProps {
  messages: Message[];
}

const ChatMessages: React.FC<ChatMessagesProps> = ({ messages }) => {
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({});

  const renderContent = (content: string, messageIndex: number) => {
    const parts = [];
    let lastIndex = 0;

    // Regular expression for code blocks
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;

    let match;

    // First, handle code blocks
    while ((match = codeBlockRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        // Process text before code block for LaTeX
        const textBeforeCode = content.slice(lastIndex, match.index);
        parts.push(...processLatex(textBeforeCode, messageIndex, parts.length));
      }

      const language = match[1] || 'text';
      const code = match[2].trim();
      const codeBlockIndex = parts.length;
      const codeBlockKey = `${messageIndex}-${codeBlockIndex}`;

      parts.push(
        <div key={match.index} className="relative my-4 flex justify-center">
          <div className="w-full max-w-3xl bg-gray-800 rounded-lg overflow-hidden">
            <div className="flex justify-between items-center bg-gray-700 px-4 py-2">
              <span className="text-sm text-gray-300">{language}</span>
              <button
                className="text-sm text-white bg-gray-600 hover:bg-gray-500 px-2 py-1 rounded"
                onClick={() => {
                  navigator.clipboard.writeText(code);
                  setCopiedStates(prev => ({ ...prev, [codeBlockKey]: true }));
                  setTimeout(() => {
                    setCopiedStates(prev => ({ ...prev, [codeBlockKey]: false }));
                  }, 3000);
                }}
              >
                {copiedStates[codeBlockKey] ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <SyntaxHighlighter
              language={language}
              style={atomDark}
              customStyle={{ margin: 0, padding: '1rem' }}
            >
              {code}
            </SyntaxHighlighter>
          </div>
        </div>
      );

      lastIndex = match.index + match[0].length;
    }

    // Process any remaining text for LaTeX
    if (lastIndex < content.length) {
      const remainingText = content.slice(lastIndex);
      parts.push(...processLatex(remainingText, messageIndex, parts.length));
    }

    return parts;
  };

  const processLatex = (text: string, messageIndex: number, startIndex: number) => {
    const parts = [];
    let lastIndex = 0;
    let match;

    const combinedRegex = /(\\\(.*?\\\)|\\\[[\s\S]*?\\\])/g;

    while ((match = combinedRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }


      const latexContent = match[1];
      if (latexContent.startsWith('\\(') && latexContent.endsWith('\\)')) {
        // Inline LaTeX
        parts.push(
          <InlineMath
            key={`${messageIndex}-${startIndex + parts.length}`}
            math={latexContent.slice(2, -2)}
          />
        );
      } else if (latexContent.startsWith('\\[') && latexContent.endsWith('\\]')) {
        // Block LaTeX
        parts.push(
          <BlockMath
            key={`${messageIndex}-${startIndex + parts.length}`}
            math={latexContent.slice(2, -2)}
          />
        );
      }

      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return parts;
  };

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
            {renderContent(msg.content, index)}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChatMessages;