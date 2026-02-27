import React, { createContext, useContext, useState } from "react";

const RFPContext = createContext(null);

export const useRFP = () => {
  const context = useContext(RFPContext);
  if (!context) {
    throw new Error("useRFP must be used within an RFPProvider");
  }
  return context;
};

export const RFPProvider = ({ children }) => {
  const [rfpData, setRfpData] = useState(null);
  const [processedChunks, setProcessedChunks] = useState([]);
  const [fileName, setFileName] = useState("");
  const [pdfUrl, setPdfUrl] = useState(null);
  const [rfpLoading, setRfpLoading] = useState(false);
  const [currentChunk, setCurrentChunk] = useState(null);
  
  // NEW: Prediction state
  const [predictionResult, setPredictionResult] = useState(null);
  const [predictionLoading, setPredictionLoading] = useState(false);
  const [predictionError, setPredictionError] = useState(null);

  const clearRFPData = () => {
    setRfpData(null);
    setProcessedChunks([]);
    setFileName("");
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
    }
    setPdfUrl(null);
    setRfpLoading(false);
    setCurrentChunk(null);
    // NEW: Clear prediction data
    setPredictionResult(null);
    setPredictionLoading(false);
    setPredictionError(null);
  };

  return (
    <RFPContext.Provider
      value={{
        // Existing
        rfpData,
        setRfpData,
        processedChunks,
        setProcessedChunks,
        fileName,
        setFileName,
        pdfUrl,
        setPdfUrl,
        rfpLoading,
        setRfpLoading,
        currentChunk,
        setCurrentChunk,
        clearRFPData,
        
        // NEW: Prediction
        predictionResult,
        setPredictionResult,
        predictionLoading,
        setPredictionLoading,
        predictionError,
        setPredictionError,
      }}
    >
      {children}
    </RFPContext.Provider>
  );
};