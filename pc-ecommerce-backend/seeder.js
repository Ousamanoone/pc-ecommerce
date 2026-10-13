const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db');
const Product = require('./src/models/Product');

dotenv.config();

// Bộ sưu tập ảnh mẫu theo danh mục
const categoryImages = {
  CPU: [
    'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=800&auto=format&fit=crop&q=80',
  ],
  GPU: [
    'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80',
  ],
  Mainboard: [
    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
  ],
  RAM: [
    'https://images.unsplash.com/photo-1562976540-1502c2145186?w=800&auto=format&fit=crop&q=80',
  ],
  Storage: [
    'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&auto=format&fit=crop&q=80',
  ],
  PSU: [
    'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=800&auto=format&fit=crop&q=80',
  ],
  Case: [
    'https://images.unsplash.com/photo-1587202372583-49330a15584d?w=800&auto=format&fit=crop&q=80',
  ],
  Cooling: [
    'https://images.unsplash.com/photo-1587202372616-b43abea06c2a?w=800&auto=format&fit=crop&q=80',
  ],
  Monitor: [
    'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80',
  ],
  Gear: [
    'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80',
  ],
};

// Hàm tiện ích tạo nhanh dữ liệu sản phẩm
const p = (name, slug, brand, category, price, discountPrice, stock, wattage, rawSpecs, descText) => ({
  name,
  slug,
  brand,
  category,
  price,
  discountPrice,
  stock,
  wattage,
  images: categoryImages[category] || categoryImages.Gear,
  specs: rawSpecs.map(([label, value]) => ({ label, value })),
  description: `<h2>${name}</h2><p>${descText || 'High-performance computing component built with genuine factory materials, rigorously tested for maximum stability, thermal endurance, and peak throughput in competitive workloads.'}</p>`,
  rating: parseFloat((4.5 + Math.random() * 0.5).toFixed(1)),
  numReviews: Math.floor(15 + Math.random() * 85),
});

const catalog = [
  // =========================================================================
  // 1. CPU (PROCESSORS) - 32 SẢN PHẨM
  // =========================================================================
  p('Intel Core i3-12100F (4C/8T, up to 4.3 GHz)', 'intel-core-i3-12100f', 'Intel', 'CPU', 99, 85, 45, 89, [['Socket', 'LGA 1700'], ['Cores', '4'], ['Threads', '8'], ['TDP', '58W']]),
  p('Intel Core i3-13100F (4C/8T, up to 4.5 GHz)', 'intel-core-i3-13100f', 'Intel', 'CPU', 119, 105, 40, 89, [['Socket', 'LGA 1700'], ['Cores', '4'], ['Threads', '8'], ['TDP', '58W']]),
  p('Intel Core i3-14100F (4C/8T, up to 4.7 GHz)', 'intel-core-i3-14100f', 'Intel', 'CPU', 129, 115, 35, 110, [['Socket', 'LGA 1700'], ['Cores', '4'], ['Threads', '8'], ['TDP', '60W']]),
  p('Intel Core i5-12400F (6C/12T, up to 4.4 GHz)', 'intel-core-i5-12400f', 'Intel', 'CPU', 149, 129, 50, 117, [['Socket', 'LGA 1700'], ['Cores', '6'], ['Threads', '12'], ['TDP', '65W']]),
  p('Intel Core i5-12600K (10C/16T, up to 4.9 GHz)', 'intel-core-i5-12600k', 'Intel', 'CPU', 189, 169, 30, 150, [['Socket', 'LGA 1700'], ['Cores', '10 (6P+4E)'], ['Threads', '16'], ['TDP', '125W']]),
  p('Intel Core i5-13400F (10C/16T, up to 4.6 GHz)', 'intel-core-i5-13400f', 'Intel', 'CPU', 199, 179, 45, 148, [['Socket', 'LGA 1700'], ['Cores', '10 (6P+4E)'], ['Threads', '16'], ['TDP', '65W']]),
  p('Intel Core i5-13500 (14C/20T, up to 4.8 GHz)', 'intel-core-i5-13500', 'Intel', 'CPU', 249, 229, 25, 154, [['Socket', 'LGA 1700'], ['Cores', '14 (6P+8E)'], ['Threads', '20'], ['TDP', '65W']]),
  p('Intel Core i5-13600K (14C/20T, up to 5.1 GHz)', 'intel-core-i5-13600k', 'Intel', 'CPU', 299, 279, 30, 181, [['Socket', 'LGA 1700'], ['Cores', '14 (6P+8E)'], ['Threads', '20'], ['TDP', '125W']]),
  p('Intel Core i5-14400F (10C/16T, up to 4.7 GHz)', 'intel-core-i5-14400f', 'Intel', 'CPU', 209, 189, 40, 148, [['Socket', 'LGA 1700'], ['Cores', '10 (6P+4E)'], ['Threads', '16'], ['TDP', '65W']]),
  p('Intel Core i5-14500 (14C/20T, up to 5.0 GHz)', 'intel-core-i5-14500', 'Intel', 'CPU', 259, 239, 28, 154, [['Socket', 'LGA 1700'], ['Cores', '14 (6P+8E)'], ['Threads', '20'], ['TDP', '65W']]),
  p('Intel Core i5-14600K (14C/20T, up to 5.3 GHz)', 'intel-core-i5-14600k', 'Intel', 'CPU', 319, 299, 35, 181, [['Socket', 'LGA 1700'], ['Cores', '14 (6P+8E)'], ['Threads', '20'], ['TDP', '125W']]),
  p('Intel Core i7-12700K (12C/20T, up to 5.0 GHz)', 'intel-core-i7-12700k', 'Intel', 'CPU', 279, 249, 20, 190, [['Socket', 'LGA 1700'], ['Cores', '12 (8P+4E)'], ['Threads', '20'], ['TDP', '125W']]),
  p('Intel Core i7-13700K (16C/24T, up to 5.4 GHz)', 'intel-core-i7-13700k', 'Intel', 'CPU', 369, 339, 22, 253, [['Socket', 'LGA 1700'], ['Cores', '16 (8P+8E)'], ['Threads', '24'], ['TDP', '125W']]),
  p('Intel Core i7-14700K (20C/28T, up to 5.6 GHz)', 'intel-core-i7-14700k', 'Intel', 'CPU', 419, 389, 25, 253, [['Socket', 'LGA 1700'], ['Cores', '20 (8P+12E)'], ['Threads', '28'], ['TDP', '125W']]),
  p('Intel Core i9-12900K (16C/24T, up to 5.2 GHz)', 'intel-core-i9-12900k', 'Intel', 'CPU', 389, 349, 15, 241, [['Socket', 'LGA 1700'], ['Cores', '16 (8P+8E)'], ['Threads', '24'], ['TDP', '125W']]),
  p('Intel Core i9-13900K (24C/32T, up to 5.8 GHz)', 'intel-core-i9-13900k', 'Intel', 'CPU', 499, 459, 18, 253, [['Socket', 'LGA 1700'], ['Cores', '24 (8P+16E)'], ['Threads', '32'], ['TDP', '125W']]),
  p('Intel Core i9-14900K (24C/32T, up to 6.0 GHz)', 'intel-core-i9-14900k', 'Intel', 'CPU', 589, 549, 20, 253, [['Socket', 'LGA 1700'], ['Cores', '24 (8P+16E)'], ['Threads', '32'], ['TDP', '125W']]),
  p('Intel Core i9-14900KS Special Edition 6.2 GHz', 'intel-core-i9-14900ks', 'Intel', 'CPU', 699, 669, 8, 320, [['Socket', 'LGA 1700'], ['Cores', '24 (8P+16E)'], ['Boost', '6.2 GHz'], ['TDP', '150W']]),
  p('AMD Ryzen 5 3600 (6C/12T, up to 4.2 GHz)', 'amd-ryzen-5-3600', 'AMD', 'CPU', 95, 85, 40, 65, [['Socket', 'AM4'], ['Cores', '6'], ['Threads', '12'], ['TDP', '65W']]),
  p('AMD Ryzen 5 5500 (6C/12T, up to 4.2 GHz)', 'amd-ryzen-5-5500', 'AMD', 'CPU', 105, 95, 45, 65, [['Socket', 'AM4'], ['Cores', '6'], ['Threads', '12'], ['TDP', '65W']]),
  p('AMD Ryzen 5 5600 (6C/12T, up to 4.4 GHz)', 'amd-ryzen-5-5600', 'AMD', 'CPU', 139, 119, 50, 65, [['Socket', 'AM4'], ['Cores', '6'], ['Threads', '12'], ['TDP', '65W']]),
  p('AMD Ryzen 5 5600X (6C/12T, up to 4.6 GHz)', 'amd-ryzen-5-5600x', 'AMD', 'CPU', 159, 139, 38, 65, [['Socket', 'AM4'], ['Cores', '6'], ['Threads', '12'], ['TDP', '65W']]),
  p('AMD Ryzen 7 5700X (8C/16T, up to 4.6 GHz)', 'amd-ryzen-7-5700x', 'AMD', 'CPU', 199, 169, 30, 65, [['Socket', 'AM4'], ['Cores', '8'], ['Threads', '16'], ['TDP', '65W']]),
  p('AMD Ryzen 7 5700X3D (8C/16T, 3D V-Cache)', 'amd-ryzen-7-5700x3d', 'AMD', 'CPU', 249, 219, 25, 105, [['Socket', 'AM4'], ['Cores', '8'], ['Cache', '96MB 3D V-Cache'], ['TDP', '105W']]),
  p('AMD Ryzen 7 5800X3D (8C/16T, 3D V-Cache)', 'amd-ryzen-7-5800x3d', 'AMD', 'CPU', 329, 299, 15, 105, [['Socket', 'AM4'], ['Cores', '8'], ['Cache', '96MB 3D V-Cache'], ['TDP', '105W']]),
  p('AMD Ryzen 9 5900X (12C/24T, up to 4.8 GHz)', 'amd-ryzen-9-5900x', 'AMD', 'CPU', 319, 279, 18, 105, [['Socket', 'AM4'], ['Cores', '12'], ['Threads', '24'], ['TDP', '105W']]),
  p('AMD Ryzen 9 5950X (16C/32T, up to 4.9 GHz)', 'amd-ryzen-9-5950x', 'AMD', 'CPU', 429, 379, 12, 105, [['Socket', 'AM4'], ['Cores', '16'], ['Threads', '32'], ['TDP', '105W']]),
  p('AMD Ryzen 5 7500F (6C/12T, up to 5.0 GHz)', 'amd-ryzen-5-7500f', 'AMD', 'CPU', 179, 159, 40, 65, [['Socket', 'AM5'], ['Cores', '6'], ['Threads', '12'], ['TDP', '65W']]),
  p('AMD Ryzen 5 7600 (6C/12T, up to 5.1 GHz)', 'amd-ryzen-5-7600', 'AMD', 'CPU', 209, 189, 35, 65, [['Socket', 'AM5'], ['Cores', '6'], ['Threads', '12'], ['TDP', '65W']]),
  p('AMD Ryzen 5 7600X (6C/12T, up to 5.3 GHz)', 'amd-ryzen-5-7600x', 'AMD', 'CPU', 229, 199, 35, 105, [['Socket', 'AM5'], ['Cores', '6'], ['Threads', '12'], ['TDP', '105W']]),
  p('AMD Ryzen 7 7700X (8C/16T, up to 5.4 GHz)', 'amd-ryzen-7-7700x', 'AMD', 'CPU', 319, 289, 28, 105, [['Socket', 'AM5'], ['Cores', '8'], ['Threads', '16'], ['TDP', '105W']]),
  p('AMD Ryzen 7 7800X3D (8C/16T, 3D V-Cache)', 'amd-ryzen-7-7800x3d', 'AMD', 'CPU', 449, 389, 30, 120, [['Socket', 'AM5'], ['Cores', '8'], ['Cache', '96MB 3D V-Cache'], ['TDP', '120W']]),
  p('AMD Ryzen 9 7900X (12C/24T, up to 5.6 GHz)', 'amd-ryzen-9-7900x', 'AMD', 'CPU', 429, 379, 16, 170, [['Socket', 'AM5'], ['Cores', '12'], ['Threads', '24'], ['TDP', '170W']]),
  p('AMD Ryzen 9 7950X (16C/32T, up to 5.7 GHz)', 'amd-ryzen-9-7950x', 'AMD', 'CPU', 549, 499, 14, 170, [['Socket', 'AM5'], ['Cores', '16'], ['Threads', '32'], ['TDP', '170W']]),
  p('AMD Ryzen 9 7950X3D (16C/32T, 3D V-Cache)', 'amd-ryzen-9-7950x3d', 'AMD', 'CPU', 649, 599, 12, 120, [['Socket', 'AM5'], ['Cores', '16'], ['Threads', '32'], ['TDP', '120W']]),

  // =========================================================================
  // 2. GPU (GRAPHICS CARDS) - 35 SẢN PHẨM
  // =========================================================================
  p('MSI GeForce RTX 3050 VENTUS 2X 8G OC', 'msi-rtx-3050-ventus-2x-8g', 'MSI', 'GPU', 239, 219, 25, 130, [['VRAM', '8GB GDDR6'], ['Bus', '128-bit'], ['PSU Rec.', '500W']]),
  p('ASUS Dual GeForce RTX 3060 V2 OC 12GB', 'asus-dual-rtx-3060-12g', 'ASUS', 'GPU', 289, 269, 30, 170, [['VRAM', '12GB GDDR6'], ['Bus', '192-bit'], ['PSU Rec.', '550W']]),
  p('MSI GeForce RTX 3060 VENTUS 3X 12G OC', 'msi-rtx-3060-ventus-3x-12g', 'MSI', 'GPU', 299, 279, 22, 170, [['VRAM', '12GB GDDR6'], ['Bus', '192-bit'], ['PSU Rec.', '550W']]),
  p('Gigabyte GeForce RTX 3060 GAMING OC 12G', 'gigabyte-rtx-3060-gaming-oc-12g', 'Gigabyte', 'GPU', 299, 275, 20, 170, [['VRAM', '12GB GDDR6'], ['Bus', '192-bit'], ['PSU Rec.', '550W']]),
  p('Zotac Gaming GeForce RTX 4060 Twin Edge 8GB', 'zotac-rtx-4060-twin-edge-8g', 'ZOTAC', 'GPU', 299, 285, 35, 115, [['VRAM', '8GB GDDR6'], ['Bus', '128-bit'], ['PSU Rec.', '500W']]),
  p('MSI GeForce RTX 4060 VENTUS 2X BLACK 8G OC', 'msi-geforce-rtx-4060-ventus-2x', 'MSI', 'GPU', 299, 289, 40, 115, [['VRAM', '8GB GDDR6'], ['Bus', '128-bit'], ['PSU Rec.', '550W']]),
  p('ASUS Dual GeForce RTX 4060 EVO OC 8GB', 'asus-dual-rtx-4060-evo-8g', 'ASUS', 'GPU', 319, 299, 32, 115, [['VRAM', '8GB GDDR6'], ['Bus', '128-bit'], ['PSU Rec.', '550W']]),
  p('Gigabyte GeForce RTX 4060 WINDFORCE OC 8G', 'gigabyte-rtx-4060-windforce-8g', 'Gigabyte', 'GPU', 309, 289, 28, 115, [['VRAM', '8GB GDDR6'], ['Bus', '128-bit'], ['PSU Rec.', '550W']]),
  p('MSI GeForce RTX 4060 Ti VENTUS 2X 8G OC', 'msi-rtx-4060-ti-ventus-8g', 'MSI', 'GPU', 399, 379, 26, 160, [['VRAM', '8GB GDDR6'], ['Bus', '128-bit'], ['PSU Rec.', '550W']]),
  p('ASUS TUF Gaming GeForce RTX 4060 Ti 8GB OC', 'asus-tuf-rtx-4060-ti-8g-oc', 'ASUS', 'GPU', 439, 415, 20, 160, [['VRAM', '8GB GDDR6'], ['Bus', '128-bit'], ['PSU Rec.', '650W']]),
  p('Gigabyte GeForce RTX 4060 Ti GAMING OC 16GB', 'gigabyte-rtx-4060-ti-gaming-oc-16g', 'Gigabyte', 'GPU', 479, 449, 18, 165, [['VRAM', '16GB GDDR6'], ['Bus', '128-bit'], ['PSU Rec.', '650W']]),
  p('ASUS Dual GeForce RTX 4070 SUPER EVO 12GB', 'asus-dual-geforce-rtx-4070-super-12gb', 'ASUS', 'GPU', 609, 589, 25, 220, [['VRAM', '12GB GDDR6X'], ['Bus', '192-bit'], ['PSU Rec.', '650W']]),
  p('MSI GeForce RTX 4070 SUPER 12G VENTUS 2X OC', 'msi-rtx-4070-super-ventus-2x', 'MSI', 'GPU', 619, 595, 22, 220, [['VRAM', '12GB GDDR6X'], ['Bus', '192-bit'], ['PSU Rec.', '650W']]),
  p('Gigabyte GeForce RTX 4070 SUPER GAMING OC 12G', 'gigabyte-rtx-4070-super-gaming-oc-12g', 'Gigabyte', 'GPU', 639, 619, 20, 220, [['VRAM', '12GB GDDR6X'], ['Bus', '192-bit'], ['PSU Rec.', '700W']]),
  p('Gigabyte RTX 4070 Ti SUPER WINDFORCE OC 16GB', 'gigabyte-rtx-4070-ti-super-16gb', 'Gigabyte', 'GPU', 829, 799, 18, 285, [['VRAM', '16GB GDDR6X'], ['Bus', '256-bit'], ['PSU Rec.', '750W']]),
  p('MSI GeForce RTX 4070 Ti SUPER 16G GAMING X SLIM', 'msi-rtx-4070-ti-super-gaming-x', 'MSI', 'GPU', 849, 819, 16, 285, [['VRAM', '16GB GDDR6X'], ['Bus', '256-bit'], ['PSU Rec.', '750W']]),
  p('ASUS TUF Gaming GeForce RTX 4070 Ti SUPER 16G', 'asus-tuf-rtx-4070-ti-super-16g', 'ASUS', 'GPU', 869, 839, 15, 285, [['VRAM', '16GB GDDR6X'], ['Bus', '256-bit'], ['PSU Rec.', '750W']]),
  p('MSI GeForce RTX 4080 SUPER 16G GAMING X SLIM', 'msi-geforce-rtx-4080-super-16g', 'MSI', 'GPU', 1049, 999, 14, 320, [['VRAM', '16GB GDDR6X'], ['Bus', '256-bit'], ['PSU Rec.', '850W']]),
  p('ASUS ROG Strix GeForce RTX 4080 SUPER 16GB OC', 'asus-rog-strix-rtx-4080-super-16g', 'ASUS', 'GPU', 1199, 1149, 10, 320, [['VRAM', '16GB GDDR6X'], ['Bus', '256-bit'], ['PSU Rec.', '850W']]),
  p('Gigabyte AORUS GeForce RTX 4080 SUPER MASTER 16G', 'gigabyte-aorus-rtx-4080-super-master', 'Gigabyte', 'GPU', 1149, 1099, 8, 320, [['VRAM', '16GB GDDR6X'], ['Bus', '256-bit'], ['PSU Rec.', '850W']]),
  p('ASUS ROG Strix GeForce RTX 4090 OC Edition 24GB', 'asus-rog-strix-geforce-rtx-4090-24gb', 'ASUS', 'GPU', 1999, 1849, 5, 450, [['VRAM', '24GB GDDR6X'], ['Bus', '384-bit'], ['PSU Rec.', '1000W']]),
  p('MSI GeForce RTX 4090 SUPRIM X 24G GDDR6X', 'msi-rtx-4090-suprim-x-24g', 'MSI', 'GPU', 1949, 1829, 6, 450, [['VRAM', '24GB GDDR6X'], ['Bus', '384-bit'], ['PSU Rec.', '1000W']]),
  p('Gigabyte GeForce RTX 4090 GAMING OC 24G', 'gigabyte-rtx-4090-gaming-oc-24g', 'Gigabyte', 'GPU', 1899, 1799, 7, 450, [['VRAM', '24GB GDDR6X'], ['Bus', '384-bit'], ['PSU Rec.', '1000W']]),
  p('ZOTAC Gaming GeForce RTX 4090 AMP Extreme AIRO 24G', 'zotac-rtx-4090-amp-extreme-24g', 'ZOTAC', 'GPU', 1849, 1759, 5, 450, [['VRAM', '24GB GDDR6X'], ['Bus', '384-bit'], ['PSU Rec.', '1000W']]),
  p('Sapphire PULSE AMD Radeon RX 6600 8GB GDDR6', 'sapphire-pulse-rx-6600-8g', 'Sapphire', 'GPU', 219, 199, 30, 132, [['VRAM', '8GB GDDR6'], ['Bus', '128-bit'], ['PSU Rec.', '450W']]),
  p('XFX Speedster SWFT 210 Radeon RX 6650 XT 8GB', 'xfx-speedster-rx-6650-xt-8g', 'XFX', 'GPU', 249, 229, 25, 180, [['VRAM', '8GB GDDR6'], ['Bus', '128-bit'], ['PSU Rec.', '500W']]),
  p('XFX Speedster QICK 319 Radeon RX 6700 XT 12GB', 'xfx-speedster-rx-6700-xt-12g', 'XFX', 'GPU', 339, 315, 20, 230, [['VRAM', '12GB GDDR6'], ['Bus', '192-bit'], ['PSU Rec.', '650W']]),
  p('Sapphire PULSE AMD Radeon RX 7600 8GB GDDR6', 'sapphire-pulse-rx-7600-8g', 'Sapphire', 'GPU', 269, 249, 28, 165, [['VRAM', '8GB GDDR6'], ['Bus', '128-bit'], ['PSU Rec.', '550W']]),
  p('PowerColor Fighter AMD Radeon RX 7600 XT 16GB', 'powercolor-fighter-rx-7600-xt-16g', 'PowerColor', 'GPU', 329, 309, 20, 190, [['VRAM', '16GB GDDR6'], ['Bus', '128-bit'], ['PSU Rec.', '600W']]),
  p('Sapphire PULSE AMD Radeon RX 7700 XT 12GB', 'sapphire-pulse-rx-7700-xt-12g', 'Sapphire', 'GPU', 429, 399, 22, 245, [['VRAM', '12GB GDDR6'], ['Bus', '192-bit'], ['PSU Rec.', '700W']]),
  p('PowerColor Hellhound AMD Radeon RX 7800 XT 16GB', 'powercolor-hellhound-rx-7800-xt-16gb', 'PowerColor', 'GPU', 529, 499, 24, 263, [['VRAM', '16GB GDDR6'], ['Bus', '256-bit'], ['PSU Rec.', '750W']]),
  p('Sapphire NITRO+ AMD Radeon RX 7800 XT 16GB', 'sapphire-nitro-rx-7800-xt-16g', 'Sapphire', 'GPU', 559, 529, 18, 288, [['VRAM', '16GB GDDR6'], ['Bus', '256-bit'], ['PSU Rec.', '750W']]),
  p('Sapphire PURE AMD Radeon RX 7900 GRE 16GB White', 'sapphire-pure-rx-7900-gre-16g', 'Sapphire', 'GPU', 579, 549, 15, 260, [['VRAM', '16GB GDDR6'], ['Bus', '256-bit'], ['PSU Rec.', '750W']]),
  p('XFX Speedster MERC 310 Radeon RX 7900 XT 20GB', 'xfx-speedster-rx-7900-xt-20g', 'XFX', 'GPU', 749, 709, 14, 315, [['VRAM', '20GB GDDR6'], ['Bus', '320-bit'], ['PSU Rec.', '750W']]),
  p('Sapphire PULSE AMD Radeon RX 7900 XTX 24GB GDDR6', 'sapphire-pulse-amd-radeon-rx-7900-xtx-24gb', 'Sapphire', 'GPU', 969, 919, 10, 355, [['VRAM', '24GB GDDR6'], ['Bus', '384-bit'], ['PSU Rec.', '850W']]),

  // =========================================================================
  // 3. MAINBOARD (MOTHERBOARDS) - 26 SẢN PHẨM
  // =========================================================================
  p('MSI PRO H610M-E DDR4 Motherboard (LGA 1700)', 'msi-pro-h610m-e-ddr4', 'MSI', 'Mainboard', 79, 69, 45, 40, [['Socket', 'LGA 1700'], ['Memory', '2x DDR4 up to 3200'], ['Form', 'mATX']]),
  p('Gigabyte H610M S2H V2 DDR4 (LGA 1700)', 'gigabyte-h610m-s2h-v2-ddr4', 'Gigabyte', 'Mainboard', 89, 79, 40, 40, [['Socket', 'LGA 1700'], ['Memory', '2x DDR4'], ['Form', 'mATX']]),
  p('ASUS Prime H610M-K D4 Motherboard', 'asus-prime-h610m-k-d4', 'ASUS', 'Mainboard', 85, 75, 38, 40, [['Socket', 'LGA 1700'], ['Memory', 'DDR4'], ['Form', 'mATX']]),
  p('Gigabyte B760M DS3H DDR4 (LGA 1700)', 'gigabyte-b760m-ds3h-ddr4', 'Gigabyte', 'Mainboard', 119, 105, 35, 45, [['Socket', 'LGA 1700'], ['Memory', '4x DDR4'], ['M.2', '2x PCIe 4.0']]),
  p('MSI B760 GAMING PLUS WIFI DDR5', 'msi-b760-gaming-plus-wifi', 'MSI', 'Mainboard', 169, 149, 28, 50, [['Socket', 'LGA 1700'], ['Memory', '4x DDR5 6800+'], ['LAN', '2.5G + WiFi 6E']]),
  p('MSI MAG B760M MORTAR WIFI II DDR5', 'msi-mag-b760m-mortar-wifi-ii', 'MSI', 'Mainboard', 189, 169, 25, 50, [['Socket', 'LGA 1700'], ['Power', '12+1+1 75A'], ['Form', 'mATX']]),
  p('MSI MAG B760 TOMAHAWK WIFI Motherboard', 'msi-mag-b760-tomahawk-wifi', 'MSI', 'Mainboard', 199, 179, 30, 50, [['Socket', 'LGA 1700'], ['Memory', 'DDR5'], ['Form', 'ATX']]),
  p('ASUS TUF Gaming B760-PLUS WIFI DDR5', 'asus-tuf-b760-plus-wifi', 'ASUS', 'Mainboard', 209, 189, 22, 50, [['Socket', 'LGA 1700'], ['Power', '12+1 DrMOS'], ['Form', 'ATX']]),
  p('ASUS ROG Strix B760-A Gaming WiFi D4 White', 'asus-rog-strix-b760-a-wifi-d4', 'ASUS', 'Mainboard', 229, 209, 18, 50, [['Socket', 'LGA 1700'], ['Color', 'White/Silver'], ['Form', 'ATX']]),
  p('Gigabyte Z790 AORUS ELITE AX DDR5', 'gigabyte-z790-aorus-elite-ax', 'Gigabyte', 'Mainboard', 259, 235, 24, 60, [['Socket', 'LGA 1700'], ['Power', '16+1+2 Twin Digital'], ['Form', 'ATX']]),
  p('MSI MAG Z790 TOMAHAWK MAX WIFI', 'msi-mag-z790-tomahawk-max-wifi', 'MSI', 'Mainboard', 279, 255, 20, 60, [['Socket', 'LGA 1700'], ['Wireless', 'Wi-Fi 7'], ['Form', 'ATX']]),
  p('ASUS TUF Gaming Z790-PRO WIFI', 'asus-tuf-gaming-z790-pro-wifi', 'ASUS', 'Mainboard', 299, 279, 18, 60, [['Socket', 'LGA 1700'], ['Power', '16+1+1 60A'], ['Form', 'ATX']]),
  p('ASUS ROG MAXIMUS Z790 HERO Motherboard', 'asus-rog-maximus-z790-hero', 'ASUS', 'Mainboard', 629, 599, 10, 65, [['Socket', 'LGA 1700'], ['Power', '20+1 90A'], ['Form', 'ATX']]),
  p('MSI MPG Z790 CARBON WIFI DDR5', 'msi-mpg-z790-carbon-wifi', 'MSI', 'Mainboard', 419, 389, 12, 65, [['Socket', 'LGA 1700'], ['Power', '19+1+1 105A'], ['Form', 'ATX']]),
  p('Gigabyte A320M-S2H V2 (Socket AM4)', 'gigabyte-a320m-s2h-v2', 'Gigabyte', 'Mainboard', 59, 49, 35, 35, [['Socket', 'AM4'], ['Memory', '2x DDR4 3200'], ['Form', 'mATX']]),
  p('MSI B450M PRO-VDH MAX Motherboard AM4', 'msi-b450m-pro-vdh-max', 'MSI', 'Mainboard', 79, 69, 40, 40, [['Socket', 'AM4'], ['Memory', '4x DDR4 3866(OC)'], ['Form', 'mATX']]),
  p('ASUS TUF Gaming B450M-PLUS II AM4', 'asus-tuf-b450m-plus-ii', 'ASUS', 'Mainboard', 89, 79, 32, 40, [['Socket', 'AM4'], ['Aura Sync', 'RGB'], ['Form', 'mATX']]),
  p('Gigabyte B550M AORUS ELITE AM4', 'gigabyte-b550m-aorus-elite', 'Gigabyte', 'Mainboard', 119, 105, 35, 45, [['Socket', 'AM4'], ['Power', '5+3 Pure Digital'], ['PCIe', 'Gen 4.0']]),
  p('MSI MAG B550 TOMAHAWK AM4 ATX', 'msi-mag-b550-tomahawk', 'MSI', 'Mainboard', 169, 149, 25, 45, [['Socket', 'AM4'], ['Dual LAN', '2.5G + 1G'], ['Form', 'ATX']]),
  p('ASUS ROG Strix B550-F Gaming WiFi II AM4', 'asus-rog-strix-b550-f-wifi-ii', 'ASUS', 'Mainboard', 189, 169, 20, 45, [['Socket', 'AM4'], ['Audio', 'SupremeFX S1220A'], ['Form', 'ATX']]),
  p('Gigabyte A620M S2H DDR5 (AM5)', 'gigabyte-a620m-s2h', 'Gigabyte', 'Mainboard', 99, 89, 30, 40, [['Socket', 'AM5'], ['Memory', '2x DDR5 6400+'], ['Form', 'mATX']]),
  p('MSI PRO B650M-A WIFI Motherboard AM5', 'msi-pro-b650m-a-wifi', 'MSI', 'Mainboard', 159, 145, 30, 45, [['Socket', 'AM5'], ['Memory', '4x DDR5 6400+'], ['Form', 'mATX']]),
  p('Gigabyte B650 AORUS ELITE AX AM5 DDR5', 'gigabyte-b650-aorus-elite-ax', 'Gigabyte', 'Mainboard', 219, 199, 25, 50, [['Socket', 'AM5'], ['Power', '14+2+1 Digital'], ['Form', 'ATX']]),
  p('MSI MAG B650 TOMAHAWK WIFI AM5', 'msi-mag-b650-tomahawk-wifi', 'MSI', 'Mainboard', 219, 199, 26, 50, [['Socket', 'AM5'], ['Memory', 'DDR5 7600+'], ['Form', 'ATX']]),
  p('ASUS TUF Gaming B650-PLUS WIFI AM5', 'asus-tuf-b650-plus-wifi', 'ASUS', 'Mainboard', 229, 209, 20, 50, [['Socket', 'AM5'], ['M.2', 'PCIe 5.0 Ready'], ['Form', 'ATX']]),
  p('ASUS ROG Crosshair X670E Hero AM5', 'asus-rog-crosshair-x670e-hero', 'ASUS', 'Mainboard', 699, 649, 8, 70, [['Socket', 'AM5'], ['Power', '18+2 110A'], ['PCIe', 'Gen 5.0']]),

  // =========================================================================
  // 4. RAM (MEMORY) - 24 SẢN PHẨM
  // =========================================================================
  p('Kingston Fury Beast 8GB DDR4 3200MHz', 'kingston-fury-beast-8gb-ddr4-3200', 'Kingston', 'RAM', 25, 22, 60, 5, [['Type', 'DDR4'], ['Capacity', '8GB'], ['Speed', '3200 MT/s'], ['Timing', 'CL16']]),
  p('Kingston Fury Beast 16GB (2x8GB) DDR4 3200MHz', 'kingston-fury-beast-16gb-ddr4-3200', 'Kingston', 'RAM', 45, 39, 50, 10, [['Type', 'DDR4'], ['Kit', '2x8GB'], ['Speed', '3200 MT/s'], ['Timing', 'CL16']]),
  p('Corsair Vengeance LPX 16GB (2x8GB) DDR4 3200MHz', 'corsair-vengeance-lpx-16gb-ddr4-3200', 'Corsair', 'RAM', 49, 42, 60, 10, [['Type', 'DDR4'], ['Kit', '2x8GB'], ['Speed', '3200 MT/s'], ['Height', '34mm']]),
  p('Corsair Vengeance LPX 32GB (2x16GB) DDR4 3200MHz', 'corsair-vengeance-lpx-32gb-ddr4-3200', 'Corsair', 'RAM', 79, 69, 40, 12, [['Type', 'DDR4'], ['Kit', '2x16GB'], ['Speed', '3200 MT/s'], ['Timing', 'CL16']]),
  p('Corsair Vengeance LPX 32GB (2x16GB) DDR4 3600MHz', 'corsair-vengeance-lpx-32gb-ddr4-3600', 'Corsair', 'RAM', 89, 79, 35, 12, [['Type', 'DDR4'], ['Kit', '2x16GB'], ['Speed', '3600 MT/s'], ['Timing', 'CL18']]),
  p('G.SKILL Ripjaws V 16GB (2x8GB) DDR4 3600MHz CL18', 'gskill-ripjaws-v-16gb-ddr4-3600', 'G.Skill', 'RAM', 49, 42, 45, 10, [['Type', 'DDR4'], ['Kit', '2x8GB'], ['Speed', '3600 MT/s'], ['Timing', 'CL18']]),
  p('G.SKILL Ripjaws V 32GB (2x16GB) DDR4 3600MHz CL16', 'gskill-ripjaws-v-32gb-ddr4-3600', 'G.Skill', 'RAM', 89, 79, 30, 12, [['Type', 'DDR4'], ['Kit', '2x16GB'], ['Speed', '3600 MT/s'], ['Timing', 'CL16']]),
  p('TeamGroup T-Force Vulcan Z 16GB (2x8GB) DDR4 3200', 'teamgroup-tforce-vulcan-z-16g', 'TeamGroup', 'RAM', 42, 36, 50, 10, [['Type', 'DDR4'], ['Kit', '2x8GB'], ['Speed', '3200 MT/s'], ['Color', 'Gray']]),
  p('Kingston Fury Beast RGB 16GB (2x8GB) DDR4 3200', 'kingston-fury-beast-rgb-16gb-ddr4', 'Kingston', 'RAM', 55, 48, 40, 12, [['Type', 'DDR4'], ['Kit', '2x8GB'], ['RGB', 'Infrared Sync'], ['Speed', '3200']]),
  p('Crucial Pro 32GB (2x16GB) DDR4 3200MHz CL22', 'crucial-pro-32gb-ddr4-3200', 'Crucial', 'RAM', 69, 59, 35, 12, [['Type', 'DDR4'], ['Kit', '2x16GB'], ['Speed', '3200 MT/s'], ['Design', 'Low Profile']]),
  p('Kingston Fury Beast 16GB (1x16GB) DDR5 5200MHz', 'kingston-fury-beast-16gb-ddr5-5200', 'Kingston', 'RAM', 59, 52, 40, 8, [['Type', 'DDR5'], ['Single', '1x16GB'], ['Speed', '5200 MT/s'], ['Profile', 'XMP/EXPO']]),
  p('Kingston Fury Beast RGB 32GB (2x16GB) DDR5 5600', 'kingston-fury-beast-rgb-32gb-ddr5', 'Kingston', 'RAM', 129, 115, 40, 15, [['Type', 'DDR5'], ['Kit', '2x16GB'], ['Speed', '5600 MT/s'], ['Timing', 'CL36']]),
  p('Corsair Vengeance DDR5 32GB (2x16GB) 6000MHz CL36', 'corsair-vengeance-ddr5-32gb-6000', 'Corsair', 'RAM', 119, 105, 38, 15, [['Type', 'DDR5'], ['Kit', '2x16GB'], ['Speed', '6000 MT/s'], ['Timing', 'CL36']]),
  p('Corsair Vengeance RGB DDR5 32GB (2x16GB) 6000MHz', 'corsair-vengeance-rgb-ddr5-32gb-6000', 'Corsair', 'RAM', 135, 119, 35, 16, [['Type', 'DDR5'], ['Kit', '2x16GB'], ['RGB', 'Ten-Zone iCUE'], ['Speed', '6000']]),
  p('Corsair Vengeance DDR5 64GB (2x32GB) 6000MHz CL30', 'corsair-vengeance-ddr5-64gb-6000', 'Corsair', 'RAM', 219, 199, 20, 18, [['Type', 'DDR5'], ['Kit', '2x32GB'], ['Speed', '6000 MT/s'], ['Timing', 'CL30']]),
  p('Corsair Dominator Titanium RGB DDR5 64GB 6000 CL30', 'corsair-dominator-titanium-rgb-ddr5-64gb', 'Corsair', 'RAM', 319, 289, 14, 18, [['Type', 'DDR5'], ['Kit', '2x32GB'], ['Speed', '6000 MT/s'], ['Timing', 'CL30']]),
  p('G.SKILL Trident Z5 Neo RGB 32GB DDR5 6000 CL30', 'gskill-trident-z5-neo-rgb-32gb-ddr5', 'G.Skill', 'RAM', 139, 125, 35, 16, [['Type', 'DDR5'], ['Kit', '2x16GB'], ['Optimized', 'AMD EXPO'], ['Speed', '6000']]),
  p('G.SKILL Trident Z5 RGB 32GB DDR5 6400MHz CL32', 'gskill-trident-z5-rgb-32gb-6400', 'G.Skill', 'RAM', 149, 135, 30, 16, [['Type', 'DDR5'], ['Kit', '2x16GB'], ['Optimized', 'Intel XMP'], ['Speed', '6400']]),
  p('G.SKILL Trident Z5 RGB 64GB (2x32GB) DDR5 6000 CL30', 'gskill-trident-z5-rgb-64gb-6000', 'G.Skill', 'RAM', 229, 209, 18, 18, [['Type', 'DDR5'], ['Kit', '2x32GB'], ['Timing', 'CL30-40-40-96'], ['Speed', '6000']]),
  p('TeamGroup T-Force Delta RGB DDR5 32GB 6000 White', 'teamgroup-tforce-delta-rgb-ddr5-32gb-white', 'TeamGroup', 'RAM', 119, 109, 30, 15, [['Type', 'DDR5'], ['Kit', '2x16GB'], ['Color', 'Glacier White'], ['Speed', '6000']]),
  p('TeamGroup T-Force Delta RGB DDR5 32GB 6000 Black', 'teamgroup-tforce-delta-rgb-ddr5-32gb-black', 'TeamGroup', 'RAM', 119, 105, 30, 15, [['Type', 'DDR5'], ['Kit', '2x16GB'], ['Color', 'Stealth Black'], ['Speed', '6000']]),
  p('ADATA XPG Lancer Blade RGB DDR5 32GB 6000 CL30', 'adata-xpg-lancer-rgb-32gb-6000', 'ADATA', 'RAM', 119, 105, 28, 15, [['Type', 'DDR5'], ['Kit', '2x16GB'], ['Profile', 'XMP & EXPO'], ['Speed', '6000']]),
  p('Lexar ARES RGB DDR5 32GB (2x16GB) 6400MHz CL32', 'lexar-ares-rgb-ddr5-32gb-6400', 'Lexar', 'RAM', 129, 115, 25, 16, [['Type', 'DDR5'], ['Kit', '2x16GB'], ['Speed', '6400 MT/s'], ['Timing', 'CL32']]),
  p('Crucial Pro Overclocking DDR5 32GB 6000MHz CL36', 'crucial-pro-oc-ddr5-32gb-6000', 'Crucial', 'RAM', 109, 99, 35, 14, [['Type', 'DDR5'], ['Kit', '2x16GB'], ['Speed', '6000 MT/s'], ['Design', 'Low Profile Black']]),

  // =========================================================================
  // 5. STORAGE (NVME SSD / SATA / HDD) - 27 SẢN PHẨM
  // =========================================================================
  p('Kingston NV2 PCIe 4.0 NVMe M.2 SSD 500GB', 'kingston-nv2-500gb-ssd', 'Kingston', 'Storage', 45, 39, 50, 6, [['Interface', 'PCIe 4.0 x4'], ['Read', '3000 MB/s'], ['Write', '1300 MB/s']]),
  p('Kingston NV2 PCIe 4.0 NVMe M.2 SSD 1TB', 'kingston-nv2-1tb-ssd', 'Kingston', 'Storage', 69, 59, 60, 8, [['Interface', 'PCIe 4.0 x4'], ['Read', '3500 MB/s'], ['Write', '2100 MB/s']]),
  p('Kingston NV2 PCIe 4.0 NVMe M.2 SSD 2TB', 'kingston-nv2-2tb-ssd', 'Kingston', 'Storage', 129, 115, 40, 9, [['Interface', 'PCIe 4.0 x4'], ['Read', '3500 MB/s'], ['Write', '2800 MB/s']]),
  p('Crucial P3 Plus PCIe 4.0 NVMe 500GB M.2', 'crucial-p3-plus-500gb', 'Crucial', 'Storage', 49, 42, 45, 6, [['Interface', 'PCIe 4.0 x4'], ['Read', '4700 MB/s'], ['Write', '1900 MB/s']]),
  p('Crucial P3 Plus PCIe 4.0 NVMe 1TB M.2', 'crucial-p3-plus-1tb', 'Crucial', 'Storage', 75, 65, 50, 8, [['Interface', 'PCIe 4.0 x4'], ['Read', '5000 MB/s'], ['Write', '3600 MB/s']]),
  p('Crucial P3 Plus PCIe 4.0 NVMe 2TB M.2', 'crucial-p3-plus-2tb', 'Crucial', 'Storage', 139, 119, 35, 9, [['Interface', 'PCIe 4.0 x4'], ['Read', '5000 MB/s'], ['Write', '4200 MB/s']]),
  p('Western Digital WD Blue SN580 NVMe 1TB', 'wd-blue-sn580-1tb', 'Western Digital', 'Storage', 75, 65, 45, 7, [['Interface', 'PCIe 4.0 x4'], ['Read', '4150 MB/s'], ['Write', '4150 MB/s']]),
  p('Western Digital WD Black SN770 NVMe 1TB', 'wd-black-sn770-1tb', 'Western Digital', 'Storage', 89, 75, 40, 8, [['Interface', 'PCIe 4.0 x4'], ['Read', '5150 MB/s'], ['Write', '4900 MB/s']]),
  p('Western Digital WD Black SN770 NVMe 2TB', 'wd-black-sn770-2tb', 'Western Digital', 'Storage', 159, 139, 30, 9, [['Interface', 'PCIe 4.0 x4'], ['Read', '5150 MB/s'], ['Write', '4850 MB/s']]),
  p('Samsung 980 PRO PCIe 4.0 NVMe M.2 1TB', 'samsung-980-pro-1tb', 'Samsung', 'Storage', 109, 95, 35, 9, [['Interface', 'PCIe 4.0 x4'], ['Read', '7000 MB/s'], ['Write', '5000 MB/s']]),
  p('Samsung 980 PRO PCIe 4.0 NVMe M.2 2TB', 'samsung-980-pro-2tb', 'Samsung', 'Storage', 169, 149, 28, 10, [['Interface', 'PCIe 4.0 x4'], ['Read', '7000 MB/s'], ['Write', '5100 MB/s']]),
  p('Samsung 990 PRO NVMe M.2 SSD 1TB', 'samsung-990-pro-1tb', 'Samsung', 'Storage', 129, 115, 35, 9, [['Interface', 'PCIe 4.0 x4'], ['Read', '7450 MB/s'], ['Write', '6900 MB/s']]),
  p('Samsung 990 PRO NVMe M.2 SSD 2TB', 'samsung-990-pro-2tb', 'Samsung', 'Storage', 189, 169, 30, 10, [['Interface', 'PCIe 4.0 x4'], ['Read', '7450 MB/s'], ['Write', '6900 MB/s']]),
  p('Samsung 990 PRO NVMe M.2 SSD 4TB', 'samsung-990-pro-4tb', 'Samsung', 'Storage', 349, 319, 12, 11, [['Interface', 'PCIe 4.0 x4'], ['Read', '7450 MB/s'], ['Write', '6900 MB/s']]),
  p('Western Digital WD_BLACK SN850X 1TB', 'wd-black-sn850x-1tb', 'Western Digital', 'Storage', 109, 94, 35, 9, [['Interface', 'PCIe 4.0 x4'], ['Read', '7300 MB/s'], ['Write', '6300 MB/s']]),
  p('Western Digital WD_BLACK SN850X 2TB', 'wd-black-sn850x-2tb', 'Western Digital', 'Storage', 179, 159, 28, 10, [['Interface', 'PCIe 4.0 x4'], ['Read', '7300 MB/s'], ['Write', '6600 MB/s']]),
  p('Western Digital WD_BLACK SN850X 4TB', 'wd-black-sn850x-4tb', 'Western Digital', 'Storage', 339, 309, 10, 11, [['Interface', 'PCIe 4.0 x4'], ['Read', '7300 MB/s'], ['Write', '6600 MB/s']]),
  p('Kingston KC3000 PCIe 4.0 NVMe 1TB', 'kingston-kc3000-1tb-ssd', 'Kingston', 'Storage', 109, 95, 50, 9, [['Interface', 'PCIe 4.0 x4'], ['Read', '7000 MB/s'], ['Write', '6000 MB/s']]),
  p('Kingston KC3000 PCIe 4.0 NVMe 2TB', 'kingston-kc3000-2tb-ssd', 'Kingston', 'Storage', 179, 155, 30, 10, [['Interface', 'PCIe 4.0 x4'], ['Read', '7000 MB/s'], ['Write', '7000 MB/s']]),
  p('Lexar NM790 M.2 2280 PCIe Gen 4x4 1TB', 'lexar-nm790-1tb', 'Lexar', 'Storage', 89, 79, 38, 8, [['Interface', 'PCIe 4.0 x4'], ['Read', '7400 MB/s'], ['Write', '6500 MB/s']]),
  p('Lexar NM790 M.2 2280 PCIe Gen 4x4 2TB', 'lexar-nm790-2tb', 'Lexar', 'Storage', 149, 135, 30, 9, [['Interface', 'PCIe 4.0 x4'], ['Read', '7400 MB/s'], ['Write', '6500 MB/s']]),
  p('Crucial T700 1TB PCIe Gen5 NVMe with Heatsink', 'crucial-t700-1tb-gen5', 'Crucial', 'Storage', 179, 159, 15, 12, [['Interface', 'PCIe 5.0 x4'], ['Read', '11700 MB/s'], ['Write', '9500 MB/s']]),
  p('Crucial T700 2TB PCIe Gen5 NVMe with Heatsink', 'crucial-t700-2tb-gen5-ssd', 'Crucial', 'Storage', 289, 269, 8, 14, [['Interface', 'PCIe 5.0 x4'], ['Read', '12400 MB/s'], ['Write', '11800 MB/s']]),
  p('Kingston A400 480GB SATA 2.5" SSD', 'kingston-a400-480gb-sata', 'Kingston', 'Storage', 39, 32, 60, 4, [['Interface', 'SATA III 6Gb/s'], ['Read', '500 MB/s'], ['Write', '450 MB/s']]),
  p('Crucial MX500 1TB 3D NAND SATA 2.5" SSD', 'crucial-mx500-1tb-sata', 'Crucial', 'Storage', 79, 69, 45, 5, [['Interface', 'SATA III 6Gb/s'], ['Read', '560 MB/s'], ['Write', '510 MB/s']]),
  p('Seagate BarraCuda 2TB 3.5" 7200 RPM HDD', 'seagate-barracuda-2tb-hdd', 'Seagate', 'Storage', 64, 55, 25, 7, [['Form', '3.5 inch'], ['RPM', '7200'], ['Cache', '256MB']]),
  p('Western Digital WD Blue 2TB 3.5" 7200 RPM HDD', 'wd-blue-2tb-hdd', 'Western Digital', 'Storage', 64, 55, 30, 7, [['Form', '3.5 inch'], ['RPM', '7200'], ['Cache', '256MB']]),

  // =========================================================================
  // 6. PSU (POWER SUPPLIES) - 19 SẢN PHẨM
  // =========================================================================
  p('DeepCool PK550D 550W 80 PLUS Bronze', 'deepcool-pk550d-550w-bronze', 'DeepCool', 'PSU', 55, 48, 40, 550, [['Efficiency', '80 PLUS Bronze'], ['Cabling', 'Fixed Flat Black']]),
  p('DeepCool PK650D 650W 80 PLUS Bronze', 'deepcool-pk650d-650w-bronze', 'DeepCool', 'PSU', 65, 55, 45, 650, [['Efficiency', '80 PLUS Bronze'], ['Output', '650W']]),
  p('Corsair CV650 650W 80 PLUS Bronze', 'corsair-cv650-650w-bronze', 'Corsair', 'PSU', 69, 59, 40, 650, [['Efficiency', '80 PLUS Bronze'], ['Fan', '120mm Low-Noise']]),
  p('MSI MAG A650BN 650W 80 PLUS Bronze', 'msi-mag-a650bn-650w', 'MSI', 'PSU', 69, 59, 42, 650, [['Efficiency', '80 PLUS Bronze'], ['Design', 'DC-to-DC']]),
  p('Cooler Master MWE 650 Bronze V2 650W', 'cooler-master-mwe-650-bronze-v2', 'Cooler Master', 'PSU', 75, 65, 35, 650, [['Efficiency', '80 PLUS Bronze'], ['Cables', 'Flat Black']]),
  p('Corsair RM750e (2023) 750W 80 PLUS Gold ATX 3.0', 'corsair-rm750e-gold-atx3', 'Corsair', 'PSU', 119, 99, 30, 750, [['Efficiency', '80 PLUS Gold'], ['Standard', 'ATX 3.0 (12VHPWR)'], ['Modular', 'Fully Modular']]),
  p('MSI MAG A750GL PCIE5 750W 80 PLUS Gold', 'msi-mag-a750gl-pcie5-750w', 'MSI', 'PSU', 109, 99, 35, 750, [['Efficiency', '80 PLUS Gold'], ['PCIe 5.0', '16-Pin Ready'], ['Modular', 'Fully Modular']]),
  p('Seasonic FOCUS GX-750 750W 80 PLUS Gold', 'seasonic-focus-gx-750-gold', 'Seasonic', 'PSU', 139, 125, 25, 750, [['Efficiency', '80 PLUS Gold'], ['Capacitors', '100% Japanese'], ['Warranty', '10 Years']]),
  p('ASUS TUF Gaming 750W 80 PLUS Gold', 'asus-tuf-gaming-750w-gold', 'ASUS', 'PSU', 135, 119, 22, 750, [['Efficiency', '80 PLUS Gold'], ['Protection', 'Military Grade PCB']]),
  p('Corsair RM850x Shift 850W 80 PLUS Gold ATX 3.0', 'corsair-rm850x-shift-850w', 'Corsair', 'PSU', 159, 139, 28, 850, [['Interface', 'Side Modular Panel'], ['Efficiency', '80 PLUS Gold'], ['Standard', 'ATX 3.0']]),
  p('Seasonic FOCUS GX-850 850W 80 PLUS Gold ATX 3.0', 'seasonic-focus-gx-850-gold-atx3', 'Seasonic', 'PSU', 169, 149, 25, 850, [['Efficiency', '80 PLUS Gold'], ['ATX 3.0', 'Native 12VHPWR'], ['Warranty', '10 Years']]),
  p('MSI MAG A850GL PCIE5 850W 80 PLUS Gold', 'msi-mag-a850gl-pcie5-850w', 'MSI', 'PSU', 139, 125, 30, 850, [['Efficiency', '80 PLUS Gold'], ['PCIe 5.0', '16-Pin Ready'], ['Length', '140mm Compact']]),
  p('Cooler Master V850 Gold i Multi 850W ATX 3.0', 'cooler-master-v850-gold-atx3', 'Cooler Master', 'PSU', 149, 135, 20, 850, [['Efficiency', '80 PLUS Gold'], ['Fan Bearing', '135mm FDB']]),
  p('be quiet! Pure Power 12 M 850W 80 PLUS Gold', 'bequiet-pure-power-12m-850w', 'be quiet!', 'PSU', 145, 129, 22, 850, [['Efficiency', '80 PLUS Gold'], ['Acoustics', 'Silence-Optimized']]),
  p('Corsair RM1000x Shift 1000W 80 PLUS Gold ATX 3.0', 'corsair-rm1000x-shift-1000w-gold', 'Corsair', 'PSU', 209, 189, 20, 1000, [['Efficiency', '80 PLUS Gold'], ['Output', '1000W'], ['Side Panel', 'Yes']]),
  p('Seasonic Vertex GX-1000 1000W 80 PLUS Gold ATX 3.0', 'seasonic-vertex-gx-1000-atx3', 'Seasonic', 'PSU', 229, 209, 18, 1000, [['Efficiency', '80 PLUS Gold'], ['Standard', 'ATX 3.0 & PCIe 5.0']]),
  p('ASUS ROG Strix 1000W Gold Aura Edition', 'asus-rog-strix-1000w-aura', 'ASUS', 'PSU', 219, 199, 15, 1000, [['Lighting', 'Aura Sync RGB'], ['Chassis', 'Aluminum Shroud']]),
  p('MSI MEG Ai1300P PCIE5 1300W 80 PLUS Platinum', 'msi-meg-ai1300p-pcie5', 'MSI', 'PSU', 329, 299, 10, 1300, [['Efficiency', '80 PLUS Platinum'], ['Output', '1300W Digital']]),
  p('ASUS ROG Thor 1200W Platinum II OLED Power Supply', 'asus-rog-thor-1200w-plat2', 'ASUS', 'PSU', 369, 339, 8, 1200, [['Efficiency', '80 PLUS Platinum'], ['Display', 'OLED Power Meter']]),

  // =========================================================================
  // 7. CASE (CHASSIS) - 16 SẢN PHẨM
  // =========================================================================
  p('NZXT H5 Flow Compact ATX Mid-Tower Case - Black', 'nzxt-h5-flow-black', 'NZXT', 'Case', 94, 84, 25, 0, [['Form', 'Mid-Tower'], ['GPU Clearance', '365mm'], ['Fans', 'Dedicated Bottom GPU Fan']]),
  p('NZXT H5 Flow Compact ATX Mid-Tower Case - White', 'nzxt-h5-flow-white', 'NZXT', 'Case', 94, 84, 20, 0, [['Color', 'All-White'], ['Form', 'Mid-Tower'], ['Side', 'Tempered Glass']]),
  p('NZXT H7 Flow Mid-Tower ATX Case - Black', 'nzxt-h7-flow-black', 'NZXT', 'Case', 129, 115, 20, 0, [['Radiator', 'Up to 360mm Top/Front'], ['Fans', '2x 120mm Quiet Airflow']]),
  p('NZXT H9 Flow Dual-Chamber Mid-Tower ATX Case', 'nzxt-h9-flow-dual-chamber-case', 'NZXT', 'Case', 159, 149, 15, 0, [['Chamber', 'Dual-Chamber'], ['Glass', 'Wrap-Around Seamless'], ['Fans Included', '4x 120mm']]),
  p('NZXT H9 Elite Dual-Chamber Premium Glass Case', 'nzxt-h9-elite-glass', 'NZXT', 'Case', 239, 219, 10, 0, [['Glass', 'Glass Top & Front'], ['RGB', 'RGB & Fan Controller Included']]),
  p('Corsair 4000D Airflow Tempered Glass Black', 'corsair-4000d-airflow-black', 'Corsair', 'Case', 104, 89, 35, 0, [['Front', 'High-Airflow Steel Grille'], ['Cable Route', 'RapidRoute 25mm']]),
  p('Corsair 4000D Airflow Tempered Glass White', 'corsair-4000d-airflow-white', 'Corsair', 'Case', 104, 89, 30, 0, [['Color', 'Arctic White'], ['Front', 'High-Airflow Steel Grille']]),
  p('Corsair 5000D Airflow Mid-Tower Case Black', 'corsair-5000d-airflow-black', 'Corsair', 'Case', 174, 154, 18, 0, [['Radiator', 'Dual 360mm Simultaneous'], ['Front', 'High-Airflow Grille']]),
  p('Corsair 3500X ARGB Tempered Glass Mid-Tower', 'corsair-3500x-argb-black', 'Corsair', 'Case', 109, 99, 22, 0, [['Pillar', 'Pillar-less Corner Glass'], ['Fans', '3x RS120 ARGB Included']]),
  p('Lian Li O11 Dynamic EVO RGB Full-Tower White', 'lian-li-o11-dynamic-evo-rgb-white', 'Lian Li', 'Case', 179, 165, 18, 0, [['Pillar', 'Removable Front Pillar'], ['Lighting', 'Dual ARGB Strips']]),
  p('Lian Li O11 Vision Chrome Panoramic Glass Case', 'lian-li-o11-vision-chrome', 'Lian Li', 'Case', 149, 139, 15, 0, [['Panels', 'Three-Sided Glass'], ['Co-designed', 'PCMR Collaboration']]),
  p('Lian Li LANCOOL 216 RGB Airflow Mid-Tower', 'lian-li-lancool-216-rgb', 'Lian Li', 'Case', 109, 99, 25, 0, [['Front Fans', '2x 160mm ARGB Pro'], ['Rear Fan', '1x 140mm PWM']]),
  p('Lian Li A3-mATX Micro-ATX Small Form Factor', 'lian-li-a3-matx-black', 'Lian Li', 'Case', 69, 62, 30, 0, [['Volume', '26.3 Liters'], ['GPU Fit', 'Up to 415mm 4-Slot'], ['Design', 'DAN Cases Co-Op']]),
  p('Fractal Design North Charcoal Black (Real Walnut)', 'fractal-design-north-black-walnut', 'Fractal Design', 'Case', 149, 139, 12, 0, [['Front', 'FSC Real Walnut Wood'], ['Glass', 'Dark Tinted Tempered']]),
  p('Fractal Design Pop Air RGB High-Airflow Mid-Tower', 'fractal-design-pop-air-rgb', 'Fractal Design', 'Case', 89, 79, 20, 0, [['Hex Mesh', 'Patterned Front'], ['Fans Included', '3x 120mm Aspect RGB']]),
  p('Montech KING 95 PRO Curved Glass ARGB Case', 'montech-king-95-pro-black', 'Montech', 'Case', 159, 145, 16, 0, [['Glass', 'Curved Panoramic Glass'], ['Included Fans', '6x ARGB PWM Fans']]),

  // =========================================================================
  // 8. COOLING (AIO LIQUID & AIR COOLERS) - 14 SẢN PHẨM
  // =========================================================================
  p('Thermalright Peerless Assassin 120 SE Dual-Tower', 'thermalright-peerless-assassin-120-se', 'Thermalright', 'Cooling', 45, 38, 50, 10, [['Type', 'Air Cooler'], ['Heatpipes', '6x 6mm AGHP'], ['Fans', '2x 120mm PWM'], ['Height', '155mm']]),
  p('Thermalright Phantom Spirit 120 SE 7-Heatpipe', 'thermalright-phantom-spirit-120-se', 'Thermalright', 'Cooling', 49, 42, 45, 10, [['Type', 'Air Cooler'], ['Heatpipes', '7x 6mm AGHP Gen 4'], ['Capacity', 'Up to 280W TDP']]),
  p('DeepCool AK400 High-Performance Single-Tower', 'deepcool-ak400-cooler', 'DeepCool', 'Cooling', 35, 29, 40, 8, [['Type', 'Air Cooler'], ['Fin Design', 'Matrix Fin Array'], ['Fan', '120mm FDB PWM']]),
  p('DeepCool AK620 Digital Dual-Tower with Display', 'deepcool-ak620-digital', 'DeepCool', 'Cooling', 79, 69, 25, 12, [['Type', 'Air Cooler'], ['Screen', 'Real-Time CPU Temp / Usage'], ['TDP', '260W']]),
  p('Noctua NH-U12S chromax.black 120mm Single-Tower', 'noctua-nh-u12s-chromax', 'Noctua', 'Cooling', 89, 79, 20, 10, [['Color', 'All-Black Stealth'], ['Fan', 'NF-F12 PWM 120mm'], ['RAM Clearance', '100%']]),
  p('Noctua NH-D15 chromax.black Dual-Tower Quiet Cooler', 'noctua-nh-d15-chromax-black', 'Noctua', 'Cooling', 129, 119, 16, 12, [['Color', 'chromax.black'], ['Fans', '2x NF-A15 140mm'], ['Noise', 'Max 24.6 dB(A)']]),
  p('Thermalright Frozen Notte 360 Black ARGB AIO', 'thermalright-frozen-notte-360', 'Thermalright', 'Cooling', 79, 69, 30, 20, [['Radiator', '360mm Aluminum'], ['Pump', '5300 RPM High-Speed'], ['RGB', 'ARGB Infinity Mirror']]),
  p('Arctic Liquid Freezer III 360 Multi-Compatible AIO', 'arctic-liquid-freezer-iii-360', 'Arctic', 'Cooling', 119, 105, 25, 22, [['Radiator', '38mm Extra-Thick 360mm'], ['VRM Fan', 'Integrated VRM Cooling']]),
  p('DeepCool LT720 360mm High-Performance Liquid Cooler', 'deepcool-lt720-360mm-liquid-cooler', 'DeepCool', 'Cooling', 139, 119, 22, 22, [['Radiator', '360mm'], ['Mirror', 'Multidimensional Infinity Mirror'], ['TDP', '300W']]),
  p('DeepCool LS720 SE 360mm ARGB Liquid Cooler', 'deepcool-ls720-se-360', 'DeepCool', 'Cooling', 119, 99, 25, 20, [['Radiator', '360mm'], ['Fans', '3x FE120 ARGB PWM'], ['Cap', 'Rotatable Mirror']]),
  p('NZXT Kraken 240 RGB 240mm AIO with 1.54" LCD', 'nzxt-kraken-240-rgb', 'NZXT', 'Cooling', 179, 159, 18, 18, [['Radiator', '240mm'], ['Display', '1.54" LCD (System Stats/Custom GIF)']]),
  p('NZXT Kraken 360 RGB 360mm AIO with 1.54" LCD', 'nzxt-kraken-360-rgb', 'NZXT', 'Cooling', 219, 199, 15, 24, [['Radiator', '360mm'], ['Display', '1.54" Square LCD'], ['Fans', '3x F120 RGB Core']]),
  p('NZXT Kraken Elite 360 RGB with 2.36" 60Hz LCD', 'nzxt-kraken-elite-360-rgb', 'NZXT', 'Cooling', 299, 279, 12, 25, [['Radiator', '360mm'], ['Display', '2.36" 640x640 60Hz LCD'], ['Pump', 'Asetek 7th Gen']]),
  p('Corsair iCUE H150i Elite LCD XT 360mm AIO', 'corsair-icue-h150i-elite-lcd-xt', 'Corsair', 'Cooling', 289, 259, 10, 25, [['Radiator', '360mm'], ['Screen', '2.1" IPS LCD 480x480'], ['Fans', '3x AF120 RGB ELITE']]),

  // =========================================================================
  // 9. MONITOR (DISPLAYS) - 15 SẢN PHẨM
  // =========================================================================
  p('ViewSonic OMNI VX2479-HD-PRO 24" Fast IPS 165Hz', 'viewsonic-vx2479-hd-pro-24-165hz', 'ViewSonic', 'Monitor', 139, 119, 40, 28, [['Size', '24 inch'], ['Resolution', '1920x1080 FHD'], ['Refresh', '165Hz'], ['Response', '1ms MPRT']]),
  p('ASUS TUF Gaming VG249Q1A 23.8" IPS 165Hz 1ms', 'asus-tuf-vg249q1a-24', 'ASUS', 'Monitor', 149, 129, 35, 25, [['Size', '23.8 inch'], ['Resolution', 'Full HD 1080p'], ['Tech', 'Extreme Low Motion Blur']]),
  p('AOC 24G2SP 23.8" 165Hz Fast IPS Gaming Monitor', 'aoc-24g2sp-24-ips-165hz', 'AOC', 'Monitor', 159, 139, 30, 26, [['Size', '23.8 inch'], ['Color', '126% sRGB'], ['Stand', 'Height Adjustable']]),
  p('BenQ ZOWIE XL2411K 24" 144Hz Esports Display', 'benq-zowie-xl2411k-144hz', 'BenQ', 'Monitor', 199, 179, 20, 32, [['Size', '24 inch TN'], ['Feature', 'DyAc Technology'], ['Optimized', 'CS2 & Valorant']]),
  p('AOC Gaming Q27G2S/EU 27" QHD 165Hz IPS Display', 'aoc-q27g2s-27-qhd-ips', 'AOC', 'Monitor', 249, 219, 25, 35, [['Size', '27 inch'], ['Resolution', '2560x1440 2K QHD'], ['Panel', 'IPS 165Hz 1ms']]),
  p('Gigabyte M27Q 27" 170Hz 1440p KVM Gaming Monitor', 'gigabyte-m27q-27-170hz', 'Gigabyte', 'Monitor', 289, 259, 22, 38, [['Size', '27 inch SS IPS'], ['Resolution', '2K 2560x1440'], ['Feature', 'Built-in KVM Switch']]),
  p('ASUS TUF Gaming VG27AQ 27" 2K 165Hz G-SYNC', 'asus-tuf-vg27aq-27-2k', 'ASUS', 'Monitor', 299, 269, 20, 40, [['Size', '27 inch IPS'], ['HDR', 'HDR10 Support'], ['Sync', 'G-SYNC Compatible']]),
  p('LG UltraGear 27GP850-B 27" QHD Nano IPS 180Hz', 'lg-ultragear-27gp850-b', 'LG', 'Monitor', 379, 339, 18, 45, [['Panel', 'Nano IPS 1ms GTG'], ['Resolution', '2560x1440'], ['Refresh', '180Hz (O/C)']]),
  p('Dell G2724D 27" QHD Fast IPS 165Hz 1ms Gaming', 'dell-g2724d-27-qhd', 'Dell', 'Monitor', 279, 249, 24, 35, [['Panel', 'Fast IPS'], ['Color', '99% sRGB'], ['Cert', 'VESA DisplayHDR 400']]),
  p('Samsung Odyssey G7 32" Curved 240Hz 1ms 1000R', 'samsung-odyssey-g7-32-curved', 'Samsung', 'Monitor', 599, 529, 12, 60, [['Curvature', '1000R Deep Curve'], ['Refresh', '240Hz'], ['Panel', 'QLED 2560x1440']]),
  p('ASUS ROG Swift PG27AQDM 27" OLED 240Hz 0.03ms', 'asus-rog-swift-pg27aqdm-oled', 'ASUS', 'Monitor', 899, 799, 7, 45, [['Panel', '27" 2K OLED'], ['Refresh', '240Hz'], ['Response', '0.03ms GTG']]),
  p('LG UltraGear 27GR95QE-B 27" QHD OLED 240Hz', 'lg-ultragear-27gr95qe-oled', 'LG', 'Monitor', 799, 699, 10, 42, [['Panel', 'OLED 2560x1440'], ['Contrast', '1,500,000:1'], ['Response', '0.03ms']]),
  p('Gigabyte M32U 31.5" 4K UHD 144Hz FreeSync Premium', 'gigabyte-m32u-32-4k-144hz', 'Gigabyte', 'Monitor', 679, 619, 10, 75, [['Resolution', '4K 3840x2160'], ['HDMI', 'Dual HDMI 2.1'], ['Size', '31.5 inch Super Speed IPS']]),
  p('Alienware AW3423DWF 34" QD-OLED Curved Ultrawide', 'alienware-aw3423dwf-qd-oled', 'Alienware', 'Monitor', 899, 799, 6, 65, [['Aspect', '21:9 Curved 1800R'], ['Resolution', '3440x1440 WQHD'], ['Panel', 'Quantum Dot OLED']]),
  p('Samsung Odyssey OLED G9 49" 240Hz 0.03ms Dual QHD', 'samsung-odyssey-oled-g9-49', 'Samsung', 'Monitor', 1399, 1199, 4, 90, [['Aspect', '32:9 Super Ultrawide'], ['Resolution', '5120x1440'], ['Refresh', '240Hz OLED']]),

  // =========================================================================
  // 10. GEAR (GAMING PERIPHERALS) - 20 SẢN PHẨM
  // =========================================================================
  p('Logitech G102 LIGHTSYNC RGB Gaming Mouse', 'logitech-g102-lightsync', 'Logitech', 'Gear', 29, 22, 60, 2, [['Sensor', '8000 DPI Gaming Grade'], ['Lighting', 'LIGHTSYNC Color Wave']]),
  p('Logitech G502 HERO High Performance Gaming Mouse', 'logitech-g502-hero', 'Logitech', 'Gear', 49, 39, 50, 3, [['Sensor', 'HERO 25K DPI'], ['Weights', '5x 3.6g Removable'], ['Buttons', '11 Programmable']]),
  p('Logitech G PRO X SUPERLIGHT 2 Wireless Mouse', 'logitech-g-pro-x-superlight-2', 'Logitech', 'Gear', 159, 139, 25, 5, [['Weight', '60 grams'], ['Sensor', 'HERO 2 32K DPI'], ['Polling', '4000Hz Wireless']]),
  p('Razer Viper V3 Pro Ultra-Lightweight Wireless', 'razer-viper-v3-pro-wireless', 'Razer', 'Gear', 159, 145, 18, 5, [['Weight', '54 grams'], ['Polling', 'True 8000Hz HyperPolling'], ['Sensor', 'Focus Pro 35K Gen-2']]),
  p('Razer DeathAdder V3 Pro Ergonomic Wireless Mouse', 'razer-deathadder-v3-pro', 'Razer', 'Gear', 149, 135, 20, 5, [['Weight', '63 grams'], ['Ergonomics', 'Refined Iconic Shape'], ['Battery', '90 Hours']]),
  p('ZOWIE EC2-CW Wireless Esports Gaming Mouse', 'zowie-ec2-cw-wireless', 'ZOWIE', 'Gear', 149, 139, 15, 5, [['Design', 'Driverless Plug and Play'], ['Antenna', 'Enhanced Stand Receiver']]),
  p('Glorious Model O 2 Wireless Ultra-Light Mouse', 'glorious-model-o-2-wireless', 'Glorious', 'Gear', 99, 85, 22, 4, [['Weight', '68 grams'], ['Battery', 'Up to 210 Hours (Bluetooth)'], ['Sensor', 'BAMF 2.0 26K']]),
  p('Pulsar X2V2 Wireless Gaming Mouse Size 2 Black', 'pulsar-x2v2-wireless-black', 'Pulsar', 'Gear', 99, 89, 20, 4, [['Weight', '53 grams'], ['Switches', 'Optical Switches'], ['Encoder', 'Pulsar Blue']]),
  p('Akko 3087 DS Horizon Mechanical Keyboard', 'akko-3087-ds-horizon', 'Akko', 'Gear', 69, 59, 30, 5, [['Layout', 'TKL 87-Keys'], ['Keycaps', 'Double-Shot PBT 85%'], ['Switches', 'Akko V3 Cream Yellow']]),
  p('Corsair K70 RGB PRO Mechanical Keyboard Cherry Red', 'corsair-k70-rgb-pro-cherry-red', 'Corsair', 'Gear', 169, 149, 18, 5, [['Switches', 'CHERRY MX RGB Red Linear'], ['Polling', '8000Hz Hyper-Polling (AXON)']]),
  p('Keychron V1 QMK Custom Mechanical Keyboard (75%)', 'keychron-v1-qmk-custom-keyboard', 'Keychron', 'Gear', 99, 89, 22, 5, [['Layout', '75% Compact (82 Keys)'], ['Hot-Swap', 'Yes 5-pin'], ['Knob', 'Rotary Encoder']]),
  p('Keychron K2 Pro Wireless Custom QMK/VIA Keyboard', 'keychron-k2-pro-wireless', 'Keychron', 'Gear', 119, 105, 20, 5, [['Wireless', 'Bluetooth 5.1 & Type-C'], ['Plate', 'Sound Absorbing Silicone']]),
  p('Razer Huntsman V3 Pro Analog Optical Esports TKL', 'razer-huntsman-v3-pro-tkl', 'Razer', 'Gear', 219, 199, 14, 5, [['Switches', 'Gen-2 Analog Optical'], ['Feature', 'Rapid Trigger 0.1-4.0mm Actuation']]),
  p('SteelSeries Apex Pro TKL (2023) OmniPoint 2.0', 'steelseries-apex-pro-tkl-2023', 'SteelSeries', 'Gear', 199, 179, 15, 5, [['Switches', 'OmniPoint 2.0 Adjustable HyperMagnetic'], ['Display', 'OLED Smart Display']]),
  p('Wooting 60HE+ Hall Effect Analog Rapid Trigger', 'wooting-60he-plus-keyboard', 'Wooting', 'Gear', 199, 189, 10, 5, [['Technology', 'Lekker Hall Effect Magnetic'], ['Rapid Trigger', 'Continuous 0.1mm Precision']]),
  p('HyperX Cloud II Gaming Headset (Gunmetal)', 'hyperx-cloud-ii-gunmetal', 'HyperX', 'Gear', 79, 69, 35, 5, [['Drivers', '53mm Dynamic'], ['Sound', 'Hardware-Driven 7.1 Virtual Surround']]),
  p('HyperX Cloud III Wireless Headset DTS Headphone:X', 'hyperx-cloud-iii-wireless-headset', 'HyperX', 'Gear', 169, 149, 16, 5, [['Battery Life', 'Up to 120 Hours'], ['Audio', 'DTS Spatial Audio'], ['Drivers', '53mm Angled']]),
  p('Razer BlackShark V2 Pro Wireless Esports Headset', 'razer-blackshark-v2-pro-wireless', 'Razer', 'Gear', 199, 179, 15, 5, [['Mic', 'Razer HyperClear Super Wideband 32kHz'], ['Drivers', 'TriForce Titanium 50mm']]),
  p('Logitech G PRO X 2 LIGHTSPEED Wireless Headset', 'logitech-g-pro-x-2-lightspeed', 'Logitech', 'Gear', 249, 225, 12, 5, [['Drivers', '50mm Graphene Audio Drivers'], ['Battery', 'Up to 50 Hours'], ['DTS', 'DTS Headphone:X 2.0']]),
  p('SteelSeries Arctis Nova Pro Wireless Multi-System', 'steelseries-arctis-nova-pro-wireless', 'SteelSeries', 'Gear', 349, 319, 10, 5, [['ANC', '4-Mic Active Noise Cancelling'], ['Battery', 'Hot-Swappable Dual Battery System']]),
];

const importData = async () => {
  try {
    await connectDB();
    await Product.deleteMany();
    console.log('🗑️  Old hardware catalog wiped clean.');

    await Product.insertMany(catalog);
    console.log(`✅ Successfully seeded ${catalog.length} high-spec hardware components into database!`);
    process.exit();
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await connectDB();
    await Product.deleteMany();
    console.log('🗑️  All hardware products removed!');
    process.exit();
  } catch (error) {
    console.error('❌ Destroy failed:', error.message);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}