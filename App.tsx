
import React, { useState } from 'react';
import { QuoteData, FileData, ProjectInputs, User, SubscriptionTier } from './types';
import { analyzeProject } from './services/geminiService';
import { sendQuoteEmail } from './services/emailService';
import ProjectInput from './components/ProjectInput';
import QuoteDisplay from './components/QuoteDisplay';
import Visualizer from './components/Visualizer';
import AuthModal from './components/AuthModal';
import PricingModal from './components/PricingModal';
import PaymentModal from './components/PaymentModal';
import UserProfile from './components/UserProfile';
import NotificationToast, { Notification } from './components/NotificationToast';
import { Hammer, X, UserCircle2, Zap, LogIn } from 'lucide-react';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [quoteData, setQuoteData] = useState<QuoteData | null>(null);
  const [visualizeStyle, setVisualizeStyle] = useState<string | null>(null);
  const [projectDescription, setProjectDescription] = useState<string>('');
  const [notification, setNotification] = useState<Notification | null>(null);

  // Authentication & Subscription State
  const [user, setUser] = useState<User | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  // Payment State
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [selectedTierForCheckout, setSelectedTierForCheckout] = useState<SubscriptionTier | null>(null);

  // Rehydrate user state from stored JWT on app load
  React.useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      fetch('/api/auth/user', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to authenticate');
          }
          return response.json();
        })
        .then(userData => {
          setUser(userData);
        })
        .catch(error => {
          console.error('Failed to rehydrate user:', error);
          localStorage.removeItem('authToken');
        });
    }
  }, []);

  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    setNotification({
      id: Date.now().toString(),
      message,
      type
    });
  };

  const handleAnalyze = async (fileData: FileData, inputs: ProjectInputs) => {
    setIsLoading(true);
    setProjectDescription(inputs.prompt);
    try {
      const data = await analyzeProject(fileData.base64, fileData.mimeType, inputs);
      setQuoteData(data);
      
      // Auto-send email if user is logged in
      if (user) {
        showNotification(`Generating email summary for ${user.email}...`, 'info');
        await sendQuoteEmail(user.email, data);
        showNotification(`Estimate summary sent to ${user.email}`, 'success');
      }
    } catch (error) {
      console.error("Analysis failed:", error);
      showNotification("Analysis failed. Please check your API key configuration and try again.", 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailQuote = async () => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }
    if (!quoteData) return;

    try {
      showNotification("Sending email...", 'info');
      await sendQuoteEmail(user.email, quoteData);
      showNotification(`Quote sent to ${user.email}`, 'success');
    } catch (err) {
      showNotification("Failed to send email.", 'error');
    }
  };

  const handlePdfDownloadRequest = async (): Promise<boolean> => {
    if (!user) {
        setIsAuthOpen(true);
        return false;
    }

    // If Pro or Business, always allow
    if (user.tier !== 'free') {
        showNotification('Generating PDF...', 'info');
        return true;
    }

    // If Free, check limit
    if (user.pdfDownloads >= 3) {
      setIsPricingOpen(true);
      showNotification('You have reached your free PDF download limit. Upgrade to Pro for unlimited downloads.', 'error');
      return false;
    }

    // Allow and increment count
    const updatedUser = { ...user, pdfDownloads: user.pdfDownloads + 1 };
    setUser(updatedUser);
    
    const remaining = 3 - updatedUser.pdfDownloads;
    showNotification(`Downloading PDF... (${remaining} free download${remaining !== 1 ? 's' : ''} remaining)`, 'success');
    return true;
  };

  const handleLogin = (loggedInUser: User, token: string) => {
    setUser(loggedInUser);
    localStorage.setItem('authToken', token);
    showNotification(`Welcome back, ${loggedInUser.name}!`, 'success');
  };

  // Called when user selects a tier in PricingModal
  const handleTierSelection = (tier: SubscriptionTier) => {
    if (!user) {
        // Force login if they try to buy without an account
        setIsPricingOpen(false);
        setIsAuthOpen(true);
        return;
    }

    if (tier === 'free') {
        // Downgrade logic would go here
        return; 
    }

    // Move to payment flow
    setSelectedTierForCheckout(tier);
    setIsPricingOpen(false);
    setIsPaymentOpen(true);
  };

  // Called when PaymentModal completes successfully
  const handlePaymentSuccess = (tier: SubscriptionTier) => {
    if (user) {
        setUser({ ...user, tier });
        setIsPaymentOpen(false);
        setSelectedTierForCheckout(null);
        showNotification(`Upgraded to ${tier} plan!`, 'success');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setQuoteData(null);
    localStorage.removeItem('authToken');
    showNotification('Signed out successfully', 'info');
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setQuoteData(null)}>
                <div className="bg-blue-600 p-2 rounded-lg text-white">
                    <Hammer size={20} />
                </div>
                <span className="text-xl font-bold text-slate-900 tracking-tight hidden sm:inline">Estimate Genie</span>
                <span className="text-xl font-bold text-slate-900 tracking-tight sm:hidden">Genie</span>
            </div>
            <div className="flex items-center gap-3 md:gap-6">
                 <div className="hidden md:block text-sm text-slate-500 font-medium">
                    Gemini 3 Pro Powered
                </div>
                
                <div className="flex items-center gap-3">
                    {(!user || user.tier === 'free') && (
                        <button 
                            onClick={() => setIsPricingOpen(true)}
                            className="hidden md:flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 transition-all"
                        >
                            <Zap size={16} fill="currentColor" />
                            Upgrade to Pro
                        </button>
                    )}

                    {user ? (
                        <button 
                            onClick={() => setIsProfileOpen(true)}
                            className="flex items-center gap-2 hover:bg-slate-100 py-1 px-2 rounded-full transition-colors"
                        >
                            <div className="w-8 h-8 bg-slate-200 rounded-full overflow-hidden border border-slate-300">
                                {user.avatar ? (
                                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                ) : (
                                    <UserCircle2 className="w-full h-full text-slate-400" />
                                )}
                            </div>
                            <span className="font-medium text-slate-700 hidden md:block">{user.name}</span>
                        </button>
                    ) : (
                        <button 
                            onClick={() => setIsAuthOpen(true)}
                            className="flex items-center gap-2 text-slate-600 font-medium hover:text-blue-600 transition-colors"
                        >
                            <LogIn size={20} />
                            Sign In
                        </button>
                    )}
                </div>
            </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* Header / Hero (Only show if no data) */}
        {!quoteData && (
            <div className="text-center py-10">
                <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
                    AI Construction <span className="text-blue-600">Estimates & Vision</span>
                </h1>
                <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                    Upload a photo of your space. Get detailed costs, phased schedules, and photorealistic visualizations in seconds.
                </p>
            </div>
        )}

        {/* Input Section */}
        {!quoteData && (
             <div className="max-w-3xl mx-auto">
                <ProjectInput 
                    onAnalyze={handleAnalyze} 
                    isLoading={isLoading}
                    userTier={user?.tier || 'free'}
                    onUpgradeRequest={() => setIsPricingOpen(true)}
                />
             </div>
        )}

        {/* Results Section */}
        {quoteData && (
            <>
                <div className="flex justify-between items-center">
                    <button 
                        onClick={() => setQuoteData(null)}
                        className="text-slate-500 hover:text-blue-600 font-medium flex items-center gap-1 transition-colors"
                    >
                        ← Start New Estimate
                    </button>
                </div>
                <QuoteDisplay 
                    data={quoteData} 
                    onVisualizeRequest={(style) => setVisualizeStyle(style)}
                    onEmailRequest={handleEmailQuote}
                    onPdfDownloadRequest={handlePdfDownloadRequest}
                />
            </>
        )}
      </main>

      {/* Visualization Modal */}
      {visualizeStyle && quoteData && (
        <div className="relative z-50">
            <button 
                onClick={() => setVisualizeStyle(null)}
                className="fixed top-4 right-4 z-[60] bg-white/10 hover:bg-white/20 text-white p-2 rounded-full backdrop-blur-md transition-all"
            >
                <X size={24} />
            </button>
            <Visualizer 
                initialPrompt={visualizeStyle} 
                projectDescription={projectDescription}
                userTier={user?.tier || 'free'}
                onUpgradeRequest={() => setIsPricingOpen(true)}
            />
        </div>
      )}

      {/* Modals */}
      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        onLogin={handleLogin}
        onError={(error) => showNotification(error, 'error')}
      />
      <PricingModal 
        isOpen={isPricingOpen} 
        onClose={() => setIsPricingOpen(false)}
        currentTier={user?.tier || 'free'}
        onSelectTier={handleTierSelection}
      />
      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        selectedTier={selectedTierForCheckout}
        onPaymentComplete={handlePaymentSuccess}
        onError={(error) => showNotification(error, 'error')}
      />
      {user && (
        <UserProfile
            isOpen={isProfileOpen}
            onClose={() => setIsProfileOpen(false)}
            user={user}
            onLogout={handleLogout}
            onManageSubscription={() => setIsPricingOpen(true)}
        />
      )}
      
      {/* Notifications */}
      {notification && (
        <NotificationToast 
          notification={notification} 
          onClose={() => setNotification(null)} 
        />
      )}
    </div>
  );
};

export default App;