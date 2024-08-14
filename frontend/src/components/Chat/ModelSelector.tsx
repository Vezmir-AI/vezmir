import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { getProviderLogo, getProviderColor } from '../../utils/providerUtils';
import { useConversation } from '../../context/ConversationContext';
interface AiModel {
  id: string;
  name: string;
  provider: string;
  display_name: string;
  hint: string;
}


const ModelSelector: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredHint, setHoveredHint] = useState<string | null>(null);
  const { aiModels, selectedAIModel, setSelectedAIModel } = useConversation();


  const handleModelChange = (model: AiModel) => {
    setSelectedAIModel(model);
    setIsOpen(false);
  };


  return (
    <div className="relative inline-block text-left w-72">
      <div>
        <button
          type="button"
          className={`inline-flex justify-between w-full rounded-xl shadow-sm px-5 py-3 text-lg font-medium text-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-700 focus:ring-gray-500 ${
            isOpen ? 'bg-gray-700' : 'bg-gray-800 hover:bg-gray-700'
          }`}
          onClick={() => setIsOpen(!isOpen)}
        >
          {aiModels.find(model => model.name === selectedAIModel?.name)?.display_name || 'Select a model'}
          <ChevronDown className="-mr-1 ml-2 h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-72 rounded-md shadow-lg bg-gray-700 ring-1 ring-black ring-opacity-5">
          <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
            {aiModels.map((model) => (
              <button
                key={model.display_name}
                className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-600 hover:text-gray-100"
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
                      <div className="absolute z-10 p-2 left-0 top-full mt-1 text-sm text-white bg-gray-800 rounded-md shadow-lg whitespace-nowrap">
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