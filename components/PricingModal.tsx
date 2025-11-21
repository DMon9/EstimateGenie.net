import React from 'react';
import { X, Check, Star, Zap, Building2 } from 'lucide-react';
import { SubscriptionTier } from '../types';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTier: SubscriptionTier;
  onSelectTier: (tier: SubscriptionTier) => void;
}

const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onClose, currentTier, onSelectTier }) => {
  if (!isOpen) return null;

  const tiers = [
    {
      id: 'free' as SubscriptionTier,
      name: 'Starter',
      price: '$0',
      period: '/mo',
      icon: Star,
      color: 'bg-slate-100 text-slate-900',
      buttonColor: 'bg-slate-200 text-slate-700 hover:bg-slate-300',
      features: [
        'Basic AI Cost Estimates',
        '1K Visualization Quality',
        'Standard Style Options',
        'Timeline Overview'
      ]
    },
    {
      id: 'pro' as SubscriptionTier,
      name: 'Pro',
      price: '$29',
      period: '/mo',
      icon: Zap,
      popular: true,
      color: 'bg-blue-600 text-white',
      buttonColor: 'bg-white text-blue-600 hover:bg-blue-50',
      features: [
        'Everything in Starter',
        'Detailed Labor & Materials Input',
        '4K Ultra-HD Visualizations',
        'AI Image Editor (Refine Renders)',
        'Detailed Phase Cost Breakdown',
        'Priority Processing'
      ]
    },
    {
      id: 'business' as SubscriptionTier,
      name: 'Business',
      price: '$99',
      period: '/mo',
      icon: Building2,
      color: 'bg-slate-900 text-white',
      buttonColor: 'bg-white text-slate-900 hover:bg-slate-100',
      features: [
        'Everything in Pro',
        'PDF Quote Export (Coming Soon)',
        'Client Management Dashboard',
        'API Access',
        'Dedicated Support',
        'Team Collaboration'
      ]
    }
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden relative my-8">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1 rounded-full transition-colors z-10"
        >
          <X size={24} />
        </button>

        <div className="p-8 md:p-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Upgrade Your Estimating Power
            </h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              Choose the perfect plan to unlock professional features, higher quality renders, and detailed breakdowns.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tiers.map((tier) => {
              const Icon = tier.icon;
              const isCurrent = currentTier === tier.id;
              const isPro = tier.id === 'pro';

              return (
                <div 
                  key={tier.id} 
                  className={`relative rounded-2xl border ${isPro ? 'border-blue-500 shadow-xl shadow-blue-500/10 scale-105 z-10' : 'border-slate-200 shadow-sm'} flex flex-col transition-transform duration-300`}
                >
                  {tier.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold uppercase tracking-wider py-1.5 px-4 rounded-full shadow-md">
                      Most Popular
                    </div>
                  )}

                  <div className={`p-6 rounded-t-2xl ${tier.id !== 'free' ? tier.color : 'bg-slate-50'}`}>
                    <div className="flex justify-between items-start mb-4">
                        <div className={`p-3 rounded-xl ${tier.id === 'free' ? 'bg-white text-slate-700 shadow-sm' : 'bg-white/20 text-white'}`}>
                            <Icon size={24} />
                        </div>
                        {isCurrent && (
                            <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border border-white/30">
                                Current Plan
                            </span>
                        )}
                    </div>
                    <h3 className={`text-xl font-bold ${tier.id === 'free' ? 'text-slate-900' : 'text-white'}`}>{tier.name}</h3>
                    <div className={`flex items-baseline gap-1 mt-2 ${tier.id === 'free' ? 'text-slate-900' : 'text-white'}`}>
                        <span className="text-4xl font-bold">{tier.price}</span>
                        <span className="opacity-80">{tier.period}</span>
                    </div>
                  </div>

                  <div className="p-6 bg-white flex-1 flex flex-col rounded-b-2xl">
                    <ul className="space-y-4 mb-8 flex-1">
                      {tier.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-slate-600 text-sm">
                          <Check size={18} className={`flex-shrink-0 ${isPro ? 'text-blue-600' : 'text-green-500'}`} />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => {
                          if (!isCurrent) {
                              onSelectTier(tier.id);
                          }
                      }}
                      disabled={isCurrent}
                      className={`w-full py-3 rounded-xl font-bold transition-all ${
                        isCurrent 
                            ? 'bg-slate-100 text-slate-400 cursor-default' 
                            : tier.buttonColor
                      } ${!isCurrent && 'shadow-lg hover:shadow-xl hover:-translate-y-1'}`}
                    >
                      {isCurrent ? 'Current Plan' : `Upgrade to ${tier.name}`}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingModal;