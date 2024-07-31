import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface AiModel {
  id: string;
  name: string;
}

interface ModelSelectorProps {
  selectedModel: string;
  setSelectedModel: (modelId: string) => void;
  aiModels: AiModel[];
}

const ModelSelector: React.FC<ModelSelectorProps> = ({ selectedModel, setSelectedModel, aiModels }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleModelChange = (modelId: string) => {
    setSelectedModel(modelId);
    setIsOpen(false);
  };

  const currentModel = aiModels.find(model => model.id === selectedModel);

  return (
    <div className="relative inline-block text-left w-72">
      <div>
        <button
          type="button"
          className="inline-flex justify-between w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-indigo-500"
          onClick={() => setIsOpen(!isOpen)}
        >
          {currentModel ? currentModel.name : 'Select a model'}
          <ChevronDown className="-mr-1 ml-2 h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-72 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
          <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
            {aiModels.map((model) => (
              <button
                key={model.id}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                role="menuitem"
                onClick={() => handleModelChange(model.id)}
              >
                {model.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelSelector;