import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

const renderCodeBlock = (
  language: string,
  code: string,
  codeBlockKey: string,
  copiedStates: { [key: string]: boolean },
  setCopiedStates: React.Dispatch<React.SetStateAction<{ [key: string]: boolean }>>
) => (
  <div key={codeBlockKey} className="relative my-4 flex justify-center">
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

export default renderCodeBlock;
