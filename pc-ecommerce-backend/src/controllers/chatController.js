const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

// @desc    Lấy hoặc khởi tạo cuộc hội thoại cho khách hàng
// @route   POST /api/v1/chat/conversation
exports.getOrCreateCustomerConversation = async (req, res) => {
  try {
    const { guestId, name, email } = req.body;
    const userId = req.user ? req.user._id : null;

    let query = {};
    if (userId) {
      query = { type: 'support', participants: userId };
    } else if (guestId) {
      query = { type: 'support', 'customerInfo.guestId': guestId };
    } else {
      return res.status(400).json({ message: 'Missing user identification.' });
    }

    let conversation = await Conversation.findOne(query);

    if (!conversation) {
      conversation = await Conversation.create({
        type: 'support',
        participants: userId ? [userId] : [],
        customerInfo: {
          guestId: guestId || null,
          name: req.user ? req.user.name : name || 'Customer',
          email: req.user ? req.user.email : email || null,
        },
      });
    }

    res.json(conversation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Lấy hoặc tạo phòng chat nội bộ Staff/Admin
// @route   GET /api/v1/chat/internal-room
exports.getInternalConversation = async (req, res) => {
  try {
    let conversation = await Conversation.findOne({ type: 'internal' });

    if (!conversation) {
      conversation = await Conversation.create({
        type: 'internal',
        customerInfo: { name: 'Internal Staff Channel' },
      });
    }

    res.json(conversation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Lấy toàn bộ danh sách hội thoại hỗ trợ (Staff/Admin)
// @route   GET /api/v1/chat/conversations
exports.getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({ type: 'support' })
      .sort({ updatedAt: -1 })
      .populate('participants', 'name email role');

    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Lấy lịch sử tin nhắn của một cuộc trò chuyện
// @route   GET /api/v1/chat/messages/:conversationId
exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const messages = await Message.find({ conversation: conversationId })
      .sort({ createdAt: 1 })
      .limit(100);

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};