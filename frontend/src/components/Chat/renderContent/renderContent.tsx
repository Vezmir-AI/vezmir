import React from 'react';
import renderCodeBlock from './renderCodeBlock';
import processLatex from './processLatex';
import renderMarkdown from './renderMarkdown';
import renderArtifact from './renderArtifact';

const renderContent = (
  content: string,
  messageIndex: number,
  copiedStates: { [key: string]: boolean },
  setCopiedStates: React.Dispatch<React.SetStateAction<{ [key: string]: boolean }>>,
  isStreaming: boolean
) => {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let openArtifacts: { [key: string]: boolean } = {};

  // Updated regex to capture artifacts as soon as the opening tag is encountered
  const regex = /(?:```(\w+)?\n([\s\S]*?)```)|(?:<artifact\s+title="([^"]+)"\s+language="([^"]+)"(?:>|\s*$)([\s\S]*?)(?:<\/artifact>|$))/g;

  let match;

  while ((match = regex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      // Process text before code block or artifact for LaTeX
      const textBefore = content.slice(lastIndex, match.index);
      parts.push(...processLatex(textBefore, messageIndex, parts.length));
    }

    if (match[3] !== undefined) {
      // Handle artifact
      const [, , , title, language, artifactContent] = match;
      const artifactKey = `artifact-${messageIndex}-${parts.length}`;
      const isOpen = isStreaming && !match[0].endsWith('</artifact>');
      openArtifacts[artifactKey] = isOpen;
      parts.push(renderArtifact(title, language, artifactContent.trim(), artifactKey, copiedStates, setCopiedStates, isStreaming, isOpen));
    } else {
      // Handle code block
      const language = match[1] || 'text';
      const code = match[2].trim();
      const codeBlockIndex: number = parts.length;
      const codeBlockKey = `${messageIndex}-${codeBlockIndex}`;
      parts.push(renderCodeBlock(language, code, codeBlockKey, copiedStates, setCopiedStates));
    }

    lastIndex = match.index + match[0].length;
  }

  // Process any remaining text for LaTeX
  if (lastIndex < content.length) {
    const remainingText = content.slice(lastIndex);
    parts.push(...processLatex(remainingText, messageIndex, parts.length));
  }

  // Render the entire content as Markdown
  return renderMarkdown(parts);
};

export default renderContent;
