
import React, { useState, useEffect } from 'react';
import { ImageSize, SubscriptionTier } from '../types';
import { generateVisualization, editVisualization, generateProjectVideo } from '../services/geminiService';
import { Loader2, Wand2, Download, Sparkles, ChevronDown, Lock, Video, Play, AlertCircle, RefreshCw, Check, X } from 'lucide-react';

interface VisualizerProps {
  initialPrompt: string; // This acts as the style
  projectDescription: string;
  userTier: SubscriptionTier;
  onUpgradeRequest: () => void;
}

const STYLES = [
  "Modern", "Minimalist", "Rustic", "Industrial", 
  "Scandinavian", "Mid-Century Modern", "Traditional", 
  "Bohemian", "Farmhouse", "Contemporary"
];

const TIPS = [
    "Try different styles to see how materials change the room's feeling.",
    "Higher resolutions take a bit longer but reveal amazing details.",
    "The AI Editor can adjust lighting, change colors, or add furniture.",
    "Veo videos create a cinematic tour of your envisioned space."
];

const Visualizer: React.FC<VisualizerProps> = ({ initialPrompt, projectDescription, userTier, onUpgradeRequest }) => {
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isVideoGenerating, setIsVideoGenerating] = useState(false);
  
  const [size, setSize] = useState<ImageSize>('1K');
  const [editPrompt, setEditPrompt] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState(initialPrompt);
  const [activeTab, setActiveTab] = useState<'image' | 'video'>('image');
  const [loadingTip, setLoadingTip] = useState('');

  const isFree = userTier === 'free';

  useEffect(() => {
    // Cycle tips during long loads
    if (isGenerating || isVideoGenerating) {
        setLoadingTip(TIPS[Math.floor(Math.random() * TIPS.length)]);
        const interval = setInterval(() => {
            setLoadingTip(TIPS[Math.floor(Math.random() * TIPS.length)]);
        }, 4000);
        return () => clearInterval(interval);
    }
  }, [isGenerating, isVideoGenerating]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    setActiveTab('image');
    try {
      const base64 = await generateVisualization(projectDescription, selectedStyle, size);
      setGeneratedImage(base64);
      setGeneratedVideoUrl(null); 
    } catch (err) {
      console.error(err);
      setError("Failed to generate image. Please try again or check your connection.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEdit = async () => {
    if (isFree) {
        onUpgradeRequest();
        return;
    }
    if (!generatedImage || !editPrompt) return;
    setIsEditing(true);
    setError(null);
    try {
      const base64 = await editVisualization(generatedImage, editPrompt);
      setGeneratedImage(base64);
      setEditPrompt('');
    } catch (err) {
        console.error(err);
        setError("Failed to edit image. Please try a different prompt.");
    } finally {
      setIsEditing(false);
    }
  };

  const handleGenerateVideo = async () => {
    if (isFree) {
      onUpgradeRequest();
      return;
    }
    setIsVideoGenerating(true);
    setError(null);
    setActiveTab('video');
    try {
      const videoUrl = await generateProjectVideo(
        projectDescription, 
        selectedStyle, 
        generatedImage || undefined
      );
      setGeneratedVideoUrl(videoUrl);
    } catch (err) {
      console.error(err);
      setError("Video generation failed. This can happen if the service is busy. Please try again.");
    } finally {
      setIsVideoGenerating(false);
    }
  };

  const handleSizeChange = (s: ImageSize) => {
      if (s !== '1K' && isFree) {
          onUpgradeRequest();
      } else {
          setSize(s);
      }
  };

  const isLoading = isGenerating || isEditing || isVideoGenerating;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-slate-900 w-full max-w-7xl max-h-[90vh] rounded-3xl overflow-hidden flex flex-col md:flex-row shadow-2xl border border-slate-800 relative">
        
        {/* Main Content (Image/Video) */}
        <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden group min-h-[400px]">
            
            {/* Content Rendering */}
            {activeTab === 'image' ? (
                generatedImage ? (
                    <img 
                        src={`data:image/png;base64,${generatedImage}`} 
                        alt="AI Visualization" 
                        className={`w-full h-full object-contain transition-opacity duration-500 ${isLoading ? 'opacity-50 blur-sm' : 'opacity-100'}`}
                    />
                ) : (
                    !isLoading && (
                        <div className="text-center p-12 animate-in fade-in zoom-in-95 duration-500">
                            <div className="w-20 h-20 bg-gradient-to-tr from-blue-600/20 to-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10">
                                <Sparkles className="w-10 h-10 text-blue-400" />
                            </div>
                            <h3 className="text-white text-2xl font-bold mb-2">Visualize Your Vision</h3>
                            <p className="text-slate-400 max-w-md mx-auto">
                                Select a style and resolution, then click generate to see your project come to life with Gemini 3 Pro.
                            </p>
                        </div>
                    )
                )
            ) : (
                generatedVideoUrl ? (
                     <video 
                        src={generatedVideoUrl} 
                        controls 
                        autoPlay 
                        loop 
                        className={`w-full h-full object-contain transition-opacity duration-500 ${isLoading ? 'opacity-50 blur-sm' : 'opacity-100'}`}
                     />
                ) : (
                    !isLoading && (
                        <div className="text-center p-12 animate-in fade-in zoom-in-95 duration-500">
                             <div className="w-20 h-20 bg-gradient-to-tr from-purple-600/20 to-pink-600/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10">
                                <Video className="w-10 h-10 text-purple-400" />
                            </div>
                            <h3 className="text-white text-2xl font-bold mb-2">Cinematic Project Tour</h3>
                            <p className="text-slate-400 max-w-md mx-auto">
                                Generate a stunning walk-through video of your renovated space using the power of Veo.
                            </p>
                        </div>
                    )
                )
            )}

            {/* Loading Overlay */}
            {isLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-20">
                    <div className="relative">
                        <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 rounded-full animate-pulse"></div>
                        <Loader2 className="w-12 h-12 animate-spin text-blue-400 relative z-10" />
                    </div>
                    <h4 className="text-xl font-medium mt-6 mb-2">
                      {isGenerating && 'Creating Rendering...'}
                      {isEditing && 'Refining Image...'}
                      {isVideoGenerating && 'Generating Video...'}
                    </h4>
                    <p className="text-slate-400 text-sm max-w-xs text-center animate-pulse">
                        {loadingTip}
                    </p>
                    {isVideoGenerating && (
                         <div className="w-64 h-1.5 bg-slate-800 rounded-full mt-6 overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 w-1/3 animate-[shimmer_2s_infinite_linear] rounded-full" style={{ width: '100%', transform: 'translateX(-100%)', animationName: 'shimmer' }}></div>
                         </div>
                    )}
                    <style>{`
                        @keyframes shimmer {
                            0% { transform: translateX(-100%); }
                            100% { transform: translateX(100%); }
                        }
                    `}</style>
                </div>
            )}

            {/* Download Actions */}
            {!isLoading && ((activeTab === 'image' && generatedImage) || (activeTab === 'video' && generatedVideoUrl)) && (
                <div className="absolute top-4 right-4 flex gap-2">
                     <a 
                        href={activeTab === 'image' ? `data:image/png;base64,${generatedImage}` : generatedVideoUrl!} 
                        download={`estimate-genie-${activeTab === 'image' ? 'render.png' : 'tour.mp4'}`}
                        className="bg-black/40 hover:bg-black/60 backdrop-blur-md text-white p-2.5 rounded-full transition-all border border-white/10 hover:border-white/30 group"
                        title="Download"
                    >
                        <Download size={20} />
                    </a>
                </div>
            )}
        </div>

        {/* Sidebar Controls */}
        <div className="w-full md:w-96 bg-slate-950 border-l border-slate-800 flex flex-col h-full">
            <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
                <div className="mb-6">
                    <h2 className="text-white font-bold text-xl mb-1 flex items-center gap-2">
                        <Sparkles className="text-blue-500" size={20} />
                        AI Visualizer
                    </h2>
                    <p className="text-slate-500 text-sm line-clamp-2" title={projectDescription}>
                        {projectDescription}
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm mb-6 flex gap-3 items-start animate-in slide-in-from-top-2">
                        <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <p className="font-medium mb-1">Error</p>
                            <p className="opacity-90">{error}</p>
                        </div>
                        <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300">
                            <X size={16} />
                        </button>
                    </div>
                )}

                {/* Tabs */}
                <div className="flex bg-slate-900/50 p-1.5 rounded-xl mb-8 border border-slate-800">
                  <button 
                    onClick={() => !isLoading && setActiveTab('image')}
                    disabled={isLoading}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                        activeTab === 'image' 
                        ? 'bg-slate-800 text-white shadow-sm border border-slate-700' 
                        : 'text-slate-500 hover:text-slate-300'
                    } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <Sparkles size={16} /> Render
                  </button>
                  <button 
                    onClick={() => !isLoading && setActiveTab('video')}
                    disabled={isLoading}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                        activeTab === 'video' 
                        ? 'bg-slate-800 text-white shadow-sm border border-slate-700' 
                        : 'text-slate-500 hover:text-slate-300'
                    } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <Video size={16} /> Video Tour
                  </button>
                </div>

                <div className="space-y-6">
                    {/* Style Selector */}
                    <div className="space-y-3">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Aesthetic Style</label>
                        <div className="relative">
                            <select 
                                value={selectedStyle}
                                onChange={(e) => setSelectedStyle(e.target.value)}
                                disabled={isLoading}
                                className="w-full bg-slate-900 border border-slate-700 text-white text-sm rounded-xl px-4 py-3 appearance-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all hover:border-slate-600 disabled:opacity-50"
                            >
                                <option value={initialPrompt}>{initialPrompt} (Recommended)</option>
                                {STYLES.filter(s => s !== initialPrompt).map(s => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-4 top-3.5 text-slate-500 pointer-events-none" size={16} />
                        </div>
                    </div>

                    {/* Image Resolution Controls */}
                    {activeTab === 'image' && (
                      <div className="space-y-3">
                          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider flex justify-between">
                              Output Quality
                              {isFree && <span className="text-amber-500 text-[10px] flex items-center gap-1"><Lock size={10} /> Pro Unlocks 4K</span>}
                          </label>
                          <div className="grid grid-cols-3 gap-2">
                              {(['1K', '2K', '4K'] as ImageSize[]).map((s) => {
                                  const isLocked = s !== '1K' && isFree;
                                  const isSelected = size === s;
                                  return (
                                      <button
                                          key={s}
                                          onClick={() => handleSizeChange(s)}
                                          disabled={isLoading}
                                          className={`py-2.5 px-2 text-sm font-bold rounded-xl border transition-all relative overflow-hidden group ${
                                              isSelected
                                              ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/20' 
                                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:bg-slate-800'
                                          } ${isLocked ? 'opacity-60 cursor-not-allowed' : ''}`}
                                      >
                                          <span className="relative z-10">{s}</span>
                                          {isSelected && <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent"></div>}
                                          {isLocked && (
                                              <div className="absolute inset-0 bg-slate-950/60 flex items-center justify-center z-20 backdrop-blur-[1px]">
                                                  <Lock size={12} className="text-amber-500" />
                                              </div>
                                          )}
                                      </button>
                                  );
                              })}
                          </div>
                      </div>
                    )}

                    {/* Action Button */}
                    {activeTab === 'image' ? (
                      <button
                          onClick={handleGenerate}
                          disabled={isLoading || isEditing}
                          className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.98]"
                      >
                          {isLoading ? (
                              <Loader2 size={20} className="animate-spin" />
                          ) : generatedImage ? (
                              <><RefreshCw size={20} /> Regenerate</>
                          ) : (
                              <><Wand2 size={20} /> Generate Render</>
                          )}
                      </button>
                    ) : (
                      <div className="space-y-4">
                         <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
                            <h5 className="text-purple-300 text-sm font-bold mb-1 flex items-center gap-2">
                                <Video size={14} /> Veo Cinematic Mode
                            </h5>
                            <p className="text-purple-200/60 text-xs leading-relaxed">
                                Generates a high-quality video flythrough. This process uses advanced AI models and may take 1-2 minutes to complete.
                            </p>
                         </div>
                         <button
                            onClick={handleGenerateVideo}
                            disabled={isVideoGenerating || isLoading}
                            className={`w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl font-bold shadow-lg shadow-purple-900/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.98] ${isFree ? 'opacity-80' : ''}`}
                          >
                            {isVideoGenerating ? (
                                <Loader2 size={20} className="animate-spin" />
                            ) : isFree ? (
                                <><Lock size={20} /> Unlock Video Generation</>
                            ) : (
                                <><Play size={20} fill="currentColor" /> {generatedVideoUrl ? 'Regenerate Video' : 'Generate Video'}</>
                            )}
                          </button>
                      </div>
                    )}
                </div>

                {/* AI Editor Section */}
                {activeTab === 'image' && generatedImage && (
                    <div className="mt-8 pt-8 border-t border-slate-800 space-y-4 relative">
                         <div className="flex justify-between items-end mb-2">
                            <div>
                                <h4 className="text-white font-bold flex items-center gap-2 text-sm">
                                    <Sparkles size={14} className="text-amber-400" />
                                    AI Magic Editor
                                </h4>
                                <p className="text-xs text-slate-500 mt-1">Refine details with natural language.</p>
                            </div>
                            {isFree && <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20">PRO</span>}
                        </div>
                        
                        {isFree && (
                            <div className="absolute inset-0 bg-slate-950/80 z-20 flex flex-col items-center justify-center text-center p-4 backdrop-blur-[2px] rounded-xl border border-slate-800 mt-14 h-[120px]">
                                <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center mb-2">
                                     <Lock className="text-amber-500" size={18} />
                                </div>
                                <button 
                                    onClick={onUpgradeRequest}
                                    className="text-white text-xs font-bold hover:underline"
                                >
                                    Upgrade to Unlock Editor
                                </button>
                            </div>
                        )}

                        <div className="relative group">
                            <textarea
                                value={editPrompt}
                                onChange={(e) => setEditPrompt(e.target.value)}
                                placeholder='e.g., "Make it sunset", "Add a modern rug"'
                                disabled={isFree || isLoading}
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-slate-200 text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none resize-none h-28 disabled:opacity-30 transition-all"
                            />
                            <button
                                onClick={handleEdit}
                                disabled={!editPrompt || isEditing || isLoading || isFree}
                                className="absolute bottom-3 right-3 bg-slate-700 hover:bg-blue-600 text-white p-2 rounded-lg transition-colors disabled:opacity-0 disabled:scale-90 transform duration-200 shadow-lg"
                                title="Apply Edit"
                            >
                                {isEditing ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
                            </button>
                        </div>
                    </div>
                )}
            </div>
            
            <div className="p-4 bg-slate-900 border-t border-slate-800 text-center">
                <p className="text-[10px] text-slate-600 font-medium">
                    Powered by Google Gemini 3 Pro, Imagen & Veo
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Visualizer;
