import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

const renderMarkdown = (content: string | React.ReactNode[]) => {
  const components = {
    ol: ({node, ...props}) => <ol className="list-decimal list-outside pl-6 my-2" {...props} />,
    ul: ({node, ...props}) => <ul className="list-disc list-outside pl-6 my-2" {...props} />,
    li: ({node, children, ...props}) => (
      <li className="my-1" {...props}>
        <span className="inline">{children}</span>
      </li>
    ),
    p: ({node, ...props}) => <p className="my-2" {...props} />
  };

  if (Array.isArray(content)) {
    return content.map((item, index) => 
      typeof item === 'string' ? 
        <ReactMarkdown 
          key={index} 
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
          components={components}
        >
          {item}
        </ReactMarkdown> : 
        item
    );
  }
  
  return (
    <ReactMarkdown 
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw]}
      components={components}
    >
      {content as string}
    </ReactMarkdown>
  );
};

export default renderMarkdown;

