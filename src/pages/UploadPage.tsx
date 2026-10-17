import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopBar } from '../components/TopBar.js';
import { uploadDocument } from '../api.js';
import { UploadCloud, CheckCircle2, ArrowRight, Plus } from 'lucide-react';

interface ExtractedItem {
  id: string;
  label: string;
  subtext: string;
  timestamp: string;
}

export const UploadPage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  // Initial extracted feed items as shown in Image 5
  const [extractedFeed, setExtractedFeed] = useState<ExtractedItem[]>([
    {
      id: 'ext-1',
      label: 'SBI account found',
      subtext: 'Added to graph',
      timestamp: 'Just now'
    },
    {
      id: 'ext-2',
      label: 'Nominee: Rohan Verma',
      subtext: 'Added to graph',
      timestamp: 'Just now'
    },
    {
      id: 'ext-3',
      label: 'Death certificate verified',
      subtext: 'Added to graph',
      timestamp: 'Just now'
    }
  ]);

  const handleFileProcess = async (file: File) => {
    setIsProcessing(true);
    setUploadedFileName(file.name);

    try {
      const result = await uploadDocument(file);
      const items = result.extracted || [
        { label: `${file.name} parsed successfully`, type: 'doc' },
        { label: 'Entities extracted to graph', type: 'entity' }
      ];

      // Add items sequentially one by one with a slight delay
      items.forEach((item: any, idx: number) => {
        setTimeout(() => {
          setExtractedFeed((prev) => [
            {
              id: `ext-${Date.now()}-${idx}`,
              label: item.label,
              subtext: 'Added to graph',
              timestamp: 'Just now'
            },
            ...prev
          ]);
        }, (idx + 1) * 600);
      });
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => {
        setIsProcessing(false);
      }, 2000);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileProcess(e.target.files[0]);
    }
  };

  return (
    <div className="min-h-screen bg-[#111827] text-slate-100 flex flex-col justify-between">
      <TopBar dark={true} />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 pt-28 pb-16 space-y-8">
        {/* Page Header */}
        <div className="text-center space-y-3">
          <h1 className="text-3xl sm:text-5xl font-bold font-serif text-slate-100 tracking-tight">
            Secure Legal Vault & Parser
          </h1>
          <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto">
            Upload certified copies of documents. Our neural legal engine
            automatically structures your estate graph.
          </p>
        </div>

        {/* Dropzone Card */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`bg-white text-[#1E293B] rounded-3xl p-8 sm:p-12 shadow-2xl border-2 transition-all relative ${
            isDragging
              ? 'border-[#0D9488] scale-[1.01] bg-teal-50/20'
              : 'border-transparent'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png,.tiff"
          />

          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-teal-50 text-[#0D9488] flex items-center justify-center">
              <UploadCloud className="w-8 h-8" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-[#1E293B]">
              Drop a document. Waaris will read it and build the estate map.
            </h2>

            <p className="text-slate-500 text-sm sm:text-base max-w-md">
              Supports Will, Death Certificate, Property Deeds, Bank Statements
              <br />
              <span className="text-xs text-slate-400">
                up to 25MB (PDF, TIFF, JPG)
              </span>
            </p>

            {isProcessing ? (
              <div className="flex items-center gap-3 py-3 px-6 bg-teal-50 text-[#0D9488] rounded-xl font-semibold">
                <div className="w-5 h-5 border-2 border-[#0D9488] border-t-transparent rounded-full animate-spin" />
                <span>Parsing {uploadedFileName || 'document'}...</span>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="mt-2 px-8 py-3.5 bg-[#0D9488] hover:bg-teal-700 text-white font-semibold rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer text-base"
              >
                <Plus className="w-5 h-5" />
                <span>Browse Files from Device</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Extraction Feed */}
        <div className="bg-white text-[#1E293B] rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0D9488] animate-pulse" />
              <h3 className="text-lg font-bold font-serif text-[#1E293B]">
                Live Extraction Feed
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-medium">
              Real-time graph indexing
            </span>
          </div>

          <div className="space-y-3">
            {extractedFeed.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 transition-all hover:bg-slate-100/70"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <span className="font-semibold text-[16px] text-[#1E293B]">
                    {item.label}
                  </span>
                </div>

                <span className="font-mono text-xs text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
                  {item.subtext}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA to Graph */}
        <button
          onClick={() => navigate('/agent')}
          className="w-full py-4 bg-[#0D9488] hover:bg-teal-700 text-white text-lg font-semibold rounded-2xl transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>View estate map</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </main>
    </div>
  );
};
