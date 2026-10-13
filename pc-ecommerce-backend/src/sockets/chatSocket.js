const Message = require('../models/Message');
const Conversation = require('../models/Conversation');

module.exports = (io) => {
  io.on('connection', (socket) => {
    // 1. Tham gia phòng chat
    socket.on('join_conversation', ({ conversationId }) => {
      if (conversationId) {
        socket.join(conversationId);
      }
    });

    // 2. Rời phòng chat
    socket.on('leave_conversation', ({ conversationId }) => {
      if (conversationId) {
        socket.leave(conversationId);
      }
    });

    // 3. Gửi tin nhắn thời gian thực
    socket.on('send_message', async (data) => {
      try {
        const { conversationId, senderId, senderName, senderRole, content } = data;

        if (!conversationId || !content || !content.trim()) return;

        // Lưu tin nhắn vào MongoDB
        const newMessage = await Message.create({
          conversation: conversationId,
          senderId,
          senderName,
          senderRole: senderRole || 'customer',
          content: content.trim(),
        });

        // Cập nhật preview và bộ đếm unread trong Conversation
        const updateFields = {
          lastMessage: {
            content: content.trim(),
            senderName,
            createdAt: newMessage.createdAt,
          },
        };

        if (senderRole === 'customer') {
          updateFields.$inc = { unreadCountStaff: 1 };
        } else {
          updateFields.$inc = { unreadCountCustomer: 1 };
        }

        await Conversation.findByIdAndUpdate(conversationId, updateFields);

        // Phát tin nhắn đến tất cả thành viên trong phòng
        io.to(conversationId).emit('receive_message', newMessage);

        // Thông báo cập nhật danh sách hội thoại cho Admin/Staff
        io.emit('conversation_updated', {
          conversationId,
          lastMessage: updateFields.lastMessage,
        });
      } catch (err) {
        console.error('Socket send_message error:', err.message);
      }
    });

    // 4. Trạng thái đang gõ phím
    socket.on('typing', ({ conversationId, senderName, isTyping }) => {
      socket.to(conversationId).emit('user_typing', { senderName, isTyping });
    });

    // 5. Đánh dấu đã đọc
    socket.on('mark_read', async ({ conversationId, readerRole }) => {
      try {
        if (!conversationId) return;

        const update = readerRole === 'customer'
          ? { unreadCountCustomer: 0 }
          : { unreadCountStaff: 0 };

        await Conversation.findByIdAndUpdate(conversationId, update);
        await Message.updateMany(
          { conversation: conversationId, isRead: false },
          { $set: { isRead: true } }
        );

        io.to(conversationId).emit('messages_read', { conversationId });
      } catch (err) {
        console.error('Socket mark_read error:', err.message);
      }
    });

    socket.on('disconnect', () => {});
  });
};