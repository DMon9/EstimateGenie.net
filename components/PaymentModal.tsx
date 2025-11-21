import React, { useState, useEffect } from 'react';
import { X, CreditCard, Lock, ShieldCheck, Loader2, CheckCircle2, Calendar, AlertCircle } from 'lucide-react';
import { SubscriptionTier } from '../types';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTier: SubscriptionTier | null;
  onPaymentComplete: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, selectedTier, onPaymentComplete }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [name, setName] = useState('');
  const [zip, setZip] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Reset state when opening
      setIsProcessing(false);
      setIsSuccess(false);
      setError(null);
      setCardNumber('');
      setExpiry('');
      setCvc('');
      setName('');
      setZip('');
    }
  }, [isOpen]);

  if (!isOpen || !selectedTier) return null;

  const price = selectedTier === 'pro' ? '$29.00' : '$99.00';
  const planName = selectedTier === 'pro' ? 'Pro Plan' : 'Business Plan';

  const formatCardNumber = (val: string) => {
    const v = val.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    }
    return v;
  };

  const formatExpiry = (val: string) => {
    const v = val.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
        return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic Validation
    if (cardNumber.length < 16) {
        setError("Please enter a valid card number.");
        return;
    }
    if (expiry.length < 5) {
        setError("Invalid expiry date.");
        return;
    }
    if (cvc.length < 3) {
        setError("Invalid CVC.");
        return;
    }

    setIsProcessing(true);

    // Simulate Payment Gateway API Call
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      setTimeout(() => {
        onPaymentComplete();
      }, 1500);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden relative">
        
        {/* Header */}
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
            <div className="flex items-center gap-2 text-slate-800">
                <Lock size={16} className="text-green-600" />
                <span className="font-semibold text-sm">Secure Checkout</span>
            </div>
            {!isSuccess && !isProcessing && (
                <button 
                    onClick={onClose}
                    className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 p-1 rounded-full transition-colors"
                >
                    <X size={20} />
                </button>
            )}
        </div>

        <div className="p-6 md:p-8">
            {isSuccess ? (
                <div className="text-center py-8 animate-in zoom-in-95 duration-300">
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 size={48} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Payment Successful!</h2>
                    <p className="text-slate-500">You have been upgraded to the {planName}.</p>
                </div>
            ) : (
                <>
                    {/* Order Summary */}
                    <div className="mb-8">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Order Summary</p>
                        <div className="flex justify-between items-end pb-4 border-b border-slate-100">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">{planName}</h3>
                                <p className="text-sm text-slate-500">Monthly Subscription</p>
                            </div>
                            <div className="text-2xl font-bold text-slate-900">{price}<span className="text-sm font-normal text-slate-500">/mo</span></div>
                        </div>
                    </div>

                    {/* Error Display */}
                    {error && (
                        <div className="mb-6 bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    {/* Payment Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">Card Information</label>
                            <div className="relative">
                                <input 
                                    type="text" 
                                    placeholder="0000 0000 0000 0000"
                                    value={cardNumber}
                                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-mono text-slate-700"
                                    maxLength={19}
                                />
                                <CreditCard className="absolute left-3 top-3.5 text-slate-400" size={18} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">Expiry Date</label>
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        placeholder="MM/YY"
                                        value={expiry}
                                        onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-mono text-slate-700"
                                        maxLength={5}
                                    />
                                    <Calendar className="absolute left-3 top-3.5 text-slate-400" size={18} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">CVC</label>
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        placeholder="123"
                                        value={cvc}
                                        onChange={(e) => setCvc(e.target.value.replace(/\D/g,''))}
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-mono text-slate-700"
                                        maxLength={4}
                                    />
                                    <Lock className="absolute left-3 top-3.5 text-slate-400" size={18} />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">Cardholder Name</label>
                            <input 
                                type="text" 
                                placeholder="John Doe"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-slate-700"
                            />
                        </div>
                        
                         <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">ZIP / Postal Code</label>
                            <input 
                                type="text" 
                                placeholder="10001"
                                value={zip}
                                onChange={(e) => setZip(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-slate-700"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isProcessing}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    Processing Payment...
                                </>
                            ) : (
                                <>
                                    Pay {price}
                                    <ShieldCheck size={18} />
                                </>
                            )}
                        </button>

                        <div className="flex justify-center gap-4 pt-2 opacity-50 grayscale">
                            <div className="h-6 w-10 bg-slate-200 rounded"></div>
                            <div className="h-6 w-10 bg-slate-200 rounded"></div>
                            <div className="h-6 w-10 bg-slate-200 rounded"></div>
                            <div className="h-6 w-10 bg-slate-200 rounded"></div>
                        </div>
                        <p className="text-center text-xs text-slate-400 mt-4">
                            Payments are processed securely by MockPayment. This is a demo application. No real money will be charged.
                        </p>
                    </form>
                </>
            )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;