const dotenv = require('dotenv');
const connectDB = require('./src/config/db');
const Coupon = require('./src/models/Coupon');

dotenv.config();

const seedCoupons = async () => {
    try {
        await connectDB();

        await Coupon.deleteMany({});

        const sampleCoupons = [
            {
                code: 'GEAR50',
                discountType: 'fixed',
                discountValue: 50,
                minOrderValue: 300,
                expirationDate: new Date('2026-12-31'),
                usageLimit: 200,
            },
            {
                code: 'PROMO10',
                discountType: 'percentage',
                discountValue: 10,
                minOrderValue: 100,
                maxDiscount: 80,
                expirationDate: new Date('2026-12-31'),
                usageLimit: 500,
            },
            {
                code: 'TITAN100',
                discountType: 'fixed',
                discountValue: 100,
                minOrderValue: 800,
                expirationDate: new Date('2026-12-31'),
                usageLimit: 50,
            },
        ];

        await Coupon.insertMany(sampleCoupons);
        console.log('✅ Sample Promotional Coupons Seeded:');
        console.log('   - GEAR50 ($50 OFF for orders over $300)');
        console.log('   - PROMO10 (10% OFF for orders over $100)');
        console.log('   - TITAN100 ($100 OFF for orders over $800)');
        process.exit(0);
    } catch (error) {
        console.error('❌ Failed to seed coupons:', error.message);
        process.exit(1);
    }
};

seedCoupons();