import { useNavigate } from 'react-router-dom';
import { PencilSquareIcon } from '@heroicons/react/24/outline';
import { useTheme } from '@/context/ThemeContext';

const NewChatButton = () => {
    const navigate = useNavigate();
    const { locale } = useTheme();
    const goToNewChat = () => {
        navigate('/');
    }

    return (
        <button
            data-testid="wide-header-new-chat-button"
            type="button"
            className="w-full flex items-center justify-between whitespace-nowrap rounded-3xl bg-gray-850 py-2 px-5"
            onClick={goToNewChat}
        >
            <span className="text-token-text-primary overflow-hidden text-ellipsis whitespace-nowrap text-lg font-bold">{locale('chat_new_chat')}</span>
            <PencilSquareIcon className="size-7" />
        </button>
    );
}

export default NewChatButton;
