import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  MessageSquare,
  Users,
  Send,
  Search,
  User,
  ShieldAlert,
  Clock,
  Circle,
  Headphones,
  CheckCheck,
} from 'lucide-react';

interface Conversation {
  _id: string;
  type: 'support' | 'internal';
  customerInfo?: {
    guestId?: string;
    name?: string;
    email?: string;
  };
  lastMessage?: {
    content: string;
    senderName: string;
    createdAt: string;
  };
  unreadCountStaff: number;
  unreadCountCustomer: number;
  updatedAt: string;
}

interface Message {
  _id?: string;
  conversation: string;
  senderId: string;
  senderName: string;
  senderRole: 'customer' | 'staff' | 'admin';
  content: string;
  createdAt?: string;
  isRead?: boolean;
}

const SOCKET_SERVER_URL = 'http://localhost:5000';

export const AdminChatHub: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'support' | 'internal'>('support');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [internalConv, setInternalConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isTypingState, setIsTypingState] = useState<{ senderName: string; isTyping: boolean }>({
    senderName: '',
    isTyping: false,
  });

  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Tải danh sách hội thoại
  const fetchConversations = async () => {
    try {
      const res = await api.get<Conversation[]>('/chat/conversations');
      setConversations(res.data || []);
    } catch (err) {
      console.error('Failed to load support conversations:', err);
    }
  };

  // 2. Tải phòng chat nội bộ
  const fetchInternalConversation = async () => {
    try {
      const res = await api.get<Conversation>('/chat/internal-room');
      setInternalConv(res.data);
    } catch (err) {
      console.error('Failed to load internal channel:', err);
    }
  };

  // 3. Tải tin nhắn của phòng đang chọn
  const fetchMessages = async (convId: string) => {
    try {
      const res = await api.get<Message[]>(`/chat/messages/${convId}`);
      setMessages(res.data || []);

      if (socketRef.current) {
        socketRef.current.emit('join_conversation', { conversationId: convId });
        socketRef.current.emit('mark_read', {
          conversationId: convId,
          readerRole: user?.role || 'staff',
        });
      }

      // Reset badge chưa đọc ở client
      setConversations((prev) =>
        prev.map((c) => (c._id === convId ? { ...c, unreadCountStaff: 0 } : c))
      );
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  };

  // Khởi tạo Socket.io
  useEffect(() => {
    fetchConversations();
    fetchInternalConversation();

    const socket = io(SOCKET_SERVER_URL, {
      transports: ['websocket', 'polling'],
    });
    socketRef.current = socket;

    socket.on('receive_message', (newMsg: Message) => {
      setMessages((prev) => {
        if (prev.length > 0 && prev[0].conversation === newMsg.conversation) {
          return [...prev, newMsg];
        }
        return prev;
      });

      fetchConversations();
    });

    socket.on('conversation_updated', () => {
      fetchConversations();
    });

    socket.on('user_typing', (data) => {
      setIsTypingState(data);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Đổi cuộc hội thoại khi click
  useEffect(() => {
    if (activeTab === 'internal' && internalConv) {
      fetchMessages(internalConv._id);
    } else if (activeTab === 'support') {
      if (selectedConv) {
        fetchMessages(selectedConv._id);
      } else if (conversations.length > 0) {
        setSelectedConv(conversations[0]);
        fetchMessages(conversations[0]._id);
      }
    }
  }, [activeTab, internalConv?._id, selectedConv?._id]);

  // Cuộn tin nhắn xuống đáy
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTypingState]);

  // Xử lý gửi tin nhắn
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const currentConvId = activeTab === 'internal' ? internalConv?._id : selectedConv?._id;
    if (!inputText.trim() || !currentConvId || !socketRef.current) return;

    const payload = {
      conversationId: currentConvId,
      senderId: user?._id || 'staff_id',
      senderName: user?.name || 'Staff Member',
      senderRole: (user?.role as 'staff' | 'admin') || 'staff',
      content: inputText.trim(),
    };

    socketRef.current.emit('send_message', payload);
    socketRef.current.emit('typing', {
      conversationId: currentConvId,
      senderName: user?.name || 'Staff',
      isTyping: false,
    });

    setInputText('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    const currentConvId = activeTab === 'internal' ? internalConv?._id : selectedConv?._id;

    if (currentConvId && socketRef.current) {
      socketRef.current.emit('typing', {
        conversationId: currentConvId,
        senderName: user?.name || 'Staff',
        isTyping: true,
      });

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socketRef.current?.emit('typing', {
          conversationId: currentConvId,
          senderName: user?.name || 'Staff',
          isTyping: false,
        });
      }, 1500);
    }
  };

  const filteredConversations = conversations.filter((c) => {
    const customerName = c.customerInfo?.name || 'Customer';
    const email = c.customerInfo?.email || '';
    const q = searchQuery.toLowerCase();
    return customerName.toLowerCase().includes(q) || email.toLowerCase().includes(q);
  });

  const activeHeaderTitle =
    activeTab === 'internal'
      ? 'Internal Staff & Admin Room'
      : selectedConv?.customerInfo?.name || 'Customer Support';

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-4">
      {/* Top Header & Tab switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-black text-base-content flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-primary" /> Live Chat Dispatch & Operations
          </h1>
          <p className="text-xs text-base-content/60">
            Provide instant customer hardware guidance and sync with store personnel.
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-base-200 p-1 rounded-2xl border border-base-content/10">
          <button
            onClick={() => setActiveTab('support')}
            className={`btn btn-xs rounded-xl font-bold gap-1.5 transition-all ${
              activeTab === 'support' ? 'btn-primary shadow-sm' : 'btn-ghost'
            }`}
          >
            <Headphones className="w-3.5 h-3.5" /> Customer Support
          </button>
          <button
            onClick={() => setActiveTab('internal')}
            className={`btn btn-xs rounded-xl font-bold gap-1.5 transition-all ${
              activeTab === 'internal' ? 'btn-primary shadow-sm' : 'btn-ghost'
            }`}
          >
            <Users className="w-3.5 h-3.5" /> Internal Staff Room
          </button>
        </div>
      </div>

      {/* Main Chat Hub Container */}
      <div className="flex-1 bg-base-200 border border-base-content/10 rounded-3xl overflow-hidden flex flex-col md:flex-row shadow-sm">
        {/* Left Side: Conversation List (Only shown on Customer tab) */}
        {activeTab === 'support' && (
          <div className="w-full md:w-80 border-r border-base-content/10 bg-base-200/50 flex flex-col shrink-0">
            <div className="p-3 border-b border-base-content/10">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
                <input
                  type="text"
                  placeholder="Filter customer names..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input input-bordered input-xs rounded-xl w-full pl-8 text-xs bg-base-100"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-base-content/5">
              {filteredConversations.length === 0 ? (
                <div className="p-8 text-center text-xs text-base-content/40 space-y-1">
                  <p className="font-bold">No active conversations</p>
                  <p className="text-[10px]">Client inquiries will automatically queue here.</p>
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const isSelected = selectedConv?._id === conv._id;
                  const name = conv.customerInfo?.name || 'Customer';

                  return (
                    <div
                      key={conv._id}
                      onClick={() => setSelectedConv(conv)}
                      className={`p-3.5 cursor-pointer transition-all flex items-start gap-3 relative ${
                        isSelected
                          ? 'bg-base-100 border-l-4 border-primary'
                          : 'hover:bg-base-100/50'
                      }`}
                    >
                      <div className="w-9 h-9 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        <User className="w-4 h-4" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-xs text-base-content truncate">{name}</p>
                          <span className="text-[10px] text-base-content/40 font-mono">
                            {new Date(conv.updatedAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>

                        <p className="text-[11px] text-base-content/60 truncate mt-0.5">
                          {conv.lastMessage?.content || 'Started new inquiry...'}
                        </p>
                      </div>

                      {conv.unreadCountStaff > 0 && (
                        <span className="badge badge-primary badge-xs font-bold text-primary-content">
                          {conv.unreadCountStaff}
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Right Side: Active Messages Stream & Input */}
        <div className="flex-1 flex flex-col bg-base-100/60 min-w-0">
          {/* Header of the active window */}
          <div className="p-3.5 border-b border-base-content/10 bg-base-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-primary text-primary-content flex items-center justify-center font-bold text-xs">
                {activeTab === 'internal' ? <Users className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>
              <div>
                <p className="font-bold text-xs text-base-content">{activeHeaderTitle}</p>
                <span className="text-[10px] text-success font-semibold flex items-center gap-1">
                  <Circle className="w-2 h-2 fill-current" /> Socket.io Channel Active
                </span>
              </div>
            </div>

            {activeTab === 'internal' && (
              <span className="badge badge-warning badge-xs font-bold gap-1 text-[9px] uppercase">
                <ShieldAlert className="w-3 h-3" /> Confidential
              </span>
            )}
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-xs text-base-content/40 space-y-2">
                <MessageSquare className="w-8 h-8 text-base-content/20" />
                <p>No messages recorded in this stream yet.</p>
              </div>
            ) : (
              messages.map((msg, index) => {
                const isMe = msg.senderId === user?._id;
                const roleBadge = msg.senderRole.toUpperCase();

                return (
                  <div
                    key={index}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px] text-base-content/50">
                      <span className="font-bold text-base-content/80">{msg.senderName}</span>
                      <span
                        className={`badge badge-xs font-black text-[8px] ${
                          msg.senderRole === 'admin'
                            ? 'badge-error text-white'
                            : msg.senderRole === 'staff'
                            ? 'badge-primary'
                            : 'badge-ghost'
                        }`}
                      >
                        {roleBadge}
                      </span>
                      {msg.createdAt && (
                        <span>
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      )}
                    </div>

                    <div
                      className={`max-w-[75%] p-3 rounded-2xl text-xs leading-relaxed ${
                        isMe
                          ? 'bg-primary text-primary-content rounded-tr-xs'
                          : 'bg-base-200 border border-base-content/5 text-base-content rounded-tl-xs'
                      }`}
                    >
                      <p className="break-words">{msg.content}</p>
                    </div>
                  </div>
                );
              })
            )}

            {isTypingState.isTyping && (
              <div className="flex items-center gap-1.5 text-base-content/50 text-[11px] italic pl-1">
                <span className="loading loading-dots loading-xs"></span>
                <span>{isTypingState.senderName} is drafting a response...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 bg-base-100 border-t border-base-content/10 flex items-center gap-2"
          >
            <input
              type="text"
              placeholder={`Send message as ${user?.name || 'Staff'}...`}
              value={inputText}
              onChange={handleInputChange}
              className="input input-bordered input-sm rounded-xl flex-1 text-xs bg-base-200/50"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="btn btn-primary btn-sm rounded-xl font-bold text-xs gap-1.5 shadow-sm"
            >
              <Send className="w-3.5 h-3.5" /> Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminChatHub;