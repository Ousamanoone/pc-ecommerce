import React, { useState } from 'react';
import {
  QrCode,
  Copy,
  Check,
  Download,
  X,
  ShieldCheck,
  AlertCircle,
  Building2,
  UserCheck,
  CreditCard,
  FileText,
} from 'lucide-react';

interface VietQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  totalUSD: number;
  onConfirmPaid?: () => void;
}

const BANK_CONFIG = {
  BANK_ID: 'MB',
  BANK_NAME: 'MBBank (Military Commercial Joint Stock Bank)',
  ACCOUNT_NO: '0988888888',
  ACCOUNT_NAME: 'GEARSTORE VIETNAM',
  EXCHANGE_RATE: 25400,
};

export const VietQRModal: React.FC<VietQRModalProps> = ({
  isOpen,
  onClose,
  orderId,
  totalUSD,
  onConfirmPaid,
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [hasNotifiedPaid, setHasNotifiedPaid] = useState<boolean>(false);

  if (!isOpen) return null;

  const amountVND = Math.round(totalUSD * BANK_CONFIG.EXCHANGE_RATE);
  const formattedVND = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amountVND);

  const transferContent = `GS ${orderId.slice(-8).toUpperCase()}`;

  const qrUrl = `https://img.vietqr.io/image/${BANK_CONFIG.BANK_ID}-${BANK_CONFIG.ACCOUNT_NO}-compact2.png?amount=${amountVND}&addInfo=${encodeURIComponent(
    transferContent
  )}&accountName=${encodeURIComponent(BANK_CONFIG.ACCOUNT_NAME)}`;

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handlePaidAction = () => {
    setHasNotifiedPaid(true);
    if (onConfirmPaid) onConfirmPaid();
  };

  return (
    <div className="modal modal-open z-50">
      <div className="modal-box max-w-lg rounded-3xl bg-base-100 border border-base-content/10 p-6 space-y-5 shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="btn btn-ghost btn-xs btn-circle absolute right-4 top-4 text-base-content/50 hover:text-base-content"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-base-content/10 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-primary text-primary-content flex items-center justify-center font-bold">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-lg text-base-content">VietQR Napas247 Transfer</h3>
              <span className="badge badge-success badge-xs font-bold text-white uppercase text-[9px]">
                Instant / Free
              </span>
            </div>
            <p className="text-xs text-base-content/60">
              Scan with any mobile banking app to initiate zero-fee instant wire transfer.
            </p>
          </div>
        </div>

        {/* QR Code Container */}
        <div className="flex flex-col items-center justify-center bg-white p-4 rounded-2xl border border-base-content/10 shadow-inner">
          <img
            src={qrUrl}
            alt="VietQR Payment Code"
            className="w-64 h-auto object-contain rounded-lg"
          />
          <span className="text-[10px] text-neutral-500 font-semibold mt-2 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-success" /> Secured Napas247 Payment Standard
          </span>
        </div>

        {/* Itemized Transfer Details */}
        <div className="bg-base-200/60 p-4 rounded-2xl border border-base-content/10 space-y-2.5 text-xs">
          {/* Bank */}
          <div className="flex items-center justify-between">
            <span className="text-base-content/60 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" /> Receiving Bank:
            </span>
            <span className="font-bold text-base-content">{BANK_CONFIG.BANK_NAME}</span>
          </div>

          {/* Account Number */}
          <div className="flex items-center justify-between">
            <span className="text-base-content/60 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5" /> Account Number:
            </span>
            <div className="flex items-center gap-2">
              <span className="font-mono font-black text-primary text-sm">
                {BANK_CONFIG.ACCOUNT_NO}
              </span>
              <button
                onClick={() => copyToClipboard(BANK_CONFIG.ACCOUNT_NO, 'account')}
                className="btn btn-ghost btn-xs btn-circle text-base-content/60 hover:text-primary"
                title="Copy Account Number"
              >
                {copiedField === 'account' ? (
                  <Check className="w-3.5 h-3.5 text-success" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* Beneficiary */}
          <div className="flex items-center justify-between">
            <span className="text-base-content/60 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5" /> Beneficiary Name:
            </span>
            <span className="font-bold text-base-content uppercase">
              {BANK_CONFIG.ACCOUNT_NAME}
            </span>
          </div>

          {/* Amount */}
          <div className="flex items-center justify-between pt-1 border-t border-base-content/5">
            <span className="text-base-content/60">Amount Payable:</span>
            <div className="text-right">
              <span className="font-mono font-black text-base text-success block">
                {formattedVND}
              </span>
              <span className="text-[10px] text-base-content/40 font-mono">
                (~ ${totalUSD} USD)
              </span>
            </div>
          </div>

          {/* Reference */}
          <div className="flex items-center justify-between pt-1 border-t border-base-content/5">
            <span className="text-base-content/60 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" /> Transfer Reference:
            </span>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-lg text-xs">
                {transferContent}
              </span>
              <button
                onClick={() => copyToClipboard(transferContent, 'content')}
                className="btn btn-ghost btn-xs btn-circle text-base-content/60 hover:text-primary"
                title="Copy Reference Code"
              >
                {copiedField === 'content' ? (
                  <Check className="w-3.5 h-3.5 text-success" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Notice */}
        <div className="p-3 bg-warning/10 border border-warning/20 rounded-2xl flex items-start gap-2.5 text-[11px] text-warning-content">
          <AlertCircle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Please retain the exact <strong>Transfer Reference ({transferContent})</strong> to ensure automatic order verification.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <a
            href={qrUrl}
            download={`VietQR_Order_${orderId.slice(-6)}.png`}
            target="_blank"
            rel="noreferrer"
            className="btn btn-ghost btn-sm rounded-xl text-xs font-bold gap-1 border border-base-content/15 flex-1"
          >
            <Download className="w-3.5 h-3.5" /> Download QR
          </a>

          <button
            onClick={handlePaidAction}
            disabled={hasNotifiedPaid}
            className={`btn btn-sm rounded-xl text-xs font-bold gap-1.5 flex-1 ${
              hasNotifiedPaid ? 'btn-success text-white' : 'btn-primary'
            }`}
          >
            {hasNotifiedPaid ? (
              <>
                <Check className="w-3.5 h-3.5" /> Transfer Confirmed
              </>
            ) : (
              'I Have Transferred'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VietQRModal;