import { useEffect, useState } from 'react';
import { uploadRFPDocument } from '../../controllers/RFPController';
import toast from 'react-hot-toast';
import { useRFP } from '../../context/RFPContext';

export const useRFPUpload = () => {
  const { 
    setRfpData, 
    setProcessedChunks, 
    setFileName, 
    fileName,
    pdfUrl,
    setPdfUrl, 
    setRfpLoading 
  } = useRFP();
  
  const [localFileName, setLocalFileName] = useState(fileName || '');

  useEffect(() => {
    setLocalFileName(fileName || '');
  }, [fileName]);

  const processRFP = async (file) => {
    setRfpLoading(true);
    try {
      const result = await uploadRFPDocument(file);
      const rfpResult = result?.result || {};
      const hasData = Boolean(
        rfpResult?.rfp_data &&
        typeof rfpResult.rfp_data === 'object' &&
        Object.keys(rfpResult.rfp_data).length > 0
      );
      const hasChunks = Array.isArray(rfpResult?.processed_chunks) && rfpResult.processed_chunks.length > 0;

      if (result?.ack === "RFP processed successfully" && (hasData || hasChunks)) {
        setRfpData(rfpResult.rfp_data || null);
        setProcessedChunks(rfpResult.processed_chunks || []);
        setFileName(file.name);
        setLocalFileName(file.name);
        
        // Ensure PDF URL is set (should already be set, but just in case)
        if (!pdfUrl) {
          const url = URL.createObjectURL(file);
          setPdfUrl(url);
        }
        
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            toast.success('RFP processed successfully!');
          });
        });
        return true;
      } else {
        throw new Error(result?.ack || 'Failed to process RFP');
      }
    } catch (error) {
      console.error('RFP Processing Error:', error);
      toast.error(error.message || 'Failed to process RFP');
      setFileName('');
      setLocalFileName('');
      return false;
    } finally {
      setRfpLoading(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.type !== 'application/pdf') {
      toast.error('Please upload a PDF file');
      return;
    }

    setLocalFileName(file.name);
    
    // Clean up old URL if it exists
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
    }
    
    const url = URL.createObjectURL(file);
    setPdfUrl(url);
    
    await processRFP(file);
  };

  const handleReupload = () => {
    setLocalFileName('');
    setRfpData(null);
    setProcessedChunks([]);
    setFileName('');
    
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
    }
    
    document.getElementById('file-upload')?.click();
  };

  return {
    localFileName,
    handleFileChange,
    handleReupload
  };
};