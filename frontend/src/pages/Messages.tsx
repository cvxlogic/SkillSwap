import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { conversationApi } from '../services/api';
import type { Conversation, Message } from '../types';

export default function Messages() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (conversationId) {
      fetchConversation(conversationId);
    }
  }, [conversationId]);

  const fetchConversations = async () => {
    try {
      const response = await conversationApi.getAll();
      setConversations(response.data.data.conversations || []);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    }
  };

  const fetchConversation = async (id: string) => {
    setLoading(true);
    try {
      const response = await conversationApi.getById(id);
      setActiveConversation(response.data.data.conversation);
      setMessages(response.data.data.messages || []);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
      console.error('Failed to fetch conversation:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation) return;

    try {
      await conversationApi.sendMessage(activeConversation.id, newMessage.trim());
      setNewMessage('');
      await fetchConversation(activeConversation.id);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const getOtherUser = (conv: Conversation) => conv.participants?.[0];

  return (
    <div className="h-[calc(100vh-64px)] flex">
      <div className="w-80 border-r border-white/10 flex flex-col">
        <div className="p-4 border-b border-white/10">
          <h1 className="text-xl gradient-text">Messages</h1>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {conversations.map((conv) => {
            const other = getOtherUser(conv);
            return (
              <button
                key={conv.id}
                onClick={() => navigate(`/messages/${conv.id}`)}
                className={`w-full p-4 flex items-center gap-3 hover:bg-white/5 transition-colors ${
                  activeConversation?.id === conv.id ? 'bg-white/10' : ''
                }`}
              >
                <div className="relative">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center" 
                    style={{ background: 'linear-gradient(135deg, #3ecf8e 0%, #2eb878 100%)', color: '#000' }}>
                    {other?.name?.charAt(0) || '?'}
                  </div>
                  {other?.isOnline && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#3ecf8e] rounded-full border-2 border-[#171717]" />
                  )}
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium">{other?.name}</p>
                  {conv.lastMessage && (
                    <p className="text-sm text-white/50 truncate">{conv.lastMessage.content}</p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {conversationId ? (
          activeConversation ? (
            <>
              <div className="p-4 border-b border-white/10 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" 
                  style={{ background: 'linear-gradient(135deg, #3ecf8e 0%, #2eb878 100%)', color: '#000' }}>
                  {getOtherUser(activeConversation)?.name?.charAt(0)}
                </div>
                <div>
                  <p className="font-medium">{getOtherUser(activeConversation)?.name}</p>
                  <p className="text-xs text-[#3ecf8e]">
                    {getOtherUser(activeConversation)?.isOnline ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="w-8 h-8 border-2 rounded-full animate-spin border-[#3ecf8e] border-t-transparent" />
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.senderId ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] p-3 rounded-2xl ${
                          msg.senderId ? 'bg-[#3ecf8e] text-black' : 'bg-white/10'
                        }`}
                      >
                        <p>{msg.content}</p>
                        <p className={`text-xs mt-1 ${msg.senderId ? 'text-black/70' : 'text-white/50'}`}>
                          {new Date(msg.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSendMessage} className="p-4 border-t border-white/10">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 input-field"
                  />
                  <button type="submit" className="glow-button px-6">
                    Send
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-white/50">Select a conversation</p>
            </div>
          )
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-white/50">Select a conversation to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}