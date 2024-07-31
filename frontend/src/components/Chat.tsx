import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import Header from './Chat/Header';
import ModelSelector from './Chat/ModelSelector';
import SendIcon from '../UI/svg/SendIcon';
import ChatHistory from './Chat/ChatHistory';

interface Conversation {
  id: string;
  name: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const ChatComponent: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const { chatId } = useParams<{ chatId: string }>();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConversations();
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
      setMessages(prevMessages => [...prevMessages, { role: 'user', content: inputMessage }]);
      setInputMessage('');
      setIsStreaming(true);
      let assistantMessage = '';
      setMessages(prevMessages => [...prevMessages, { role: 'assistant', content: assistantMessage }]);

      let url = chatId
        ? `/chat/conversations/${chatId}/`
        : '/chat/conversations/';

      const response = await api.post(url, payload, true);

      if (!response) {
        throw new Error('Response body is null');
      }
      const reader = response.getReader();
      const decoder = new TextDecoder('utf-8');


      const processText = async ({ done, value }: ReadableStreamReadResult<Uint8Array>): Promise<void> => {
        if (done) {
          setIsStreaming(false);
          if (!chatId) {
            // If it's a new conversation, navigate to the new chat URL
            const fullResponse = JSON.parse(assistantMessage);
            navigate(`/chat/${fullResponse.id}`);
          }
          return;
        }

        const chunk = decoder.decode(value, { stream: true });
        assistantMessage += chunk;
        setMessages(prevMessages => [
          ...prevMessages.slice(0, -1),
          { role: 'assistant', content: assistantMessage }
        ]);

        // Read the next chunk
        return reader.read().then(processText);

      };

      reader.read().then(processText);

    } catch (error) {
      console.error('Error sending message:', error);
      setIsStreaming(false);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Conversation List */}
      <div className="w-72 bg-gray-850 overflow-y-auto flex flex-col">
        <div className="p-4">
          <Header />
        </div>
        <ChatHistory conversations={conversations} setConversations={setConversations} />
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-gray-800 pb-4">
        {/* Model Selector */}
        <div className="p-4 bg-gray-800">
          <ModelSelector selectedModel={selectedModel} setSelectedModel={setSelectedModel} />
        </div>

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
        <form onSubmit={handleSendMessageToStream} className="p-4 bg-gray-800 mt-auto">
          <div className="flex items-center max-w-4xl mx-auto">
            <input
              type="text"
              value={inputMessage}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputMessage(e.target.value)}
              className="flex-grow p-4 rounded-l-xl bg-gray-700 text-white text-lg border border-gray-600 focus:outline-none focus:ring-0 focus:border-gray-600"
              placeholder={"Message " + selectedModel}
            />
            <button
              type="submit"
              className="bg-gray-400 text-white p-4 rounded-r-xl text-lg flex items-center justify-center hover:bg-gray-300"
              disabled={isStreaming}
            >
              <SendIcon className="w-6 h-6" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatComponent;