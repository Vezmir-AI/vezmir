import { useNavigate } from 'react-router-dom';
import { PencilSquareIcon } from '@heroicons/react/24/outline';

const NewChatButton = () => {
    const navigate = useNavigate();
    const goToNewChat = () => {
        navigate('/');
    }

    return (
        <button
            data-testid="wide-header-new-chat-button"
            type="button"
            className="w-full  border-4 border-[var(--bordeaux-hover)] flex items-center justify-between whitespace-nowrap rounded-3xl bg-gray-850 py-3 px-5"
            onClick={goToNewChat}
        >
            <span className="text-token-text-primary overflow-hidden text-ellipsis whitespace-nowrap text-xl font-bold">New chat</span>
            <PencilSquareIcon className="size-7" />
        </button>
    );
}

export default NewChatButton;
