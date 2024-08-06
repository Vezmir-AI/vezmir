import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { useParams } from 'react-router-dom';
import TrashIcon from '../../UI/svg/TrashIcon';

interface Conversation {
    id: string;
    name: string;
  }

interface ChatHistoryProps {
    conversations: Conversation[];
    setConversations: (conversations: Conversation[]) => void;
    resetMessages: () => void; // Added this line
}

const ChatHistory = ({ conversations, setConversations, resetMessages }: ChatHistoryProps) => {
    const navigate = useNavigate();
    const { chatId } = useParams<{ chatId: string }>();


    const handleDeleteConversation = async (id: string): Promise<void> => {
        try {
          await api.delete(`/chat/conversations/${id}/`);
          setConversations(conversations.filter(conv => conv.id !== id));
          if (chatId === id) {
            navigate('/chat');
            resetMessages();
          }
        } catch (error) {
          console.error('Error deleting conversation:', error);
        }
      };

    return (
        <div className="flex-grow overflow-y-auto">
            {conversations.map((conv) => (
            <div key={conv.id} className="mb-2 hover:bg-gray-800">
                <div className="p-3 flex justify-between items-center">
                    <span
                        className="cursor-pointer flex-grow text-white text-lg"
                        onClick={() => navigate(`/chat/${conv.id}`)}
                    >
                        {conv.name}
                    </span>
                    <button
                        onClick={() => handleDeleteConversation(conv.id)}
                        className="p-2 rounded-full bg-gray-800 hover:bg-red-500 transition-colors duration-200"
                        aria-label="Delete conversation"
                    >
                        <TrashIcon className="text-white" color="white" size={20} />
                    </button>
                </div>
            </div>
            ))}
        </div>
    );
};

export default ChatHistory;