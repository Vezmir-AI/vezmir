import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { TrashIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { useConversation } from '@/context/ConversationContext';

const ChatHistory: React.FC = () => {
    const navigate = useNavigate();
    const { chatId } = useParams<{ chatId: string }>();
    const { conversations, deleteConversation } = useConversation();
    const [showAllConversations, setShowAllConversations] = useState(false);

    const toggleAllConversations = () => {
        setShowAllConversations(!showAllConversations);
    };

    const handleDeleteConversation = (id: string, event: React.MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();
        deleteConversation(id);
        if (chatId === id) {
            navigate('/');
            // Emit a custom event when the current conversation is deleted
            window.dispatchEvent(new CustomEvent('conversationDeleted', { detail: { id } }));
        }
    };

    return (
        <ul role="list" className="-mx-2 space-y-1">
            {conversations.slice(0, 3).map((item) => (
                <li key={item.id}>
                    <div className="flex items-center justify-between bg-[var(--gray-800)]">
                        <Link
                            to={`/chat/${item.id}`}
                            className="text-[var(--gray-400)] hover:bg-[var(--gray-800)] hover:text-white group flex-grow flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6"
                            title={item.name}
                        >
                            {item.name}
                        </Link>
                        <button
                            onClick={(e) => handleDeleteConversation(item.id, e)}
                            className="p-2 text-[var(--gray-400)] hover:text-white"
                            title="Delete conversation"
                        >
                            <TrashIcon className="h-4 w-4" />
                        </button>
                    </div>
                </li>
            ))}
            {conversations.length > 3 && (
                <li>
                    <button
                        onClick={toggleAllConversations}
                        className="flex items-center w-full text-gray-400 hover:bg-gray-800 hover:text-white group gap-x-3 rounded-md p-2 text-sm font-semibold leading-6"
                    >
                        {showAllConversations ? (
                            <>
                                <ChevronUpIcon className="h-5 w-5" />
                                Show less
                            </>
                        ) : (
                            <>
                                <ChevronDownIcon className="h-5 w-5" />
                                Show all ({conversations.length-3})
                            </>
                        )}
                    </button>
                </li>
            )}
            {showAllConversations && conversations.slice(3).map((item) => (
                <li key={item.id}>
                    <div className="flex items-center justify-between">
                        <Link
                            to={`/chat/${item.id}`}
                            className="text-gray-400 hover:bg-gray-800 hover:text-white group flex-grow flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6"
                            title={item.name}
                        >
                            {item.name}
                        </Link>
                        <button
                            onClick={(e) => handleDeleteConversation(item.id, e)}
                            className="p-2 text-gray-400 hover:text-white"
                            title="Delete conversation"
                        >
                            <TrashIcon className="h-4 w-4" />
                        </button>
                    </div>
                </li>
            ))}
        </ul>
    );
};

export default ChatHistory;