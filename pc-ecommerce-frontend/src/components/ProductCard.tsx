import React from 'react';
import { ShoppingCart, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Product } from '../types';
import { useCart } from '../context/CartContext';

export const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const { addToCart } = useCart();
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;

  return (
    <div className="card bg-base-100 shadow-md hover:shadow-xl transition-all duration-300 border border-base-content/10 group flex flex-col justify-between rounded-2xl overflow-hidden">
      {/* 1. Clickable Image */}
      <Link to={`/product/${product.slug}`}>
        <figure className="relative pt-[70%] overflow-hidden bg-base-200">
          <img
            src={product.images?.[0] || 'https://via.placeholder.com/400'}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {hasDiscount && (
            <span className="badge badge-error absolute top-3 right-3 font-bold text-xs shadow">
              -${product.price - (product.discountPrice || 0)}
            </span>
          )}
        </figure>
      </Link>

      <div className="card-body p-4 gap-1 flex-1 flex flex-col justify-between">
        <div>
          <span className="text-[11px] uppercase font-bold tracking-wider text-primary">
            {product.brand}
          </span>

          {/* 2. Clickable Title */}
          <Link to={`/product/${product.slug}`} className="hover:text-primary transition-colors block">
            <h2 className="card-title text-sm line-clamp-2 leading-snug font-semibold min-h-[2.5rem]">
              {product.name}
            </h2>
          </Link>

          <div className="flex items-center gap-1 text-warning text-xs mt-1">
            <Star className="w-3.5 h-3.5 fill-warning" />
            <span className="font-bold">{(product.rating || 5.0).toFixed(1)}</span>
            <span className="text-base-content/50">({product.numReviews || 0})</span>
          </div>
        </div>

        <div className="mt-3 pt-2 border-t border-base-content/10 flex items-center justify-between">
          <div>
            <div className="text-lg font-black text-error">
              ${hasDiscount ? product.discountPrice : product.price}
            </div>
            {hasDiscount && (
              <div className="text-xs text-base-content/40 line-through leading-none">
                ${product.price}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => addToCart(product)}
            className="btn btn-primary btn-sm btn-circle shadow"
            title="Add to Cart"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;