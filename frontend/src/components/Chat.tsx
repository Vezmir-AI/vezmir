import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';

interface Conversation {
  id: string;
  name: string;
}

interface Message {
  id: string;
  content: string;
  senderId: string;
  timestamp: string;
}

const ChatComponent: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const { chatId } = useParams<{ chatId: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    fetchConversations();
    if (chatId) {
      fetchMessages(chatId);
    }
  }, [chatId]);

  const fetchConversations = async (): Promise<void> => {
    try {
      const response = await api.get<Conversation[]>('/chat/conversations');
      setConversations(response.data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const fetchMessages = async (id: string): Promise<void> => {
    try {
      const response = await api.get<Message[]>(`/chat/conversation/${id}`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    try {
      let response;
      if (chatId) {
        response = await api.post<Message>(`/chat/conversation/${chatId}`, { message: inputMessage });
        setMessages([...messages, response.data]);
      } else {
        response = await api.post<{ id: string }>('/chat/conversations', { message: inputMessage });
        navigate(`/chat/${response.data.id}`);
      }
      setInputMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Conversation List */}
      <div className="w-1/4 bg-gray-100 overflow-y-auto">
        <h2 className="text-xl font-bold p-4">Conversations</h2>
        {conversations.map((conv) => (
          <div
            key={conv.id}
            className="p-2 hover:bg-gray-200 cursor-pointer"
            onClick={() => navigate(`/chat/${conv.id}`)}
          >
            {conv.name}
          </div>
        ))}
      </div>

      {/* Chat Area */}
      <div className="w-3/4 flex flex-col">
        {/* Messages */}
        <div className="flex-grow overflow-y-auto p-4">
          {messages.map((msg) => (
            <div key={msg.id} className="mb-2">
              {msg.content}
            </div>
          ))}
        </div>

        {/* Input Area */}
        <form onSubmit={handleSendMessage} className="p-4 bg-gray-200">
          <div className="flex">
            <input
              type="text"
              value={inputMessage}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputMessage(e.target.value)}
              className="flex-grow p-2 rounded-l-md"
              placeholder="Type a message..."
            />
            <button
              type="submit"
              className="bg-blue-500 text-white p-2 rounded-r-md"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatComponent;