
import React, { useState, ChangeEvent, useRef, useEffect } from 'react';
import { Upload, FileVideo, Loader2, Plus, Trash2, ChevronDown, ChevronUp, Search, Info, Check, Lock } from 'lucide-react';
import { FileData, ManualInputItem, ProjectInputs, SubscriptionTier } from '../types';
import { fileToBase64 } from '../utils/fileUtils';

interface ProjectInputProps {
  onAnalyze: (fileData: FileData, inputs: ProjectInputs) => void;
  isLoading: boolean;
  userTier: SubscriptionTier;
  onUpgradeRequest: () => void;
}

const STYLE_OPTIONS = [
  { name: "Modern", description: "Clean lines, neutral colors, open floor plans, and lack of clutter." },
  { name: "Minimalist", description: "Simplicity, monochromatic palette, clean lines, and functional furniture." },
  { name: "Rustic", description: "Natural materials like wood and stone, earthy colors, and a warm, cozy feel." },
  { name: "Industrial", description: "Exposed steel, brick, and wood, focusing on raw, unfinished materials." },
  { name: "Scandinavian", description: "Functionality, simplicity, and clean lines, often with light wood and white walls." },
  { name: "Mid-Century Modern", description: "Organic curves, geometric shapes, and a mix of traditional and non-traditional materials." },
  { name: "Traditional", description: "Classic details, sumptuous furnishings, and an abundance of accessories." },
  { name: "Bohemian", description: "Carefree, eclectic, and relaxed, with a mix of patterns, textures, and colors." },
  { name: "Farmhouse", description: "Practical, durable, and comfortable, often mixing rustic charm with modern amenities." },
  { name: "Contemporary", description: "Current trends, fluid, and constantly changing, often featuring bold contrasts." }
];

const ProjectInput: React.FC<ProjectInputProps> = ({ onAnalyze, isLoading, userTier, onUpgradeRequest }) => {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState(STYLE_OPTIONS[0].name);
  const [searchStyle, setSearchStyle] = useState(STYLE_OPTIONS[0].name);
  const [isStyleDropdownOpen, setIsStyleDropdownOpen] = useState(false);
  
  const [laborHours, setLaborHours] = useState('');
  const [manualMaterials, setManualMaterials] = useState<ManualInputItem[]>([]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQty, setNewItemQty] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const [fileData, setFileData] = useState<FileData | null>(null);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsStyleDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const base64 = await fileToBase64(file);
      const previewUrl = URL.createObjectURL(file);
      
      setFileData({
        file,
        base64,
        previewUrl,
        mimeType: file.type
      });
    }
  };

  const addMaterial = () => {
    if (newItemName && newItemQty) {
      setManualMaterials([
        ...manualMaterials,
        { id: Date.now().toString(), name: newItemName, quantity: newItemQty }
      ]);
      setNewItemName('');
      setNewItemQty('');
    }
  };

  const removeMaterial = (id: string) => {
    setManualMaterials(manualMaterials.filter(item => item.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fileData && prompt) {
      onAnalyze(fileData, {
        prompt,
        style,
        laborHours,
        manualMaterials
      });
    }
  };

  const handleStyleSelect = (selectedStyleName: string) => {
    setStyle(selectedStyleName);
    setSearchStyle(selectedStyleName);
    setIsStyleDropdownOpen(false);
  };

  const filteredStyles = STYLE_OPTIONS.filter(s => 
    s.name.toLowerCase().includes(searchStyle.toLowerCase())
  );

  const isProLocked = userTier === 'free';

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
      <h2 className="text-2xl font-bold text-slate-800 mb-2">Start Your Estimate</h2>
      <p className="text-slate-500 mb-6">Upload a photo or video of your space, tell us your vision, and input any specific requirements.</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* File Upload Area */}
        <div className="relative border-2 border-dashed border-slate-300 rounded-xl p-8 transition-all hover:border-blue-500 hover:bg-blue-50 group">
            <input
                type="file"
                accept="image/*,video/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                disabled={isLoading}
            />
            
            {!fileData ? (
                <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                        <Upload size={32} />
                    </div>
                    <p className="text-lg font-medium text-slate-700">Click to upload image or video</p>
                    <p className="text-sm text-slate-400 mt-1">Supports JPG, PNG, MP4, MOV</p>
                </div>
            ) : (
                <div className="flex items-center gap-4">
                    {fileData.mimeType.startsWith('image') ? (
                        <img src={fileData.previewUrl} alt="Preview" className="w-24 h-24 object-cover rounded-lg shadow-md" />
                    ) : (
                        <div className="w-24 h-24 bg-slate-900 text-white rounded-lg flex items-center justify-center">
                            <FileVideo size={32} />
                        </div>
                    )}
                    <div className="flex-1 overflow-hidden">
                        <p className="font-medium text-slate-800 truncate">{fileData.file.name}</p>
                        <p className="text-sm text-slate-500">{(fileData.file.size / 1024 / 1024).toFixed(2)} MB</p>
                        <button 
                            type="button" 
                            onClick={(e) => { e.preventDefault(); setFileData(null); }}
                            className="text-red-500 text-sm hover:underline mt-1 z-20 relative"
                        >
                            Remove
                        </button>
                    </div>
                </div>
            )}
        </div>

        {/* Main Prompt & Style */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">Project Vision & Requirements</label>
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    disabled={isLoading}
                    placeholder="e.g., I want to remodel this kitchen with white cabinets, a large island, and brass fixtures."
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all h-32 resize-none"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Preferred Style</label>
                
                <div className="relative" ref={dropdownRef}>
                    <div className="relative">
                        <input 
                            type="text"
                            value={searchStyle} 
                            onChange={(e) => {
                                setSearchStyle(e.target.value);
                                setStyle(e.target.value);
                                setIsStyleDropdownOpen(true);
                            }}
                            onFocus={() => setIsStyleDropdownOpen(true)}
                            placeholder="Select or type style..."
                            className="w-full px-4 py-3 pl-10 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white truncate"
                        />
                        <Search className="absolute left-3 top-3.5 text-slate-400" size={18} />
                        <div className="absolute right-3 top-3.5 pointer-events-none">
                            {isStyleDropdownOpen ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
                        </div>
                    </div>

                    {isStyleDropdownOpen && (
                        <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl max-h-80 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
                            {filteredStyles.length > 0 ? (
                                filteredStyles.map((s) => (
                                    <div 
                                        key={s.name}
                                        className="p-3 hover:bg-blue-50 cursor-pointer border-b border-slate-50 last:border-0 group"
                                        onClick={() => handleStyleSelect(s.name)}
                                    >
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="font-medium text-slate-800">{s.name}</span>
                                            {style === s.name && <Check size={16} className="text-blue-600" />}
                                        </div>
                                        <div className="text-xs text-slate-500 flex items-start gap-1.5 leading-relaxed">
                                            <Info size={12} className="mt-0.5 text-blue-400 flex-shrink-0" />
                                            {s.description}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-4 text-sm text-slate-500 text-center">
                                    <p>No predefined styles match.</p>
                                    <p className="text-xs mt-1">Using custom style: <span className="font-medium text-slate-700">{searchStyle}</span></p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="mt-4 relative">
                    <label className="block text-sm font-medium text-slate-700 mb-2 flex justify-between">
                        <span>Est. Labor Hours (Opt)</span>
                        {isProLocked && <Lock size={14} className="text-amber-500" />}
                    </label>
                    <div className="relative">
                         <input
                            type="number"
                            value={laborHours}
                            onChange={(e) => !isProLocked && setLaborHours(e.target.value)}
                            onClick={() => isProLocked && onUpgradeRequest()}
                            placeholder="e.g. 40"
                            readOnly={isProLocked}
                            className={`w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${isProLocked ? 'bg-slate-50 cursor-pointer' : ''}`}
                        />
                         {isProLocked && (
                            <div className="absolute inset-0 bg-white/50 flex items-center justify-end pr-4 pointer-events-none">
                                <span className="text-xs font-bold text-amber-600 bg-amber-100 px-2 py-1 rounded-md">PRO</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>

        {/* Advanced Details (Manual Materials) */}
        <div className={`border rounded-xl overflow-hidden ${isProLocked ? 'border-slate-200' : 'border-slate-200'}`}>
            <button
                type="button"
                onClick={() => isProLocked ? onUpgradeRequest() : setShowAdvanced(!showAdvanced)}
                className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors text-slate-700 font-medium"
            >
                <div className="flex items-center gap-2">
                    <span>Advanced: Specific Materials & Costs</span>
                    {isProLocked && (
                        <span className="flex items-center gap-1 text-xs font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 px-2 py-0.5 rounded-full">
                            <Lock size={10} /> PRO
                        </span>
                    )}
                </div>
                {showAdvanced ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            
            {showAdvanced && !isProLocked && (
                <div className="p-4 bg-white space-y-4 animate-in slide-in-from-top-2">
                    <p className="text-sm text-slate-500">Add specific materials you plan to use. The AI will incorporate these into the cost breakdown.</p>
                    
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newItemName}
                            onChange={(e) => setNewItemName(e.target.value)}
                            placeholder="Material (e.g. Oak Flooring)"
                            className="flex-1 px-3 py-2 rounded-lg border border-slate-300 text-sm"
                        />
                        <input
                            type="text"
                            value={newItemQty}
                            onChange={(e) => setNewItemQty(e.target.value)}
                            placeholder="Qty (e.g. 500 sqft)"
                            className="w-32 px-3 py-2 rounded-lg border border-slate-300 text-sm"
                        />
                        <button
                            type="button"
                            onClick={addMaterial}
                            disabled={!newItemName || !newItemQty}
                            className="bg-blue-100 text-blue-600 p-2 rounded-lg hover:bg-blue-200 disabled:opacity-50"
                        >
                            <Plus size={20} />
                        </button>
                    </div>

                    {manualMaterials.length > 0 && (
                        <ul className="space-y-2">
                            {manualMaterials.map(item => (
                                <li key={item.id} className="flex items-center justify-between bg-slate-50 p-2 rounded-lg text-sm">
                                    <span><span className="font-semibold">{item.name}</span>: {item.quantity}</span>
                                    <button
                                        type="button"
                                        onClick={() => removeMaterial(item.id)}
                                        className="text-red-400 hover:text-red-600 p-1"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>

        <button
            type="submit"
            disabled={!fileData || !prompt || isLoading}
            className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${
                !fileData || !prompt || isLoading
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-blue-500/25'
            }`}
        >
            {isLoading ? (
                <>
                    <Loader2 className="animate-spin" />
                    Analyzing & Estimating...
                </>
            ) : (
                <>
                    Generate Quote & Plan
                </>
            )}
        </button>
      </form>
    </div>
  );
};

export default ProjectInput;
