import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { AIModel } from '@/types';
import { getProviderLogo, getProviderColor } from '../../utils/providerUtils';
import { useConversation } from '../../context/ConversationContext';


const ModelSelector: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredHint, setHoveredHint] = useState<string | null>(null);
  const { aiModels, selectedAIModel, setSelectedAIModel } = useConversation();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleModelChange = (model: AIModel) => {
    setSelectedAIModel(model);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left w-full sm:w-72 z-50" ref={dropdownRef}>
      <div>
        <button
          type="button"
          className={`inline-flex justify-between w-full rounded-xl shadow-sm px-3 py-2 sm:px-5 sm:py-3 text-sm sm:text-lg font-medium text-gray-300 bg-[var(--gray-700)] hover:bg-[var(--gray-600)] focus:outline-none focus:ring-0`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="truncate">
            {aiModels.find(model => model.name === selectedAIModel?.name)?.display_name || 'Select a model'}
          </span>
          <ChevronDown className="ml-2 h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
        </button>
      </div>

      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-full sm:w-72 rounded-md shadow-lg bg-[var(--gray-700)] z-50">
          <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
            {aiModels.map((model) => (
              <button
                key={model.display_name}
                className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-300 bg-[var(--gray-700)] hover:bg-[var(--gray-800)] hover:text-gray-100"
                role="menuitem"
                onClick={() => handleModelChange(model)}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex flex-col relative">
                    <span className="font-medium">{model.display_name || model.name}</span>
                    <div className="flex items-center text-xs text-gray-400">
                      <span>{model.provider}</span>
                      <span
                        className="ml-2 cursor-help underline"
                        onMouseEnter={() => setHoveredHint(model.display_name)}
                        onMouseLeave={() => setHoveredHint(null)}
                      >
                        hint
                      </span>
                    </div>
                    {hoveredHint === model.display_name && (
                      <div className="absolute z-10 p-2 left-0 top-full mt-1 text-sm text-white bg-[var(--gray-700)] rounded-md shadow-lg whitespace-nowrap">
                        {model.hint}
                      </div>
                    )}
                  </div>
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full ${getProviderColor(model.provider)}`}>
                    <img
                      src={getProviderLogo(model.provider)}
                      alt={`${model.provider} logo`}
                      className="w-6 h-6"
                    />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelSelector;
