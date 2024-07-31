import { useNavigate } from 'react-router-dom';
import api from '../../api';
import NewChatIcon from '../../UI/svg/newChatIcon';

const Header = () => {
    const navigate = useNavigate();

    const handleNewConversation = async () => {
        try {
        const response = await api.post('/chat/conversations/', {});
        navigate(`/chat/${response.id}`);
        } catch (error) {
        console.error('Error creating new conversation:', error);
        }
    };

    return (
        <button
            data-testid="wide-header-new-chat-button"
            type="button"
            className="w-full btn btn-neutral btn-large flex items-center justify-between whitespace-nowrap rounded-xl bg-gray-850 hover:bg-gray-800 py-4 px-6"
            onClick={handleNewConversation}
        >
            <span className="text-token-text-primary overflow-hidden text-ellipsis whitespace-nowrap text-lg font-medium">New chat</span>
            <NewChatIcon />
        </button>
    );
}

export default Header;