import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { TrashIcon, XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useConversation } from '@/context/ConversationContext';

const ChatHistory: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [chatId, setChatId] = useState<string | null>(null);
    const { conversations, deleteConversation } = useConversation();
    const [showConfirmationDelete, setShowConfirmationDelete] = useState(false);
    const [conversationToDelete, setConversationToDelete] = useState<string | null>(null);

    useEffect(() => {
        const currentChatId = location.pathname.split('/').pop() || null;
        setChatId(currentChatId);
    }, [location.pathname]);

    const handleDeleteConversation = (id: string, event: React.MouseEvent) => {
        console.log('delete conversation', id, chatId);
        event.preventDefault();
        event.stopPropagation();
        deleteConversation(id);
        if (chatId === id) {
            navigate('/');
            window.dispatchEvent(new CustomEvent('conversationDeleted', { detail: { id } }));
        }
    };

    return (
        <ul role="list" className="space-y-0 overflow-y-auto">
            {conversations.map((item) => (
                <li key={item.id}>
                    <div className={`group flex items-center justify-between rounded-md ${item.id === chatId ? 'bg-[var(--gray-800)]' : 'bg-[var(--gray-900)]'} hover:bg-[var(--gray-800)]`}>
                        <Link
                            to={`/chat/${item.id}`}
                            className={`${item.id === chatId ? 'text-white' : 'text-[var(--gray-400)]'} group-hover:text-white flex-grow flex gap-x-3 p-3 text-base font-semibold leading-6`}
                            title={item.name}
                        >
                            <span className="truncate">{item.name}</span>
                        </Link>
                        {(item.id !== conversationToDelete || !showConfirmationDelete) ? (
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setConversationToDelete(item.id);
                                    setShowConfirmationDelete(true);
                                }}
                                className={`p-3 ${item.id === chatId ? 'bg-[var(--gray-800)]' : 'bg-[var(--gray-900)]'} text-[var(--gray-400)] group-hover:text-white group-hover:bg-[var(--gray-800)]`}
                                title="Delete conversation"
                            >
                                <TrashIcon className="h-5 w-5" />
                            </button>
                        ) : (
                            <div className="flex items-center p-2">
                                <span className="text-sm text-[var(--gray-400)] mr-2">Delete?</span>
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setShowConfirmationDelete(false);
                                    }}
                                    className="p-2 text-[var(--gray-400)] hover:text-white"
                                    title="Cancel"
                                >
                                    <XMarkIcon className="h-5 w-5 text-white" />
                                </button>
                                <button
                                    onClick={(e) => handleDeleteConversation(item.id, e)}
                                    className="p-2 text-[var(--gray-400)] hover:text-white"
                                    title="Confirm delete"
                                >
                                    <CheckIcon className="h-5 w-5 text-white" />
                                </button>
                            </div>
                        )}
                    </div>
                </li>
            ))}
        </ul>
    );
};

export default ChatHistory;
