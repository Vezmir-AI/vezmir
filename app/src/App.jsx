import { useState, useEffect } from 'react'
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css'
import { MainContainer, ChatContainer, MessageList, Message, MessageInput, TypingIndicator } from '@chatscope/chat-ui-kit-react'

function App() {
  const [typing, setTyping] = useState(false)
  const user_id = '12345'
  const [messages, setMessages] = useState([
    {
      message: 'Hello, I am VesmirChat',
      sender: "Vesmir",
      direction: "incoming"
    }
  ])
  const [conversationId, setConversationId] = useState(null);
  const [streamingMessage, setStreamingMessage] = useState("");

  useEffect(() => {
    const createConversation = async () => {
      try {
        const response = await fetch('http://192.168.1.254:8000/chat/init_conversation/', {
          method: 'POST',
          body: JSON.stringify({ user_id: user_id }),
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        setConversationId(data.conversation_id);
      } catch (error) {
        console.error('Error creating conversation:', error);
      }
    };

    createConversation();
  }, [user_id]);

  const handleSend = async (message) => {
    const newMessage = {
      message: message,
      sender: "user",
      direction: "outgoing"
    }

    setMessages(prevMessages => [...prevMessages, newMessage]);
    setTyping(true);
    setStreamingMessage("");

    try {
      const response = await fetch(`http://192.168.1.254:8000/chat/talk/${conversationId}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: newMessage, model: 'gpt' }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        setStreamingMessage(prev => prev + chunk);
      }

      setMessages(prevMessages => [
        ...prevMessages,
        {
          message: streamingMessage,
          sender: "Vesmir",
          direction: "incoming"
        }
      ]);
      setStreamingMessage("");

    } catch (error) {
      console.error('Error sending message:', error);
    }

    setTyping(false);
  }

  return (
    <div className="h-full w-full flex flex-col">
      <MainContainer className="flex-grow w-full max-w-none !important flex flex-col">
        <ChatContainer className="flex-grow w-full flex flex-col">
          <MessageList 
            className="flex-grow w-full overflow-y-auto p-6 box-border"
            typingIndicator={typing ? <TypingIndicator content='Vesmir is talking with ChatGPT' className="!bg-[#2c2c2c] !text-white" /> : null}
          >
            {messages.map((message, i) => (
              <Message 
                key={i} 
                model={message} 
                className={`message ${message.direction === 'incoming' ? '!bg-[#3a3a3a]' : '!bg-[#0084ff]'} !text-white`}
              />
            ))}
            {streamingMessage && (
              <Message 
                model={{
                  message: streamingMessage,
                  sender: "Vesmir",
                  direction: "incoming"
                }}
                className="message streaming !bg-[#3a3a3a] !text-white"
              />
            )}
          </MessageList>
          <MessageInput
            placeholder='Ask vesmir something'
            onSend={handleSend}
            className="!w-3/5 !mx-auto !block !bg-[#2C2B28]"
          />
        </ChatContainer>
      </MainContainer>
    </div>
  )
}

export default App