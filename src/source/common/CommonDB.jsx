import axios from "axios";
import { GetSessionTokenData } from "../common/common";

export const apiServerUrl = import.meta.env.VITE_DEV_UAT_URL;
// export const apiServerUrl = import.meta.env.VITE_DEV_LOCAL_URL;
export const rfpApiUrl = import.meta.env.VITE_RFP_API_URL;

export const PostDataToApiServerAsync_AXIOS = async (_ApiMethod, bodyData) => {
  const axiosConfig = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  try {
    const response = await axios.post(
      apiServerUrl + _ApiMethod,
      bodyData,
      axiosConfig,
    );
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios error:", error.message);
    } else {
      console.error("Unexpected error:", error);
    }
    throw error;
  }
};

export const GetDataFromApiServerAsync_AXIOS = (_ApiMethod) => {
  return axios
    .get(apiServerUrl + _ApiMethod)
    .then((res) => res.data)
    .catch((error) => {
      console.error(error);
    });
};

export const PostDataToApiServer_WithAuth_Async_AXIOS = async (
  _ApiMethod,
  bodyData,
) => {
  const _tokenData = await GetSessionTokenData();
  // console.log("_tokenData", bodyData);
  const axiosConfig = {
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + _tokenData,
    },
  };

  try {
    const response = await axios.post(
      apiServerUrl + _ApiMethod,
      bodyData,
      axiosConfig,
    );
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios error:", error.message);
    } else {
      console.error("Unexpected error:", error);
    }
    throw error;
  }
};

//formdata_fordocUpload

export const PostDataToApiServer_WithAuth_Async_AXIOS_FormData = async (
  _ApiMethod,
  bodyData,
) => {
  const _tokenData = await GetSessionTokenData();
  // console.log("_tokenData", bodyData);
  const axiosConfig = {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: "Bearer " + _tokenData,
    },
  };

  try {
    const response = await axios.post(
      apiServerUrl + _ApiMethod,
      bodyData,
      axiosConfig,
    );
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios error:", error.message);
    } else {
      console.error("Unexpected error:", error);
    }
    throw error;
  }
};

export const PostDataToApiServer_WithAuth_Async_AXIOS_FileFormData = async (
  _ApiMethod,
  bodyData,
  config = {},
) => {
  const _tokenData = await GetSessionTokenData();
  // console.log("_tokenData", bodyData);
  const axiosConfig = {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: "Bearer " + _tokenData,
    },
    ...config,
  };

  try {
    const response = await axios.post(
      apiServerUrl + _ApiMethod,
      bodyData,
      axiosConfig,
    );
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios error:", error.message);
    } else {
      console.error("Unexpected error:", error);
    }
    throw error;
  }
};

export const GetDataFromApiServer_WithAuth_Async_AXIOS = async (_ApiMethod) => {
  const _tokenData = await GetSessionTokenData();
  // console.log("_tokenData", _tokenData);
  let config = {
    method: "get",
    maxBodyLength: Infinity,
    url: apiServerUrl + _ApiMethod, //apiServerUrl + _ApiMethod,
    headers: {
      Authorization: "Bearer " + _tokenData,
    },
  };
  return await axios
    .request(config)
    .then((res) => res.data)
    .catch((error) => {
      console.error(error);
    });
};

export const FilterLeadData = async (data) => {
  // ✅ Only keep the required fields
  // const allowedKeys = [
  //   "projectName",
  //   "serviceType",
  //   "projectLocation",
  //   "projectFeature",
  //   "businesSunit",
  //   "sector",
  //   "proposalType",
  //   "buHead",
  //   "dy_BUHead",
  //   "bidManager",
  //   "proposalHead",
  //   "country",
  //   "state",
  //   "sysClientContactUUid",
  //   "clientInterface",
  // ];

  const allowedKeys = ["projectName", "projectDescription"];

  console.log("__allowedKeys__", allowedKeys);
  // ✅ Filter the data object to only include those keys
  const filteredData = Object.keys(data)
    .filter((key) => allowedKeys.includes(key))
    .reduce((obj, key) => {
      obj[key] = data[key] ?? "";
      return obj;
    }, {});

  console.log("Filtered Query Params:", filteredData);

  try {
    const response = await axios.get(apiServerUrl + "crm/GetLeads_FilterWise", {
      params: filteredData,
    });
    return response.data;
  } catch (error) {
    console.error("API Error:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Upload RFP PDF to external RFP processing API
 * @param {FormData} formData - FormData containing the PDF file with key 'file'
 * @returns {Promise<Object>} Extracted RFP data with confidence scores
 */
export const PostDataToRFPApi_Async_AXIOS = async (formData) => {
  const axiosConfig = {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  };

  try {
    const response = await axios.post(
      `${rfpApiUrl}/v1/rfp/upload`,
      formData,
      axiosConfig
    );
    
    console.log("RFP API Response:", response.data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("RFP API Axios error:", error.message);
      console.error("RFP API Error Response:", error.response?.data);
      throw new Error(
        error.response?.data?.ack || 
        error.response?.data?.error || 
        "Failed to process RFP document"
      );
    } else {
      console.error("RFP API Unexpected error:", error);
      throw error;
    }
  }
};