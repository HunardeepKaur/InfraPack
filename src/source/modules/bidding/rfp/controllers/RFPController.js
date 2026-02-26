import {
  PostDataToRFPApi_Async_AXIOS,
} from "../../../../common/CommonDB";

export const uploadRFPDocument = async (file) => {
  // Validate file
  if (!file) throw new Error("No file provided");
  if (file.type !== "application/pdf") throw new Error("Only PDF files are allowed");

  const formData = new FormData();
  formData.append('file', file);

  return await PostDataToRFPApi_Async_AXIOS(formData);
};