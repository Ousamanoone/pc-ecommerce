const dotenv = require('dotenv');
const connectDB = require('./src/config/db');
const User = require('./src/models/User');

dotenv.config();

const createAdminAccount = async () => {
  try {
    await connectDB();

    // Xóa user admin cũ để tránh xung đột hash
    await User.deleteMany({ email: 'admin@gearstore.com' });

    const admin = new User({
      name: 'System Administrator',
      email: 'admin@gearstore.com',
      password: 'AdminPassword123',
      role: 'admin',
    });

    await admin.save();
    console.log('✅ Admin user created in MongoDB Atlas.');

    // Kiểm tra trực tiếp hàm so khớp mật khẩu
    const verifyUser = await User.findOne({ email: 'admin@gearstore.com' });
    const isMatch = await verifyUser.matchPassword('AdminPassword123');

    if (isMatch) {
      console.log('🎉 Password verification test: PASSED ✅');
      console.log('Credentials: admin@gearstore.com / AdminPassword123');
    } else {
      console.error('❌ Password verification test: FAILED');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    process.exit(1);
  }
};

createAdminAccount();