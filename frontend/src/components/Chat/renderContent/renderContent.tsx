import React from 'react';
import renderCodeBlock from './renderCodeBlock';
import processLatex from './processLatex';
import renderMarkdown from './renderMarkdown';

const renderContent = (
  content: string,
  messageIndex: number,
  copiedStates: { [key: string]: boolean },
  setCopiedStates: React.Dispatch<React.SetStateAction<{ [key: string]: boolean }>>
) => {
  const parts: React.ReactNode[] = [];
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
    const codeBlockIndex: number = parts.length;
    const codeBlockKey = `${messageIndex}-${codeBlockIndex}`;

    parts.push(renderCodeBlock(language, code, codeBlockKey, copiedStates, setCopiedStates));

    lastIndex = match.index + match[0].length;
  }

  // Process any remaining text for LaTeX
  if (content && lastIndex < content.length) {
    const remainingText = content.slice(lastIndex);
    parts.push(...processLatex(remainingText, messageIndex, parts.length));
  }

  // Render the entire content as Markdown
  return renderMarkdown(parts);
};

export default renderContent;
