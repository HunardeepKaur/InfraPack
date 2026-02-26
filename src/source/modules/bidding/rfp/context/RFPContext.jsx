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
  };

  return (
    <RFPContext.Provider
      value={{
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
      }}
    >
      {children}
    </RFPContext.Provider>
  );
};