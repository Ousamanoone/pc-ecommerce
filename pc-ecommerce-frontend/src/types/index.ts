export interface Banner {
  _id: string;
  title: string;
  imageUrl: string;
  linkUrl: string;
  position: 'hero_main' | 'promo_sub' | 'sidebar';
}

export interface ProductSpec {
  label: string;
  value: string;
}
export interface Product {
  _id: string;
  name: string;
  slug: string;
  brand: string;
  category: string;
  price: number;
  discountPrice?: number;
  stock: number;
  images: string[];
  description: string;
  specs?: ProductSpec[];
  rating?: number;
  numReviews?: number;
  createdAt?: string;
  updatedAt?: string;
}