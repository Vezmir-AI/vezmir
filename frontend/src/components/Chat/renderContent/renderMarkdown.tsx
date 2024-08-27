import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const renderMarkdown = (content: string | React.ReactNode[]) => {
  if (Array.isArray(content)) {
    return content.map((item, index) => 
      typeof item === 'string' ? 
        <ReactMarkdown key={index} remarkPlugins={[remarkGfm]}>{item}</ReactMarkdown> : 
        item
    );
  }
  
  return <ReactMarkdown remarkPlugins={[remarkGfm]}>{content as string}</ReactMarkdown>;
};

export default renderMarkdown;

