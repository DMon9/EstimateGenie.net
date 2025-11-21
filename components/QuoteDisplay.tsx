
import React, { useState } from 'react';
import { QuoteData } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { CheckCircle2, Clock, DollarSign, HardHat, Palette, CalendarDays, Mail, Share2, FileDown, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface QuoteDisplayProps {
  data: QuoteData;
  onVisualizeRequest: (style: string) => void;
  onEmailRequest: () => void;
  onPdfDownloadRequest: () => Promise<boolean>;
}

const QuoteDisplay: React.FC<QuoteDisplayProps> = ({ data, onVisualizeRequest, onEmailRequest, onPdfDownloadRequest }) => {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const chartData = data.breakdown.map(item => ({
    name: item.category,
    cost: item.estimatedCost,
    desc: item.description
  }));

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const handlePdfDownload = async () => {
    const canProceed = await onPdfDownloadRequest();
    if (!canProceed) return;

    setIsGeneratingPdf(true);
    
    try {
        // Small delay to ensure UI updates (like toast) render before canvas capture if needed,
        // though mainly we want to capture the static content.
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const element = document.getElementById('quote-pdf-content');
        if (element) {
            const canvas = await html2canvas(element, { 
                scale: 2, // Higher quality
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
            });
            
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            
            const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
            const imgX = (pdfWidth - imgWidth * ratio) / 2;
            const imgY = 10; // Top margin
            
            // If content is very long, this basic implementation scales it to one page or crops.
            // For a robust multi-page solution, more complex logic is needed, but this suffices for a quote summary.
            // We'll scale to fit width.
            
            const finalImgWidth = pdfWidth - 20; // 10mm margins
            const finalImgHeight = (imgHeight * finalImgWidth) / imgWidth;

            pdf.addImage(imgData, 'PNG', 10, 10, finalImgWidth, finalImgHeight);
            pdf.save(`${data.projectName.replace(/\s+/g, '_')}_Estimate.pdf`);
        }
    } catch (error) {
        console.error("PDF Generation failed", error);
        alert("Failed to generate PDF. Please try again.");
    } finally {
        setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700" id="quote-pdf-content">
      
      {/* Header Summary */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
                <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-3xl font-bold text-slate-900">{data.projectName}</h2>
                </div>
                <p className="text-slate-500">Estimate Genie Proposal</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <button 
                    onClick={handlePdfDownload}
                    disabled={isGeneratingPdf}
                    className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors font-medium text-sm disabled:opacity-50"
                >
                    {isGeneratingPdf ? <Loader2 size={18} className="animate-spin" /> : <FileDown size={18} />}
                    Download PDF
                </button>
                <button 
                    onClick={onEmailRequest}
                    className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors font-medium text-sm"
                >
                    <Mail size={18} />
                    Email Quote
                </button>
                <div className="bg-blue-50 px-6 py-3 rounded-xl border border-blue-100">
                    <p className="text-sm text-blue-600 font-medium uppercase tracking-wider">Total Estimate</p>
                    <div className="text-2xl md:text-3xl font-bold text-blue-900 flex items-center gap-1">
                        <DollarSign size={24} className="text-blue-600" />
                        {data.totalEstimatedCostMin.toLocaleString()} - {data.totalEstimatedCostMax.toLocaleString()} {data.currency}
                    </div>
                </div>
            </div>
        </div>
        <p className="text-slate-700 leading-relaxed text-lg">{data.summary}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Cost Breakdown Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <DollarSign className="text-green-500" /> Category Breakdown
            </h3>
            <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} layout="vertical" margin={{ left: 40 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12}} />
                        <Tooltip 
                            cursor={{fill: '#f8fafc'}}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            formatter={(value: number) => [`$${value.toLocaleString()}`, 'Cost']}
                        />
                        <Bar dataKey="cost" radius={[0, 4, 4, 0]}>
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Project Timeline */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <CalendarDays className="text-purple-500" /> Phased Schedule & Costs
            </h3>
            <div className="relative border-l-2 border-slate-100 pl-8 space-y-8">
                {data.timeline.map((phase, idx) => (
                    <div key={idx} className="relative">
                        <div className="absolute -left-[41px] w-5 h-5 rounded-full border-4 border-white bg-blue-500 shadow-sm"></div>
                        <div className="flex flex-wrap justify-between items-start mb-1 gap-2">
                            <h4 className="font-bold text-slate-800 text-lg">{phase.phaseName}</h4>
                            <div className="flex items-center gap-2">
                                <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1">
                                    <Clock size={12} /> {phase.duration}
                                </span>
                                <span className="bg-green-50 text-green-700 text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1 border border-green-100">
                                    <DollarSign size={12} /> {phase.estimatedCost ? phase.estimatedCost.toLocaleString() : 'N/A'}
                                </span>
                            </div>
                        </div>
                        <p className="text-slate-600 mb-3 text-sm">{phase.description}</p>
                        <ul className="space-y-1">
                            {phase.tasks.map((task, tIdx) => (
                                <li key={tIdx} className="text-sm text-slate-500 flex items-start gap-2">
                                    <span className="w-1.5 h-1.5 bg-slate-300 rounded-full mt-1.5 flex-shrink-0"></span>
                                    {task}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
      </div>

      {/* Materials & Styles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
            <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <HardHat className="text-orange-500" /> Recommended Materials
            </h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {data.materials.map((mat, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-slate-700 p-2 bg-slate-50 rounded-lg">
                        <CheckCircle2 size={16} className="text-green-500 flex-shrink-0" />
                        {mat}
                    </li>
                ))}
            </ul>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-lg p-6 md:p-8 text-white" data-html2canvas-ignore="true">
             <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Palette className="text-white/80" /> Design Visualization
            </h3>
            <p className="mb-6 text-blue-100">
                Visualize the project in your preferred style or one of our AI suggestions.
            </p>
            <div className="flex flex-wrap gap-2">
                {data.designStyleSuggestions.map((style, idx) => (
                    <button
                        key={idx}
                        onClick={() => onVisualizeRequest(style)}
                        className="bg-white/10 hover:bg-white hover:text-blue-700 text-white backdrop-blur-sm border border-white/20 px-4 py-2 rounded-full transition-all font-medium text-sm"
                    >
                        Visualize {style}
                    </button>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default QuoteDisplay;