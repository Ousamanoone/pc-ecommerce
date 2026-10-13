import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  QrCode,
  Copy,
  Check,
  Clock,
  ShieldCheck,
  AlertCircle,
  X,
  Zap,
} from 'lucide-react';

interface PaymentQRModalProps {
  order: {
    _id: string;
    orderCode: string;
    totalPrice: number;
  };
  onSuccess: (updatedOrder: any) => void;
  onCancel: () => void;
}

export const PaymentQRModal: React.FC<PaymentQRModalProps> = ({
  order,
  onSuccess,
  onCancel,
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(15 * 60); // 15 minutes countdown
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const bankDetails = {
    bankName: 'MB Bank (Military Commercial Bank)',
    accountNumber: '0912345678',
    accountName: 'GEARSTORE TECHNOLOGY CO',
    transferContent: `GEARSTORE ${order.orderCode}`,
  };

  // VietQR Dynamic Generator URL
  const qrUrl = `https://img.vietqr.io/image/MB-${bankDetails.accountNumber}-compact2.png?amount=${order.totalPrice * 25000}&addInfo=${encodeURIComponent(
    bankDetails.transferContent
  )}&accountName=${encodeURIComponent(bankDetails.accountName)}`;

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleSimulatePayment = async () => {
    setIsVerifying(true);
    setError(null);
    try {
      const res = await api.put(`/orders/${order._id}/pay`);
      onSuccess(res.data.order || { ...order, isPaid: true });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to verify transaction.');
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-base-200 border border-base-content/10 rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl space-y-6 my-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-base-content/10 pb-4">
          <div className="space-y-0.5">
            <h3 className="text-base font-black text-base-content flex items-center gap-2">
              <QrCode className="w-5 h-5 text-primary" /> Instant QR Payment Gateway
            </h3>
            <p className="text-xs text-base-content/50">
              Scan via any mobile banking app to settle order <strong>{order.orderCode}</strong>
            </p>
          </div>
          <button onClick={onCancel} className="btn btn-ghost btn-xs btn-circle">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Countdown Alert */}
        <div className="p-3 bg-warning/10 border border-warning/20 rounded-2xl flex items-center justify-between text-xs font-bold text-warning">
          <span className="flex items-center gap-2">
            <Clock className="w-4 h-4" /> Awaiting Bank Settlement:
          </span>
          <span className="font-mono text-sm">{formatTime(timeLeft)}</span>
        </div>

        {/* Dynamic QR Display */}
        <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-base-100 rounded-2xl border border-base-content/10">
          <div className="w-44 h-44 bg-white p-2 rounded-2xl shadow-inner shrink-0 flex items-center justify-center border border-base-content/10">
            <img
              src={qrUrl}
              alt="VietQR Payment"
              className="w-full h-full object-contain"
            />
          </div>

          <div className="space-y-2 text-xs flex-1 min-w-0 w-full">
            <div className="space-y-0.5">
              <span className="text-[10px] text-base-content/50 uppercase font-bold block">
                Total Settled (USD)
              </span>
              <span className="text-2xl font-black text-primary font-mono">
                ${order.totalPrice.toFixed(2)}
              </span>
            </div>

            <div className="space-y-0.5">
              <span className="text-[10px] text-base-content/50 uppercase font-bold block">
                Beneficiary Bank
              </span>
              <span className="font-bold text-base-content block truncate">
                {bankDetails.bankName}
              </span>
            </div>
          </div>
        </div>

        {/* Manual Copy Field Checklist */}
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between p-2.5 bg-base-100 rounded-xl border border-base-content/5">
            <div>
              <span className="text-[10px] text-base-content/40 block uppercase">Account Number</span>
              <span className="font-mono font-bold text-base-content">{bankDetails.accountNumber}</span>
            </div>
            <button
              type="button"
              onClick={() => handleCopy(bankDetails.accountNumber, 'acc')}
              className="btn btn-ghost btn-xs font-bold gap-1 text-primary"
            >
              {copiedField === 'acc' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedField === 'acc' ? 'Copied' : 'Copy'}
            </button>
          </div>

          <div className="flex items-center justify-between p-2.5 bg-base-100 rounded-xl border border-base-content/5">
            <div>
              <span className="text-[10px] text-base-content/40 block uppercase">Transfer Syntax / Memo</span>
              <span className="font-mono font-bold text-base-content text-primary">
                {bankDetails.transferContent}
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleCopy(bankDetails.transferContent, 'memo')}
              className="btn btn-ghost btn-xs font-bold gap-1 text-primary"
            >
              {copiedField === 'memo' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedField === 'memo' ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>

        {error && (
          <div className="alert alert-error rounded-2xl text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2 pt-2 border-t border-base-content/10">
          <button
            type="button"
            disabled={isVerifying}
            onClick={handleSimulatePayment}
            className={`btn btn-primary w-full rounded-2xl font-black text-xs py-3 gap-2 shadow-lg shadow-primary/20 ${
              isVerifying ? 'loading' : ''
            }`}
          >
            <Zap className="w-4 h-4" /> Simulate Instant Bank Confirmation
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="btn btn-ghost btn-sm w-full rounded-xl text-xs font-bold text-base-content/60"
          >
            I will pay later via Track Order
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentQRModal;