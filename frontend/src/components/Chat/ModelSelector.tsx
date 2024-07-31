import React, { useState, useEffect} from 'react';
import { ChevronDown } from 'lucide-react';
import api from '../../api';

interface AiModel {
  id: string;
  name: string;
}

interface ModelSelectorProps {
  selectedModel: string;
  setSelectedModel: React.Dispatch<React.SetStateAction<string>>;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({ selectedModel, setSelectedModel }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [aiModels, setAiModels] = useState<AiModel[]>([]);

  useEffect(() => {
    fetchAiModels();
  }, []);

  const handleModelChange = (modelId: string) => {
    setSelectedModel(modelId);
    setIsOpen(false);
  };

  const fetchAiModels = async (): Promise<void> => {
    try {
      const response = await api.get('/ai_models/');
      setAiModels(response);
      if (response.length > 0 && !selectedModel) {
        setSelectedModel(response[0].name);
      }
    } catch (error) {
      console.error('Error fetching AI models:', error);
    }
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
          {selectedModel}
          <ChevronDown className="-mr-1 ml-2 h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-72 rounded-md shadow-lg bg-gray-700 ring-1 ring-black ring-opacity-5">
          <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
            {aiModels.map((model) => (
              <button
                key={model.name}
                className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-600 hover:text-gray-100"
                role="menuitem"
                onClick={() => handleModelChange(model.name)}
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