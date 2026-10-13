import React, { useState, useEffect } from 'react';
import api from '../services/api';
import type { Banner } from '../types';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const DEFAULT_BANNERS: Banner[] = [
  {
    _id: '1',
    title: 'Next-Gen PC Builds with RTX 4090 OC',
    imageUrl: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=1600&q=80',
    linkUrl: '/products',
    position: 'hero_main',
  },
  {
    _id: '2',
    title: 'Ultimate Mechanical Keyboards & Custom Gear',
    imageUrl: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=1600&q=80',
    linkUrl: '/products',
    position: 'hero_main',
  },
];

export const HeroBannerSlider: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>(DEFAULT_BANNERS);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    api
      .get<Banner[]>('/banners?position=hero_main')
      .then((res) => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setBanners(res.data);
        }
      })
      .catch(() => {
        // Giữ banner mặc định nếu backend chưa chạy
      });
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  // Kiểm tra an toàn: nếu mảng rỗng hoặc phần tử hiện tại chưa có thì không render tránh crash
  const currentBanner = banners[current];
  if (!currentBanner) return null;

  return (
    <div className="relative w-full h-[340px] md:h-[420px] rounded-3xl overflow-hidden shadow-2xl border border-base-content/10 bg-base-300">
      <img
        src={currentBanner.imageUrl}
        alt={currentBanner.title}
        className="w-full h-full object-cover transition-all duration-700 brightness-[0.7]"
      />

      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent flex flex-col justify-center px-8 md:px-16 text-white max-w-xl">
        <span className="badge badge-primary font-bold text-xs uppercase mb-3">
          Special Promotion
        </span>
        <h1 className="text-3xl md:text-5xl font-black mb-6 leading-tight drop-shadow-md">
          {currentBanner.title}
        </h1>
        <Link to={currentBanner.linkUrl || '/products'} className="btn btn-primary w-fit gap-2 font-bold shadow-lg">
          Shop Now <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {banners.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              current === idx ? 'w-8 bg-primary' : 'w-2.5 bg-white/40 hover:bg-white/70'
            }`}
            aria-label={`Slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroBannerSlider;