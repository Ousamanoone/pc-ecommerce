import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import VietQRModal from "../../components/VietQRModal";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Truck,
  Check,
  AlertCircle,
  Tag,
  Package,
} from "lucide-react";

export const CartPage: React.FC = () => {
  const cartCtx = useCart() as any;
  // Lấy dữ liệu an toàn từ bất kỳ biến nào có trong context
  const cartItems: any[] =
    cartCtx.cartItems || cartCtx.cart || cartCtx.items || [];
  const { updateQuantity, removeFromCart, clearCart } = cartCtx;
  const cartTotal: number = cartCtx.cartTotal ?? cartCtx.total ?? 0;
  const { user } = useAuth();
  const navigate = useNavigate();

  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.name || "",
    phone: "",
    address: "",
    city: "Ho Chi Minh City",
    note: "",
  });

  const [paymentMethod, setPaymentMethod] = useState<"COD" | "Bank Transfer">(
    "Bank Transfer",
  );
  const [couponCode, setCouponCode] = useState<string>("");
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [couponError, setCouponError] = useState<string>("");
  const [loadingOrder, setLoadingOrder] = useState<boolean>(false);

  const [qrModalData, setQrModalData] = useState<{
    isOpen: boolean;
    orderId: string;
    totalUSD: number;
  }>({
    isOpen: false,
    orderId: "",
    totalUSD: 0,
  });

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setCouponError("");
    try {
      const res = await api.post("/coupons/apply", { code: couponCode.trim() });
      if (res.data) {
        const discountVal = res.data.discountPercent
          ? (cartTotal * res.data.discountPercent) / 100
          : res.data.discountAmount || 0;
        setAppliedDiscount(Math.min(discountVal, cartTotal));
      }
    } catch (err: any) {
      setCouponError(
        err.response?.data?.message || "Invalid or expired voucher coupon.",
      );
      setAppliedDiscount(0);
    }
  };

  const finalTotal = Math.max(0, cartTotal - appliedDiscount);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cartItems || cartItems.length === 0) return;

    if (
      !shippingAddress.fullName ||
      !shippingAddress.phone ||
      !shippingAddress.address
    ) {
      alert(
        "Please provide your full recipient name, contact phone number, and street address.",
      );
      return;
    }

    setLoadingOrder(true);
    try {
      const orderData = {
        orderItems: cartItems.map((item: any) => ({
          product: item._id,
          name: item.name,
          image: item.images?.[0] || "",
          price: item.discountPrice || item.price,
          qty: item.qty,
        })),
        shippingAddress,
        paymentMethod,
        itemsPrice: cartTotal,
        discountPrice: appliedDiscount,
        totalPrice: finalTotal,
      };

      const res = await api.post("/orders", orderData);
      const createdOrder = res.data;

      if (typeof clearCart === "function") {
        clearCart();
      }

      if (paymentMethod === "Bank Transfer") {
        setQrModalData({
          isOpen: true,
          orderId: createdOrder._id,
          totalUSD: finalTotal,
        });
      } else {
        navigate(`/track-order?orderId=${createdOrder._id}`);
      }
    } catch (err: any) {
      console.error("Failed to create order:", err);
      alert(
        err.response?.data?.message ||
          "Order checkout failed. Please re-check connection.",
      );
    } finally {
      setLoadingOrder(false);
    }
  };

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="py-20 text-center max-w-md mx-auto space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-base-200 border border-base-content/10 flex items-center justify-center mx-auto text-base-content/30">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-base-content">
          Your Cart is Currently Empty
        </h2>
        <p className="text-xs text-base-content/60 leading-relaxed">
          No components have been queued for purchase yet. Browse our hardware
          stock or configure an entire workstation in PC Builder.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link
            to="/products"
            className="btn btn-primary btn-sm rounded-xl font-bold text-xs gap-1.5"
          >
            Browse Products
          </Link>
          <Link
            to="/builder"
            className="btn btn-ghost btn-sm rounded-xl font-bold text-xs border border-base-content/15"
          >
            PC Builder
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-4">
      <div className="border-b border-base-content/10 pb-4">
        <h1 className="text-2xl font-black text-base-content flex items-center gap-2">
          <ShoppingBag className="w-6 h-6 text-primary" /> Shopping Cart & Order
          Checkout
        </h1>
        <p className="text-xs text-base-content/60 mt-0.5">
          Verify itemized hardware quantities, specify destination address, and
          choose your payment gateway.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: SHOPPING BAG ITEMS */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-base-200 border border-base-content/10 rounded-3xl overflow-hidden divide-y divide-base-content/5">
            <div className="p-4 flex items-center justify-between text-xs text-base-content/60 font-bold uppercase tracking-wider">
              <span>Cart Line Items ({cartItems.length})</span>
              <button
                onClick={clearCart}
                className="text-error hover:underline text-[11px] normal-case font-semibold"
              >
                Clear Cart
              </button>
            </div>

            {cartItems.map((item: any) => {
              const effPrice = item.discountPrice || item.price;

              return (
                <div
                  key={item._id}
                  className="p-4 flex items-center gap-3 hover:bg-base-100/40 transition-colors"
                >
                  <img
                    src={item.images?.[0] || "https://via.placeholder.com/60"}
                    alt={item.name}
                    className="w-14 h-14 object-contain rounded-xl bg-base-100 p-1 border border-base-content/5 shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/product/${item.slug}`}
                      className="font-bold text-xs text-base-content hover:text-primary transition-colors line-clamp-1"
                    >
                      {item.name}
                    </Link>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="badge badge-primary badge-xs font-bold text-[9px] uppercase">
                        {item.category}
                      </span>
                      <span className="text-[10px] text-base-content/50 uppercase font-semibold">
                        {item.brand}
                      </span>
                    </div>
                    <span className="font-mono font-black text-xs text-primary block mt-1">
                      ${effPrice}
                    </span>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-1 bg-base-100 p-1 rounded-xl border border-base-content/10 shrink-0">
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(item._id, Math.max(1, item.qty - 1))
                      }
                      className="btn btn-ghost btn-xs btn-circle text-base-content/60"
                    >
                      <Minus className="w-3 h-3" />
                    </button>

                    <span className="font-mono font-bold text-xs px-1.5">
                      {item.qty}
                    </span>

                    <button
                      type="button"
                      disabled={
                        item.stock !== undefined && item.qty >= item.stock
                      }
                      onClick={() => {
                        if (
                          item.stock !== undefined &&
                          item.qty >= item.stock
                        ) {
                          alert(
                            `Maximum available stock reached (${item.stock} units).`,
                          );
                          return;
                        }
                        updateQuantity(item._id, item.qty + 1);
                      }}
                      className="btn btn-ghost btn-xs btn-circle text-base-content/60 disabled:opacity-30"
                      title={
                        item.stock !== undefined && item.qty >= item.stock
                          ? "Max stock reached"
                          : "Increase quantity"
                      }
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Remove Part */}
                  <button
                    onClick={() => removeFromCart(item._id)}
                    className="btn btn-ghost btn-xs btn-circle text-error/70 hover:text-error hover:bg-error/10 shrink-0"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Coupon Code Section */}
          <div className="p-4 bg-base-200 border border-base-content/10 rounded-3xl space-y-2">
            <span className="text-xs font-bold text-base-content flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-primary" /> Promotional Voucher /
              Discount Code
            </span>
            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <input
                type="text"
                placeholder="Enter coupon code (e.g. GEARSTORE)..."
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                className="input input-bordered input-sm rounded-xl flex-1 text-xs bg-base-100 font-mono"
              />
              <button
                type="submit"
                className="btn btn-primary btn-sm rounded-xl text-xs font-bold px-4"
              >
                Apply
              </button>
            </form>
            {couponError && (
              <p className="text-[11px] text-error flex items-center gap-1 font-semibold">
                <AlertCircle className="w-3 h-3" /> {couponError}
              </p>
            )}
            {appliedDiscount > 0 && (
              <p className="text-[11px] text-success flex items-center gap-1 font-semibold">
                <Check className="w-3 h-3" /> Voucher applied successfully: -$
                {appliedDiscount}
              </p>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: SHIPPING ADDRESS & PAYMENT SELECTION */}
        <div className="lg:col-span-5 space-y-4">
          <form
            onSubmit={handleCheckout}
            className="bg-base-200 border border-base-content/10 rounded-3xl p-5 space-y-4 shadow-sm"
          >
            <h3 className="font-black text-sm text-base-content border-b border-base-content/10 pb-3 flex items-center gap-2">
              <Truck className="w-4 h-4 text-primary" /> Shipping & Delivery
              Information
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-base-content/70 mb-1">
                  Recipient Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={shippingAddress.fullName}
                  onChange={(e) =>
                    setShippingAddress({
                      ...shippingAddress,
                      fullName: e.target.value,
                    })
                  }
                  className="input input-bordered input-sm rounded-xl w-full text-xs bg-base-100"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-base-content/70 mb-1">
                  Contact Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+84 912 345 678"
                  value={shippingAddress.phone}
                  onChange={(e) =>
                    setShippingAddress({
                      ...shippingAddress,
                      phone: e.target.value,
                    })
                  }
                  className="input input-bordered input-sm rounded-xl w-full text-xs bg-base-100"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-base-content/70 mb-1">
                  Detailed Street Address *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Street 123, Ward / District..."
                  value={shippingAddress.address}
                  onChange={(e) =>
                    setShippingAddress({
                      ...shippingAddress,
                      address: e.target.value,
                    })
                  }
                  className="input input-bordered input-sm rounded-xl w-full text-xs bg-base-100"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-base-content/70 mb-1">
                  City / Province
                </label>
                <select
                  value={shippingAddress.city}
                  onChange={(e) =>
                    setShippingAddress({
                      ...shippingAddress,
                      city: e.target.value,
                    })
                  }
                  className="select select-bordered select-sm rounded-xl w-full text-xs bg-base-100"
                >
                  <option value="Ho Chi Minh City">Ho Chi Minh City</option>
                  <option value="Hanoi">Hanoi</option>
                  <option value="Da Nang">Da Nang</option>
                  <option value="Can Tho">Can Tho</option>
                  <option value="Hai Phong">Hai Phong</option>
                  <option value="Other">Other Province</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-base-content/70 mb-1">
                  Order Delivery Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Special instructions (e.g. call before delivery, fragile packing)..."
                  value={shippingAddress.note}
                  onChange={(e) =>
                    setShippingAddress({
                      ...shippingAddress,
                      note: e.target.value,
                    })
                  }
                  className="textarea textarea-bordered rounded-xl w-full text-xs bg-base-100"
                />
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="pt-2 border-t border-base-content/10 space-y-2">
              <label className="block text-[11px] font-bold text-base-content/70">
                Payment Method *
              </label>

              <div className="grid grid-cols-1 gap-2">
                <label
                  className={`p-3 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                    paymentMethod === "Bank Transfer"
                      ? "border-primary bg-primary/10"
                      : "border-base-content/10 bg-base-100"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="Bank Transfer"
                      checked={paymentMethod === "Bank Transfer"}
                      onChange={() => setPaymentMethod("Bank Transfer")}
                      className="radio radio-primary radio-xs"
                    />
                    <div>
                      <span className="font-bold text-xs text-base-content block">
                        VietQR Napas247 Instant Transfer
                      </span>
                      <span className="text-[10px] text-base-content/50">
                        Zero-fee dynamic QR scan via any banking app
                      </span>
                    </div>
                  </div>
                  <span className="badge badge-success badge-xs font-bold text-white uppercase text-[8px]">
                    Recommended
                  </span>
                </label>

                <label
                  className={`p-3 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                    paymentMethod === "COD"
                      ? "border-primary bg-primary/10"
                      : "border-base-content/10 bg-base-100"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="COD"
                      checked={paymentMethod === "COD"}
                      onChange={() => setPaymentMethod("COD")}
                      className="radio radio-primary radio-xs"
                    />
                    <div>
                      <span className="font-bold text-xs text-base-content block">
                        Cash on Delivery (COD)
                      </span>
                      <span className="text-[10px] text-base-content/50">
                        Inspect hardware and pay in cash to carrier
                      </span>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Cost Breakdown */}
            <div className="pt-3 border-t border-base-content/10 space-y-1.5 text-xs">
              <div className="flex justify-between text-base-content/70">
                <span>Hardware Subtotal:</span>
                <span className="font-mono font-bold">${cartTotal}</span>
              </div>

              {appliedDiscount > 0 && (
                <div className="flex justify-between text-success">
                  <span>Voucher Savings:</span>
                  <span className="font-mono font-bold">
                    -${appliedDiscount}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-base-content/70">
                <span>Shipping Freight:</span>
                <span className="text-success font-bold">FREE</span>
              </div>

              <div className="flex justify-between items-baseline pt-2 border-t border-base-content/10 text-base font-black text-base-content">
                <span>Grand Total:</span>
                <span className="font-mono text-primary text-xl">
                  ${finalTotal}
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loadingOrder}
              className="btn btn-primary btn-block rounded-2xl font-black text-xs gap-2 shadow-lg shadow-primary/20"
            >
              {loadingOrder ? (
                <span className="loading loading-spinner loading-xs"></span>
              ) : (
                <>
                  <span>Place Order & Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* VIETQR NAPAS247 MODAL */}
      <VietQRModal
        isOpen={qrModalData.isOpen}
        orderId={qrModalData.orderId}
        totalUSD={qrModalData.totalUSD}
        onClose={() => {
          setQrModalData((prev) => ({ ...prev, isOpen: false }));
          navigate(`/track-order?orderId=${qrModalData.orderId}`);
        }}
        onConfirmPaid={() => {
          setTimeout(() => {
            setQrModalData((prev) => ({ ...prev, isOpen: false }));
            navigate(`/track-order?orderId=${qrModalData.orderId}`);
          }, 1500);
        }}
      />
    </div>
  );
};

export default CartPage;
