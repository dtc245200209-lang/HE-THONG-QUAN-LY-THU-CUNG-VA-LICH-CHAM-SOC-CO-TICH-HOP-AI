'use client';

import React, { useState } from 'react';
import { 
  X, QrCode, Copy, Check, Download, ExternalLink, 
  Smartphone, ShieldCheck, CheckCircle2, AlertCircle, Info, RotateCw
} from 'lucide-react';
import { confirmOrderTransfer } from '@/lib/api/orders';

interface VietQRPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderCode?: string;
  amount: number;
  customerName?: string;
  onPaymentConfirmed?: () => void;
}

export const BANK_INFO = {
  bankId: 'BIDV',
  bankBin: '970418',
  bankName: 'BIDV - Ngân Hàng TMCP Đầu Tư & Phát Triển Việt Nam',
  branch: 'PGD Sông Công',
  accountNumber: '8814492663',
  accountName: 'TRAN THI DUNG',
  originalQrImage: '/payment-qr.png'
};

export default function VietQRPaymentModal({
  isOpen,
  onClose,
  orderCode = '',
  amount,
  customerName,
  onPaymentConfirmed
}: VietQRPaymentModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'dynamic' | 'original'>('dynamic');
  const [imgLoaded, setImgLoaded] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  if (!isOpen) return null;

  const memo = orderCode ? orderCode : 'PETCARE';
  const dynamicQrUrl = `https://img.vietqr.io/image/${BANK_INFO.bankId}-${BANK_INFO.accountNumber}-compact2.png?amount=${Math.round(amount)}&addInfo=${encodeURIComponent(memo)}&accountName=${encodeURIComponent(BANK_INFO.accountName)}`;

  const handleConfirmTransfer = async () => {
    if (!orderCode) {
      if (onPaymentConfirmed) onPaymentConfirmed();
      onClose();
      return;
    }
    setIsConfirming(true);
    try {
      await confirmOrderTransfer(orderCode);
    } catch (err) {
      console.error('Error confirming transfer:', err);
    } finally {
      setIsConfirming(false);
      if (onPaymentConfirmed) {
        onPaymentConfirmed();
      } else {
        onClose();
      }
    }
  };

  const formatVND = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => {
      setCopiedField(null);
    }, 2000);
  };

  const handleDownloadQr = () => {
    const url = activeTab === 'dynamic' ? dynamicQrUrl : BANK_INFO.originalQrImage;
    const link = document.createElement('a');
    link.href = url;
    link.download = `VietQR-BIDV-${orderCode || 'PetCare'}.png`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 p-4 text-white relative">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-xs">
              <QrCode className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg leading-tight">
                Thanh Toán Chuyển Khoản VietQR
              </h3>
              <p className="text-white/80 text-xs">
                Quét mã 24/7 bằng mọi ứng dụng Ngân hàng hoặc MoMo
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switcher: Dynamic QR vs Original BIDV Card */}
        <div className="px-5 pt-4 pb-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between gap-2">
          <div className="inline-flex p-1 rounded-xl bg-slate-200/70 text-xs font-bold w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setActiveTab('dynamic')}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg transition ${
                activeTab === 'dynamic'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Mã QR Đã Điền Số Tiền
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('original')}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg transition ${
                activeTab === 'original'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Ảnh Thẻ BIDV Gốc
            </button>
          </div>

          <button
            type="button"
            onClick={handleDownloadQr}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-white text-slate-700 text-xs font-bold transition shadow-2xs"
            title="Tải ảnh mã QR về máy"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Tải QR</span>
          </button>
        </div>

        <div className="p-4 sm:p-5 space-y-4 max-h-[calc(85vh-120px)] overflow-y-auto">
          {/* QR Display Card */}
          <div className="flex flex-col items-center justify-center p-4 bg-gradient-to-b from-slate-50 to-white rounded-2xl border-2 border-dashed border-emerald-300">
            <div className="relative bg-white p-2.5 rounded-2xl shadow-md border border-slate-100">
              {activeTab === 'dynamic' ? (
                <div className="relative">
                  <img
                    src={dynamicQrUrl}
                    alt="VietQR BIDV Payment"
                    className="w-56 h-auto sm:w-64 max-h-72 object-contain rounded-xl"
                    onError={(e) => {
                      // Fallback to original uploaded QR if VietQR service is unavailable
                      (e.currentTarget as HTMLImageElement).src = BANK_INFO.originalQrImage;
                    }}
                  />
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={BANK_INFO.originalQrImage}
                    alt="BIDV VietQR Card"
                    className="w-56 h-auto sm:w-64 max-h-72 object-contain rounded-xl"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Account Details Box with 1-click Copy */}
          <div className="space-y-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500 font-medium">Ngân hàng:</span>
              <span className="font-bold text-slate-800 text-right">
                BIDV ({BANK_INFO.branch})
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500 font-medium">Chủ tài khoản:</span>
              <span className="font-extrabold text-slate-900 tracking-wide">
                {BANK_INFO.accountName}
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500 font-medium">Số tài khoản:</span>
              <div className="flex items-center gap-1.5">
                <span className="font-mono font-black text-sm text-emerald-700">
                  {BANK_INFO.accountNumber}
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(BANK_INFO.accountNumber, 'stk')}
                  className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-[11px] font-bold flex items-center gap-1 transition"
                  title="Sao chép số tài khoản"
                >
                  {copiedField === 'stk' ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span className="text-emerald-700">Đã chép</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-slate-500" />
                      <span>Chép STK</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500 font-medium">Số tiền cần chuyển:</span>
              <div className="flex items-center gap-1.5">
                <span className="font-mono font-black text-sm text-rose-600">
                  {formatVND(amount)}
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(Math.round(amount).toString(), 'amount')}
                  className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-[11px] font-bold flex items-center gap-1 transition"
                  title="Sao chép số tiền"
                >
                  {copiedField === 'amount' ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span className="text-emerald-700">Đã chép</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-slate-500" />
                      <span>Chép số tiền</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-slate-500 font-medium">Nội dung chuyển:</span>
              <div className="flex items-center gap-1.5">
                <span className="font-mono font-black text-xs text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                  {memo}
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(memo, 'memo')}
                  className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-[11px] font-bold flex items-center gap-1 transition"
                  title="Sao chép nội dung chuyển khoản"
                >
                  {copiedField === 'memo' ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span className="text-emerald-700">Đã chép</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-slate-500" />
                      <span>Chép ND</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Important Notice */}
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs flex items-start gap-2 leading-relaxed">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong>Lưu ý:</strong> Vui lòng giữ nguyên nội dung chuyển khoản{' '}
              <strong className="text-indigo-800 font-mono">#{memo}</strong> để Lễ tân PetCare đối soát và duyệt đơn giao hàng cho bạn nhanh nhất.
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-white text-slate-700 font-bold text-xs transition"
          >
            Đóng
          </button>

          <button
            type="button"
            disabled={isConfirming}
            onClick={handleConfirmTransfer}
            className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isConfirming ? (
              <>
                <RotateCw className="w-4 h-4 animate-spin" />
                <span>Đang cập nhật chuẩn bị giao hàng...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Tôi Đã Chuyển Khoản Xong</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
