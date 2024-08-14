import { useNavigate } from 'react-router-dom';
import NewChatIcon from '../../UI/svg/newChatIcon';

const NewChatButton = () => {
    const navigate = useNavigate();
    const goToNewChat = () => {
        navigate('/');
    }

    return (
        <button
            data-testid="wide-header-new-chat-button"
            type="button"
            className="w-full flex items-center justify-between whitespace-nowrap rounded-xl bg-gray-850 hover:bg-gray-700 py-3 px-5"
            onClick={goToNewChat}
        >
            <span className="text-token-text-primary overflow-hidden text-ellipsis whitespace-nowrap text-lg font-medium">New chat</span>
            <NewChatIcon />
        </button>
    );
}

export default NewChatButton;