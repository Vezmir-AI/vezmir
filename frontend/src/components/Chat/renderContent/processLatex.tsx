import React from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

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

export default processLatex;