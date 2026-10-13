import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  MessageSquare,
  X,
  Send,
  Headphones,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

interface ChatMessage {
  _id?: string;
  senderId: string;
  senderName: string;
  senderRole: 'customer' | 'staff' | 'admin';
  content: string;
  createdAt?: string;
}

const SOCKET_SERVER_URL = 'http://localhost:5000';

export const CustomerChatWidget: React.FC = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [isStaffTyping, setIsStaffTyping] = useState<boolean>(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Lấy hoặc tạo guestId định danh khách vãng lai
  const getGuestId = () => {
    let guestId = localStorage.getItem('gearstore_guest_id');
    if (!guestId) {
      guestId = 'guest_' + Math.random().toString(36).substring(2, 12);
      localStorage.setItem('gearstore_guest_id', guestId);
    }
    return guestId;
  };

  // Khởi tạo cuộc hội thoại khi mở khung chat
  const initConversation = async () => {
    try {
      const guestId = !user ? getGuestId() : undefined;
      const res = await api.post('/chat/conversation', {
        guestId,
        name: user?.name || 'Customer',
        email: user?.email || undefined,
      });

      const conv = res.data;
      setConversationId(conv._id);

      // Tải lịch sử tin nhắn
      const historyRes = await api.get(`/chat/messages/${conv._id}`);
      setMessages(historyRes.data || []);

      // Đăng ký vào room socket
      if (socketRef.current) {
        socketRef.current.emit('join_conversation', { conversationId: conv._id });
        socketRef.current.emit('mark_read', {
          conversationId: conv._id,
          readerRole: 'customer',
        });
      }
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to initialize customer chat:', err);
    }
  };

  // Kết nối Socket.io
  useEffect(() => {
    const socket = io(SOCKET_SERVER_URL, {
      transports: ['websocket', 'polling'],
    });
    socketRef.current = socket;

    socket.on('receive_message', (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg]);
      if (!isOpen && msg.senderRole !== 'customer') {
        setUnreadCount((prev) => prev + 1);
      }
    });

    socket.on('user_typing', ({ isTyping }: { isTyping: boolean }) => {
      setIsStaffTyping(isTyping);
    });

    return () => {
      socket.disconnect();
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      initConversation();
    }
  }, [isOpen, user]);

  // Tự động cuộn xuống cuối khi có tin nhắn mới
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isStaffTyping, isOpen]);

  // Xử lý gửi tin nhắn
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !conversationId || !socketRef.current) return;

    const payload: ChatMessage = {
      senderId: user ? user._id : getGuestId(),
      senderName: user ? user.name : 'Customer',
      senderRole: 'customer',
      content: inputText.trim(),
    };

    socketRef.current.emit('send_message', {
      ...payload,
      conversationId,
    });

    socketRef.current.emit('typing', {
      conversationId,
      senderName: user?.name || 'Customer',
      isTyping: false,
    });

    setInputText('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);

    if (conversationId && socketRef.current) {
      socketRef.current.emit('typing', {
        conversationId,
        senderName: user?.name || 'Customer',
        isTyping: true,
      });

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socketRef.current?.emit('typing', {
          conversationId,
          senderName: user?.name || 'Customer',
          isTyping: false,
        });
      }, 1500);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end print:hidden">
      {/* Khung chat pop-up */}
      {isOpen && (
        <div className="w-[340px] sm:w-[380px] h-[480px] bg-base-200 border border-base-content/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden mb-3 animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="p-4 bg-base-100 border-b border-base-content/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary text-primary-content flex items-center justify-center font-bold">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <span className="font-black text-xs text-base-content block">
                  GearStore Hardware Support
                </span>
                <span className="text-[10px] text-success font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Technical Staff Online
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="btn btn-ghost btn-xs btn-circle text-base-content/50 hover:text-base-content"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Vùng hiển thị tin nhắn */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
            {/* Tin nhắn chào mừng mặc định */}
            <div className="flex items-start gap-2 max-w-[85%]">
              <div className="w-6 h-6 rounded-lg bg-primary/20 text-primary flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div className="p-3 bg-base-100 border border-base-content/5 rounded-2xl rounded-tl-xs space-y-1">
                <p className="font-bold text-[10px] text-primary">System Advisor</p>
                <p className="text-base-content/80 leading-relaxed">
                  Xin chào! Bạn cần hỗ trợ kiểm tra tương thích linh kiện, tư vấn cấu hình PC hay thông tin đơn hàng?
                </p>
              </div>
            </div>

            {messages.map((msg, index) => {
              const isMe = msg.senderRole === 'customer';

              return (
                <div
                  key={index}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                      isMe
                        ? 'bg-primary text-primary-content rounded-tr-xs'
                        : 'bg-base-100 border border-base-content/5 text-base-content rounded-tl-xs'
                    }`}
                  >
                    {!isMe && (
                      <span className="text-[10px] font-bold text-primary block mb-0.5">
                        {msg.senderName} ({msg.senderRole.toUpperCase()})
                      </span>
                    )}
                    <p className="break-words">{msg.content}</p>
                  </div>
                </div>
              );
            })}

            {isStaffTyping && (
              <div className="flex items-center gap-1.5 text-base-content/50 text-[11px] italic pl-2">
                <span className="loading loading-dots loading-xs"></span>
                <span>Nhân viên tư vấn đang soạn tin...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Ô nhập tin nhắn */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 bg-base-100 border-t border-base-content/10 flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Nhập câu hỏi cần hỗ trợ..."
              value={inputText}
              onChange={handleInputChange}
              className="input input-bordered input-sm rounded-xl flex-1 text-xs bg-base-200/50"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="btn btn-primary btn-sm rounded-xl btn-square"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}

      {/* Nút tròn nổi (Floating Button) */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="btn btn-primary btn-circle w-13 h-13 shadow-xl relative hover:scale-105 transition-transform"
        title="Chat với nhân viên hỗ trợ"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageSquare className="w-6 h-6" />
        )}

        {!isOpen && unreadCount > 0 && (
          <span className="badge badge-error badge-xs font-bold text-white absolute -top-1 -right-1 px-1.5 py-2">
            {unreadCount}
          </span>
        )}
      </button>
    </div>
  );
};

export default CustomerChatWidget;