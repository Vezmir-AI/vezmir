import React, { useState, useEffect, useRef } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface ArtifactButtonProps {
  title: string;
  language: string;
  content: string;
  copiedStates: { [key: string]: boolean };
  setCopiedStates: React.Dispatch<React.SetStateAction<{ [key: string]: boolean }>>;
  artifactKey: string;
  isStreaming: boolean;
  initiallyOpen: boolean;
}

const ArtifactButton: React.FC<ArtifactButtonProps> = ({
  title,
  language,
  content,
  copiedStates,
  setCopiedStates,
  artifactKey,
  isStreaming,
  initiallyOpen,
}) => {
  const [isOpen, setIsOpen] = useState(initiallyOpen);
  const [isCopied, setIsCopied] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isStreaming && initiallyOpen) {
      setIsOpen(false);
    }
  }, [isStreaming, initiallyOpen]);

  const handleCopy = () => {
    navigator.clipboard.writeText(content).then(() => {
      setIsCopied(true);
      setCopiedStates((prevState) => ({ ...prevState, [artifactKey]: true }));
      setTimeout(() => {
        setIsCopied(false);
        setCopiedStates((prevState) => ({ ...prevState, [artifactKey]: false }));
      }, 2000);
    });
  };

  const handleClose = () => {
    if (!isStreaming) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, isStreaming]);

  const buttonText = isCopied ? 'Copied!' : 'Copy';

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-vezmir text-white rounded-md transition-colors duration-200 hover:bg-vezmir-hover"
      >
        {title}
      </button>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div ref={modalRef} className="bg-gray-800 rounded-lg p-6 max-w-3xl w-full max-h-[80vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">{title}</h3>
              <div>
                <button
                  onClick={handleCopy}
                  className={`px-3 py-1 rounded-md transition-colors duration-200 mr-2 ${
                    isCopied
                      ? 'bg-green-500 hover:bg-green-700'
                      : 'bg-blue-500 hover:bg-blue-700'
                  } text-white text-sm`}
                >
                  {buttonText}
                </button>
                <button
                  onClick={handleClose}
                  className={`text-gray-400 hover:text-white ${isStreaming ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={isStreaming}
                >
                  Close
                </button>
              </div>
            </div>
            <SyntaxHighlighter
              language={language}
              style={oneDark}
              customStyle={{ margin: 0 }}
            >
              {content}
            </SyntaxHighlighter>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArtifactButton;
