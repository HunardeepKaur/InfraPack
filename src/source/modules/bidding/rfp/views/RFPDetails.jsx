import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import PageHeaderV2 from "../../../../../components/shared/pageHeader/PageHeaderV2";
import { FiUpload, FiCheck, FiFile, FiBookOpen, FiRefreshCw } from "react-icons/fi";
import { FaSpinner } from "react-icons/fa";
import { useRFP } from "../context/RFPContext";
import { useRFPUpload } from "./hooks/useRFPUpload";
import { DataSections } from "./components/DataSections";
import { ChunkModal } from "./components/ChunkModal";
import { PDFViewerModal } from "./components/PDFViewerModal";
import PredictionPopup from "./components/PredictionPopup"; // NEW: Import PredictionPopup

const RFPDetails = () => {
  const navigate = useNavigate();
  const { 
    rfpData, 
    processedChunks, 
    fileName,
    pdfUrl,
    rfpLoading,
    // NEW: Get prediction state from context
    predictionResult,
    predictionLoading,
    predictionError
  } = useRFP();
  
  const { localFileName, handleFileChange, handleReupload } = useRFPUpload();
  
  const [selectedChunk, setSelectedChunk] = useState(null);
  const [isChunkModalOpen, setIsChunkModalOpen] = useState(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  // NEW: State for prediction modal
  const [isPredictionModalOpen, setIsPredictionModalOpen] = useState(false);
  const [pdfModalData, setPdfModalData] = useState({
    pageNumber: 1,
    title: "",
    content: ""
  });

  const leftPanelRef = useRef(null);
  const rightPanelRef = useRef(null);

  const themeColor = "#3E1067";

  const breadcrumbList = [
    { folderName: "Home", path: "/" },
    { pageName: "RFP Details" },
  ];

  // Prevent body scroll when any modal is open - UPDATED to include prediction modal
  useEffect(() => {
    if (isChunkModalOpen || isPdfModalOpen || isPredictionModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isChunkModalOpen, isPdfModalOpen, isPredictionModalOpen]);

  const handleChunkClick = (chunk) => {
    setSelectedChunk(chunk);
    setIsChunkModalOpen(true);
  };

  const handleViewInPdf = (pageNumber, title, content) => {
    // Close chunk modal first
    setIsChunkModalOpen(false);
    
    // Set new PDF modal data
    setPdfModalData({
      pageNumber,
      title,
      content
    });
    
    // Small delay to ensure smooth transition
    setTimeout(() => {
      setIsPdfModalOpen(true);
    }, 100);
  };

  const handleClosePdfModal = () => {
    setIsPdfModalOpen(false);
    // Optionally reopen chunk modal if needed
    // if (selectedChunk) {
    //   setTimeout(() => setIsChunkModalOpen(true), 100);
    // }
  };

  return (
    <div className="h-screen flex flex-col bg-white font-sans overflow-hidden">
      {/* Existing Modals */}
      <ChunkModal
        isOpen={isChunkModalOpen}
        onClose={() => setIsChunkModalOpen(false)}
        chunk={selectedChunk}
        onViewInPdf={handleViewInPdf}
      />

      <PDFViewerModal
        isOpen={isPdfModalOpen}
        onClose={handleClosePdfModal}
        pdfUrl={pdfUrl}
        targetPage={pdfModalData.pageNumber}
        highlightTitle={pdfModalData.title}
        highlightContent={pdfModalData.content}
      />

      {/* NEW: Prediction Modal */}
      <PredictionPopup
        isOpen={isPredictionModalOpen}
        onClose={() => setIsPredictionModalOpen(false)}
        result={predictionResult}
      />

      <style>{`
        ::-webkit-scrollbar {
          width: 4px;
        }
        ::-webkit-scrollbar-track {
          background: #f5f7fa;
        }
        ::-webkit-scrollbar-thumb {
          background: #d0d5de;
          border-radius: 2px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #a0a8b8;
        }
        
        .left-panel::-webkit-scrollbar,
        .right-panel-content::-webkit-scrollbar {
          width: 4px;
          background: transparent;
        }
        .left-panel::-webkit-scrollbar-thumb,
        .right-panel-content::-webkit-scrollbar-thumb {
          background: transparent;
        }
        .left-panel:hover::-webkit-scrollbar-thumb,
        .right-panel-content:hover::-webkit-scrollbar-thumb {
          background: #d0d5de;
        }

        .spinner { 
          animation: spin 0.8s linear infinite; 
        }

        @keyframes spin { 
          from { transform: rotate(0deg); } 
          to { transform: rotate(360deg); } 
        }
      `}</style>

      <div className="flex-shrink-0 border-b border-gray-300 bg-[#EDEEF0] px-6">
        <PageHeaderV2
          children={breadcrumbList}
          backButton={true}
          list={
            localFileName && !rfpLoading && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#3E1067]/5 px-2.5 py-1 text-xs text-[#3E1067]">
                <FiCheck size={12} /> {localFileName}
              </span>
            )
          }
        />
      </div>

      <div className="flex-1 flex min-h-0">
        
        {/* LEFT PANEL - Extracted Data */}
        <div 
          ref={leftPanelRef}
          className="left-panel flex-[0_0_70%] overflow-y-auto h-full p-6 border-r border-gray-100"
        >
          <div className="w-full p-0">
            {/* Upload Section */}
            <div className="mb-7">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className="block text-[0.7rem] font-semibold uppercase tracking-wide text-gray-400 mb-1">
                    Upload Document
                  </label>
                  <div className="flex gap-2 items-center">
                    <div className="flex-1 relative">
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileChange}
                        disabled={rfpLoading}
                        id="file-upload"
                        className="hidden"
                      />
                      <label
                        htmlFor="file-upload"
                        className={`flex items-center gap-1.5 px-3.5 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm text-gray-600 ${
                          rfpLoading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
                        }`}
                      >
                        <FiUpload size={14} className="text-[#3E1067]" />
                        <span className="flex-1">{localFileName || 'Choose PDF...'}</span>
                      </label>
                    </div>
                    
                    {localFileName && !rfpLoading && (
                      <button
                        onClick={handleReupload}
                        className="flex items-center gap-1 px-3.5 py-2 bg-white border border-gray-100 rounded-lg text-sm text-[#3E1067] cursor-pointer transition-all hover:bg-[#3E1067]/5 hover:border-[#3E1067]"
                      >
                        <FiRefreshCw size={14} />
                        Reupload
                      </button>
                    )}

                    {rfpLoading && (
                      <div className="flex items-center gap-1 rounded-full bg-[#3E1067]/5 px-3 py-1.5 text-xs text-[#3E1067]">
                        <FaSpinner className="spinner" size={10} />
                        <img src="/images/LYA SYMBOL.svg" alt="" className="h-3 w-3 object-contain" />
                        LYA Analyzing
                      </div>
                    )}

                    {/* MODIFIED: LYA Prediction Button with dynamic states */}
                    {!rfpLoading && rfpData && (
                      <button
                        onClick={() => predictionResult && setIsPredictionModalOpen(true)}
                        disabled={predictionLoading || !predictionResult}
                        className={`flex items-center gap-1.5 rounded-[10px] px-4 py-2 text-[0.8rem] font-medium transition-all ${
                          predictionLoading
                            ? 'rounded-full bg-[#3E1067]/5 px-3 py-1.5 text-xs text-[#3E1067] cursor-not-allowed'
                            : predictionResult
                            ? 'bg-[#3E1067] text-white hover:bg-[#5a2d8c] hover:-translate-y-0.5 hover:shadow-lg cursor-pointer'
                            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        }`}
                        type="button"
                        style={predictionResult ? { boxShadow: '0 4px 8px rgba(62, 16, 103, 0.2)' } : {}}
                      >
                        {predictionLoading ? (
                          <>
                            <FaSpinner className="spinner" size={12} />
                            <img src="/images/LYA SYMBOL.svg" alt="" className="h-3 w-3 object-contain" />
                            <span>LYA Predicting</span>
                          </>
                        ) : predictionResult ? (
                          <>
                            <img src="/images/LYA SYMBOL.svg" alt="" className="h-3 w-3 object-contain" />
                            <span>LYA Prediction</span>
                            <span className={`ml-1 text-[0.65rem] ${
                              predictionResult.prediction === "MATCH" 
                                ? 'bg-green-400/20' 
                                : 'bg-red-400/20'
                            } px-1.5 py-0.5 rounded-full`}>
                              {predictionResult.match_percentage?.toFixed(1) || '0'}%
                            </span>
                          </>
                        ) : (
                          <>
                            <img src="/images/LYA SYMBOL.svg" alt="" className="h-3 w-3 object-contain opacity-50" />
                            <span>Prediction Unavailable</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {rfpData ? (
              <DataSections data={rfpData} />
            ) : (
              !rfpLoading && (!processedChunks || processedChunks.length === 0) && (
                <div className="text-center p-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <div className="w-10 h-10 bg-[#3E1067]/5 rounded-xl mx-auto mb-3 flex items-center justify-center">
                    <FiUpload size={18} className="text-[#3E1067]" />
                  </div>
                  <h5 className="text-gray-800 mb-0.5 font-semibold text-sm">No Document Uploaded</h5>
                  <p className="text-gray-400 text-xs m-0">Upload a PDF to extract data</p>
                </div>
              )
            )}
          </div>
        </div>

        {/* RIGHT PANEL - Document Pages */}
        <div className="flex-[0_0_30%] bg-gray-50 flex flex-col h-full overflow-hidden">
          
          <div className="px-5 py-4 border-b border-gray-100 bg-white flex-shrink-0">
            <div className="flex items-center gap-1.5">
              <FiBookOpen size={14} className="text-[#3E1067]" />
              <h6 className="m-0 font-semibold text-gray-800 text-xs">
                Document Pages
              </h6>
              {processedChunks && processedChunks.length > 0 && (
                <span className="bg-[#3E1067]/5 text-[#3E1067] px-1.5 py-0.5 rounded-full text-[0.65rem] font-medium ml-auto">
                  {processedChunks.length}
                </span>
              )}
            </div>
          </div>

          <div 
            ref={rightPanelRef}
            className="right-panel-content flex-1 overflow-y-auto p-3"
          >
            {processedChunks && processedChunks.length > 0 ? (
              <div className="flex flex-col gap-1.5">
                {processedChunks.map((chunk, index) => (
                  <div
                    key={index}
                    onClick={() => handleChunkClick(chunk)}
                    className="cursor-pointer border border-gray-100 rounded-xl p-3 bg-white transition-all hover:border-[#3E1067]"
                  >
                    <div className="flex gap-2.5">
                      <div className="w-7 h-7 bg-[#3E1067]/5 rounded-md flex items-center justify-center text-[#3E1067] flex-shrink-0">
                        <FiFile size={12} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-xs text-gray-800 mb-0.5 truncate">
                          {chunk.metadata?.title || 'Document Page'}
                        </div>
                        <div className="text-[0.65rem] text-gray-400 flex items-center gap-1">
                          <span>Page {chunk.metadata?.page || '?'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-6 bg-white rounded-xl border border-dashed border-gray-200">
                <p className="text-gray-300 text-xs m-0">No pages yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RFPDetails;
