import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { TrashIcon, ChevronDownIcon, ChevronUpIcon, XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useConversation } from '@/context/ConversationContext';

const ChatHistory: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [chatId, setChatId] = useState<string|null>(null);
    const { conversations, deleteConversation } = useConversation();
    const [showAllConversations, setShowAllConversations] = useState(false);
    const [showConfirmationDelete, setShowConfirmationDelete] = useState(false);
    const [conversationToDelete, setConversationToDelete] = useState<string | null>(null);
    const [animatedNames, setAnimatedNames] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        setChatId(location.pathname.split('/').pop() || null);
    }, [location.pathname]);

    useEffect(() => {
        conversations.forEach(item => {
            if (!animatedNames[item.id] || animatedNames[item.id] !== item.name) {
                setAnimatedNames(prev => ({ ...prev, [item.id]: '' }));
                let i = 0;
                const intervalId = setInterval(() => {
                    if (i < item.name.length) {
                        setAnimatedNames(prev => ({
                            ...prev,
                            [item.id]: item.name.slice(0, i + 1)
                        }));
                        i++;
                    } else {
                        clearInterval(intervalId);
                    }
                }, 50); // Adjust timing as needed
            }
        });
    }, [conversations]);

    const toggleAllConversations = () => {
        setShowAllConversations(!showAllConversations);
    };

    const handleDeleteConversation = (id: string, event: React.MouseEvent) => {
        console.log('delete conversation', id, chatId);
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
        <ul role="list" className="-mx-2 space-y-1 overflow-y-auto">
            {conversations.map((item) => (
                <li key={item.id}>
                    <div className="flex items-center justify-between bg-[var(--gray-900)]">
                        <Link
                            to={`/chat/${item.id}`}
                            className="text-[var(--gray-400)] hover:bg-[var(--gray-800)] hover:text-white group flex-grow flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6"
                            title={item.name}
                        >
                            <span className="typing-animation">
                                {animatedNames[item.id]}
                            </span>
                        </Link>
                        {(item.id !== conversationToDelete || !showConfirmationDelete) ? (
                            <>
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setConversationToDelete(item.id);
                                        setShowConfirmationDelete(true);
                                    }}
                                    className="p-2 text-[var(--gray-400)] hover:text-white bg-[var(--gray-900)] hover:bg-[var(--gray-800)]"
                                    title="Delete conversation"
                                >
                                    <TrashIcon className="h-4 w-4" />
                                </button>
                            </>
                        ) : (
                            <div className="flex items-center">
                                <span className="text-xs text-[var(--gray-400)] mr-2">delete?</span>
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setShowConfirmationDelete(false);
                                    }}
                                    className="p-2 text-[var(--gray-400)] hover:text-white bg-[var(--gray-900)] hover:bg-[var(--gray-800)]"
                                    title="Cancel"
                                >
                                    <XMarkIcon className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={(e) => handleDeleteConversation(item.id, e)}

                                    className="p-2 text-[var(--gray-400)] hover:text-white bg-[var(--gray-900)] hover:bg-[var(--gray-800)]"
                                    title="Confirm delete"
                                >
                                    <CheckIcon className="h-4 w-4" />
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
