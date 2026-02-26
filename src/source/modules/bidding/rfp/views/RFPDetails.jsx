import React, { useState, useEffect, useRef } from "react";
import { Container } from "reactstrap";
import { useNavigate } from "react-router-dom";
import PageHeaderV2 from "../../../../../components/shared/pageHeader/PageHeaderV2";
import { FiUpload, FiCheck, FiFile, FiBookOpen, FiRefreshCw } from "react-icons/fi";
import { FaSpinner } from "react-icons/fa";
import { useRFP } from "../context/RFPContext";
import { useRFPUpload } from "./hooks/useRFPUpload";
import { DataSections } from "./components/DataSections";
import { ChunkModal } from "./components/ChunkModal";
import { PDFViewerModal } from "./components/PDFViewerModal";

const RFPDetails = () => {
  const navigate = useNavigate();
  const { 
    rfpData, 
    processedChunks, 
    fileName,
    pdfUrl,
    rfpLoading 
  } = useRFP();
  
  const { localFileName, handleFileChange, handleReupload } = useRFPUpload();
  
  const [selectedChunk, setSelectedChunk] = useState(null);
  const [isChunkModalOpen, setIsChunkModalOpen] = useState(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
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

  // Prevent body scroll when any modal is open
  useEffect(() => {
    if (isChunkModalOpen || isPdfModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isChunkModalOpen, isPdfModalOpen]);

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
      <ChunkModal
        isOpen={isChunkModalOpen}
        onClose={() => setIsChunkModalOpen(false)}
        chunk={selectedChunk}
        onViewInPdf={handleViewInPdf}
      />

      <PDFViewerModal
        key={`${pdfModalData.pageNumber}-${pdfModalData.title}-${Date.now()}`}
        isOpen={isPdfModalOpen}
        onClose={handleClosePdfModal}
        pdfUrl={pdfUrl}
        targetPage={pdfModalData.pageNumber}
        highlightTitle={pdfModalData.title}
        highlightContent={pdfModalData.content}
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
          <Container fluid className="p-0">
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

                    {!rfpLoading && rfpData && (
                      <button
                        className="flex cursor-default items-center gap-1 rounded-[10px] border-none bg-[#3E1067] px-3.5 py-2 text-[0.8rem] text-white transition-all"
                        type="button"
                      >
                        <img src="/images/LYA SYMBOL.svg" alt="" className="h-3 w-3 object-contain" />
                        LYA Prediction
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
          </Container>
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
