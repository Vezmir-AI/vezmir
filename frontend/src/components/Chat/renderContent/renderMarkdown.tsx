import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

const renderMarkdown = (content: string | React.ReactNode[]) => {
  const components = {
    ol: ({ ordered, ...props }: { ordered?: boolean } & React.OlHTMLAttributes<HTMLOListElement>) =>
      <ol className="list-decimal list-outside pl-6 my-2" {...props} />,
    ul: ({ ordered, ...props }: { ordered?: boolean } & React.HTMLAttributes<HTMLUListElement>) =>
      <ul className="list-disc list-outside pl-6 my-2" {...props} />,
    li: ({children, ...props}: {children: React.ReactNode, [key: string]: any}) => {
      const { ordered, ...restProps } = props;
      return (
        <li className="my-1" {...restProps}>
          <span className="inline">{children}</span>
        </li>
      );
    },
    p: ({...props}) => <p className="my-2" {...props} />
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
