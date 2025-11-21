
import React from 'react';
import { X, User as UserIcon, CreditCard, Shield, LogOut } from 'lucide-react';
import { User } from '../types';

interface UserProfileProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onLogout: () => void;
  onManageSubscription: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ isOpen, onClose, user, onLogout, onManageSubscription }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1 rounded-full transition-colors"
        >
          <X size={20} />
        </button>

        <div className="p-6">
          <div className="flex flex-col items-center mb-6">
            <div className="w-24 h-24 bg-slate-100 rounded-full mb-4 border-4 border-white shadow-lg overflow-hidden">
                {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <UserIcon size={40} />
                    </div>
                )}
            </div>
            <h2 className="text-xl font-bold text-slate-900">{user.name}</h2>
            <p className="text-slate-500">{user.email}</p>
            <div className="mt-2 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wide rounded-full border border-blue-100">
                {user.tier} Member
            </div>
          </div>

          <div className="space-y-2">
            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex items-center gap-4">
                <div className="bg-white p-2 rounded-lg shadow-sm text-slate-600">
                    <Shield size={20} />
                </div>
                <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">Member Since</p>
                    <p className="text-xs text-slate-500">{user.joinedDate}</p>
                </div>
            </div>
            
            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="bg-white p-2 rounded-lg shadow-sm text-slate-600">
                        <CreditCard size={20} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-900">Subscription</p>
                        <p className="text-xs text-slate-500 capitalize">{user.tier} Plan</p>
                    </div>
                </div>
                <button 
                    onClick={() => { onClose(); onManageSubscription(); }}
                    className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
                >
                    {user.tier === 'free' ? 'Upgrade' : 'Manage'}
                </button>
            </div>
          </div>

          <button
            onClick={() => { onClose(); onLogout(); }}
            className="w-full mt-8 py-3 border border-red-100 text-red-600 hover:bg-red-50 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
