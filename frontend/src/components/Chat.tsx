import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';

interface Conversation {
  id: string;
  name: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AiModel {
  id: string;
  name: string;
}

const ChatComponent: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [aiModels, setAiModels] = useState<AiModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const { chatId } = useParams<{ chatId: string }>();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConversations();
    fetchAiModels();
    if (chatId) {
      fetchMessages(chatId);
    }
  }, [chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchConversations = async (): Promise<void> => {
    try {
      const response = await api.get('/chat/conversations/');
      setConversations(response);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const fetchAiModels = async (): Promise<void> => {
    try {
      const response = await api.get('/ai_models/');
      setAiModels(response);
      if (response.length > 0) {
        setSelectedModel(response[0].name);
      }
    } catch (error) {
      console.error('Error fetching AI models:', error);
    }
  };

  const fetchMessages = async (id: string): Promise<void> => {
    try {
      const response = await api.get(`/chat/conversations/${id}/`);
      setMessages(response);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSendMessageToStream = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!inputMessage.trim() || !selectedModel) return;

    try {
      const payload = { content: inputMessage, model_name: selectedModel };
      setMessages([...messages, { role: 'user', content: inputMessage }]);
      setInputMessage('');
      setIsStreaming(true);

      const url = chatId
        ? `http://localhost:8000/api/chat/conversations/${chatId}/`
        : 'http://localhost:8000/api/chat/conversations/';

      const xhr = new XMLHttpRequest();
      const accessToken = localStorage.getItem('accessToken');
      xhr.open('POST', url, true);
      xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`);

      xhr.setRequestHeader('Content-Type', 'application/json');

      let assistantMessage = '';
      setMessages(prevMessages => [
        ...prevMessages,
        { role: 'assistant', content: assistantMessage }
      ]);

      xhr.onprogress = () => {
        const chunk = xhr.responseText.slice(assistantMessage.length);
        assistantMessage += chunk;
        setMessages(prevMessages => [
          ...prevMessages.slice(0, -1),
          { role: 'assistant', content: assistantMessage }
        ]);
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          if (!chatId) {
            const response = JSON.parse(xhr.responseText);
            navigate(`/chat/${response.id}`);
          }
        } else {
          console.error('Error sending message:', xhr.statusText);
        }
        setIsStreaming(false);
      };

      xhr.onerror = () => {
        console.error('Error sending message:', xhr.statusText);
        setIsStreaming(false);
      };

      xhr.send(JSON.stringify(payload));
    } catch (error) {
      console.error('Error sending message here:', error);
      setIsStreaming(false);
    }
  };

  const handleDeleteConversation = async (id: string): Promise<void> => {
    try {
      await api.delete(`/chat/conversations/${id}/`);
      setConversations(conversations.filter(conv => conv.id !== id));
      if (chatId === id) {
        navigate('/chat');
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };

  const handleNewConversation = async () => {
    try {
      const response = await api.post('/chat/conversations/', {});
      navigate(`/chat/${response.id}`);
    } catch (error) {
      console.error('Error creating new conversation:', error);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Conversation List and AI Model Selection */}
      <div className="w-1/4 bg-black-100 overflow-y-auto flex flex-col">
        <h2 className="text-xl font-bold p-4">Conversations</h2>
        <div className="p-4">
          <button
            onClick={handleNewConversation}
            className="w-full p-2 mb-4 bg-green-500 text-white rounded-md hover:bg-green-600"
          >
            New Conversation
          </button>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="w-full p-2 rounded-md"
          >
            {aiModels.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-grow overflow-y-auto">
          {conversations.map((conv) => (
            <div key={conv.id} className="p-2 hover:bg-gray-800 flex justify-between items-center">
              <span
                className="cursor-pointer flex-grow"
                onClick={() => navigate(`/chat/${conv.id}`)}
              >
                {conv.name}
              </span>
              <button
                onClick={() => handleDeleteConversation(conv.id)}
                className="bg-red-500 text-white px-2 py-1 rounded"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="w-3/4 flex flex-col">
        {/* Messages */}
        <div className="flex-grow overflow-y-auto p-4">
          {messages.map((msg, index) => (
            <div key={index} className={`mb-2 ${msg.role === 'assistant' ? 'text-blue-600' : 'text-green-600'}`}>
              <strong>{msg.role}: </strong>{msg.content}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSendMessageToStream} className="p-4 bg-gray-200">
          <div className="flex">
            <input
              type="text"
              value={inputMessage}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputMessage(e.target.value)}
              className="flex-grow p-2 rounded-l-md"
              placeholder="Type a message..."
              disabled={isStreaming}
            />
            <button
              type="submit"
              className="bg-blue-500 text-white p-2 rounded-r-md"
              disabled={isStreaming}
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