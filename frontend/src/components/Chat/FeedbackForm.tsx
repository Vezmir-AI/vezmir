import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import api from '@/api';
import { useTheme } from '@/context/ThemeContext';

interface FeedbackFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({ isOpen, onClose }) => {
  const [feedback, setFeedback] = useState('');
  const { locale } = useTheme();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/feedback/', { message: feedback });
      alert('Feedback sent successfully!');
      setFeedback('');
      onClose();
    } catch (error) {
      console.error('Error sending feedback:', error);
      alert('Failed to send feedback. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">{locale('feedback_send')}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="w-full h-32 p-2 mb-4 bg-gray-700 text-white rounded"
            placeholder="Enter your feedback here..."
          />
          <button
            type="submit"
            className="w-full bg-vezmir hover:bg-vezmir-hover text-white font-bold py-2 px-4 rounded"
          >
            {locale('feedback_send')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default FeedbackForm;
