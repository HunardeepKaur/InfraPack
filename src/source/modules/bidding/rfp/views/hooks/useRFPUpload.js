import { useEffect, useState } from "react";
import { uploadRFPDocument } from "../../controllers/RFPController";
import { runPredictionPipeline } from "../../controllers/PredictionController";
import { useRFP } from "../../context/RFPContext";
import { appToast } from "../../../../../../components/shared/toast/appToast";

export const useRFPUpload = () => {
  const {
    setRfpData,
    setProcessedChunks,
    setFileName,
    fileName,
    pdfUrl,
    setPdfUrl,
    setRfpLoading,
    setPredictionResult,
    setPredictionLoading,
    setPredictionError,
  } = useRFP();

  const [localFileName, setLocalFileName] = useState(fileName || "");

  useEffect(() => {
    setLocalFileName(fileName || "");
  }, [fileName]);

  const processRFP = async (file) => {
    setRfpLoading(true);
    setPredictionResult(null);
    setPredictionError(null);

    try {
      console.log("Step 1: Uploading RFP for display...");
      const result = await uploadRFPDocument(file);
      const rfpResult = result?.result || {};
      const hasData = Boolean(
        rfpResult?.rfp_data &&
          typeof rfpResult.rfp_data === "object" &&
          Object.keys(rfpResult.rfp_data).length > 0,
      );
      const hasChunks =
        Array.isArray(rfpResult?.processed_chunks) &&
        rfpResult.processed_chunks.length > 0;

      if (result?.ack === "RFP processed successfully" && (hasData || hasChunks)) {
        setRfpData(rfpResult.rfp_data || null);
        setProcessedChunks(rfpResult.processed_chunks || []);
        setFileName(file.name);
        setLocalFileName(file.name);
        appToast.success("RFP uploaded and extracted successfully.");

        if (!pdfUrl) {
          const url = URL.createObjectURL(file);
          setPdfUrl(url);
        }

        console.log("Step 2: Starting prediction pipeline in background...");
        void runPredictionInBackground(file);

        return true;
      }

      throw new Error(result?.ack || "Failed to process RFP");
    } catch (error) {
      console.error("RFP Processing Error:", error);
      appToast.error(error.message || "Failed to process RFP");
      setFileName("");
      setLocalFileName("");
      return false;
    } finally {
      setRfpLoading(false);
    }
  };

  const runPredictionInBackground = async (file) => {
    setPredictionLoading(true);

    try {
      console.log("Background prediction: Starting pipeline...");
      const prediction = await runPredictionPipeline(file);

      console.log("Background prediction: Received result", prediction);
      setPredictionResult(prediction);
      setPredictionError(null);

      appToast.success("LYA Prediction ready!", {
        duration: 3000,
      });
    } catch (error) {
      console.error("Background prediction failed:", error);
      setPredictionError(error.message || "Failed to get prediction");
      setPredictionResult(null);

      appToast.error("Prediction failed, but RFP data is still available", {
        duration: 4000,
      });
    } finally {
      setPredictionLoading(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      appToast.error("Please upload a PDF file");
      return;
    }

    setLocalFileName(file.name);

    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
    }

    const url = URL.createObjectURL(file);
    setPdfUrl(url);

    try {
      await processRFP(file);
    } finally {
      e.target.value = "";
    }
  };

  const handleReupload = () => {
    setLocalFileName("");
    setRfpData(null);
    setProcessedChunks([]);
    setFileName("");
    setPredictionResult(null);
    setPredictionLoading(false);
    setPredictionError(null);

    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
    }

    const fileInput = document.getElementById("file-upload");
    if (fileInput) {
      fileInput.value = "";
      fileInput.click();
    }
  };

  return {
    localFileName,
    handleFileChange,
    handleReupload,
  };
};
