import React, { useState, useEffect } from 'react';
import { X, Lock, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { SubscriptionTier } from '../types';

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTier: SubscriptionTier | null;
  onPaymentComplete: (tier: SubscriptionTier) => void;
  onError: (message: string) => void;
}

const CheckoutForm: React.FC<{
  selectedTier: SubscriptionTier;
  onPaymentComplete: (tier: SubscriptionTier) => void;
  onError: (message: string) => void;
}> = ({ selectedTier, onPaymentComplete, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const price = selectedTier === 'pro' ? '$29.00' : '$99.00';
  const planName = selectedTier === 'pro' ? 'Pro Plan' : 'Business Plan';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('You must be logged in to make a payment');
      }

      const response = await fetch('/api/stripe/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ tier: selectedTier }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create payment');
      }

      const { clientSecret } = await response.json();

      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement as any,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (paymentIntent.status === 'succeeded') {
        const token = localStorage.getItem('authToken');
        if (token) {
          const confirmResponse = await fetch('/api/stripe/confirm-upgrade', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              paymentIntentId: paymentIntent.id,
            }),
          });

          if (!confirmResponse.ok) {
            const errorData = await confirmResponse.json();
            throw new Error(errorData.error || 'Failed to confirm upgrade');
          }

          const confirmData = await confirmResponse.json();
          
          setIsSuccess(true);
          setTimeout(() => {
            onPaymentComplete(confirmData.user.tier);
          }, 1500);
        }
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      onError(error.message || 'Payment failed. Please try again.');
      setIsProcessing(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center py-8 animate-in zoom-in-95 duration-300">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={48} />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Payment Successful!</h2>
        <p className="text-slate-500">You have been upgraded to the {planName}.</p>
      </div>
    );
  }

  return (
    <>
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

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">Card Information</label>
          <div className="p-4 rounded-xl border border-slate-200 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#334155',
                    '::placeholder': {
                      color: '#94a3b8',
                    },
                  },
                },
              }}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={!stripe || isProcessing}
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
              <Lock size={18} />
            </>
          )}
        </button>

        <div className="flex justify-center gap-4 pt-2">
          <img src="https://js.stripe.com/v3/fingerprinted/img/visa-729c05c240c4bdb47b03ac81d9945bfe.svg" alt="Visa" className="h-6" />
          <img src="https://js.stripe.com/v3/fingerprinted/img/mastercard-4d8844094130711885b5e41b28c9848f.svg" alt="Mastercard" className="h-6" />
          <img src="https://js.stripe.com/v3/fingerprinted/img/amex-a49b82f46c5cd6a96a6e418a6ca1717c.svg" alt="Amex" className="h-6" />
        </div>
        <p className="text-center text-xs text-slate-400 mt-4">
          Powered by Stripe. Use test card: 4242 4242 4242 4242
        </p>
      </form>
    </>
  );
};

const PaymentModal: React.FC<PaymentModalProps> = ({ 
  isOpen, 
  onClose, 
  selectedTier, 
  onPaymentComplete,
  onError 
}) => {
  if (!isOpen || !selectedTier) return null;

  if (!stripePromise) {
    return (
      <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden relative p-8">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
          <div className="text-center py-8">
            <AlertCircle size={48} className="text-amber-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Payment Configuration Required</h2>
            <p className="text-slate-600 mb-4">
              Stripe payment processing is not configured. Please add your Stripe publishable key as VITE_STRIPE_PUBLISHABLE_KEY environment variable.
            </p>
            <button 
              onClick={onClose}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden relative">
        
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
          <div className="flex items-center gap-2 text-slate-800">
            <Lock size={16} className="text-green-600" />
            <span className="font-semibold text-sm">Secure Checkout</span>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 p-1 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 md:p-8">
          <Elements stripe={stripePromise}>
            <CheckoutForm 
              selectedTier={selectedTier}
              onPaymentComplete={onPaymentComplete}
              onError={onError}
            />
          </Elements>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
