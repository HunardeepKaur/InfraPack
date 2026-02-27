import axios from "axios";
import { apiServerUrl, rfpApiUrl } from "../../../../common/CommonDB";

// API Endpoints
const RAW_EXTRACT_API = `${rfpApiUrl}/v1/raw-data/extract?file`;
const PREDICT_API = `${rfpApiUrl}/v1/predictor/predict`;
const RULE_CONFIG_API = `${apiServerUrl}master/Select_RuleConfigure`;
const DEFAULT_COMPANY_ID =  "company_003";

const normalizeRuleStatus = (rule) => {
  const raw = String(rule?.status || rule?.result || rule?.prediction || "").toLowerCase();
  if (raw === "passed" || raw === "failed" || raw === "review") return raw;
  if (raw === "match" || raw === "matched" || raw === "true") return "passed";
  if (raw === "no_match" || raw === "not_match" || raw === "false") return "failed";
  if (rule?.matched === true) return "passed";
  if (rule?.matched === false) return "failed";
  return "review";
};

const normalizePredictionResponse = (apiData) => {
  // Keep backward compatibility if API already returns old shape.
  if (!apiData?.overall) return apiData;

  const perRule = Array.isArray(apiData.per_rule) ? apiData.per_rule : [];
  const getNestedRule = (rule) =>
    Array.isArray(rule?.rule_breakdown) && rule.rule_breakdown.length > 0
      ? rule.rule_breakdown[0]
      : null;
  const getRuleId = (rule, idx) =>
    getNestedRule(rule)?.id ||
    rule?.rule_id ||
    rule?.id ||
    rule?.rule_key ||
    `rule_${idx + 1}`;
  const getRuleDescription = (rule) =>
    rule?.rule_description ||
    rule?.rule_text ||
    rule?.rule ||
    rule?.description ||
    getNestedRule(rule)?.description ||
    "";
  const getRuleExplanation = (rule) =>
    rule?.explanation ||
    rule?.message ||
    rule?.reason ||
    rule?.match_reason ||
    getNestedRule(rule)?.explanation ||
    rule?.details ||
    "";

  const rule_breakdown = perRule.map((rule, idx) => {
    const nestedRule = getNestedRule(rule);
    const status = normalizeRuleStatus(rule);
    return {
      id: getRuleId(rule, idx),
      status: nestedRule?.status || status,
      score_contribution: Number(
        nestedRule?.score_contribution ??
          rule?.score_contribution ??
          rule?.contribution ??
          rule?.score ??
          rule?.match_percentage ??
          0,
      ),
      description: getRuleDescription(rule),
      explanation: getRuleExplanation(rule),
    };
  });

  const toReason = (rule, idx) => ({
    rule_id: getRuleId(rule, idx),
    description: getRuleDescription(rule),
    explanation: getRuleExplanation(rule) || getRuleDescription(rule),
  });

  const detailed_reasons = {
    passed: perRule
      .map((rule, idx) => ({ rule, idx }))
      .filter(({ rule }) => normalizeRuleStatus(rule) === "passed")
      .map(({ rule, idx }) => toReason(rule, idx)),
    failed: perRule
      .map((rule, idx) => ({ rule, idx }))
      .filter(({ rule }) => normalizeRuleStatus(rule) !== "passed")
      .map(({ rule, idx }) => toReason(rule, idx)),
  };

  return {
    ...apiData,
    prediction: apiData?.overall?.prediction || "NO_MATCH",
    match_percentage: Number(apiData?.overall?.match_percentage ?? 0),
    confidence: Number(apiData?.overall?.confidence ?? 0),
    reason: apiData?.overall?.reason || apiData?.overall?.summary || "",
    rule_breakdown,
    detailed_reasons,
  };
};

/**
 * Step 1: Extract raw text from PDF
 * @param {File} file - The uploaded PDF file
 * @returns {Promise<Object>} Raw extracted text data
 */
export const extractRawTextFromPDF = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await axios.post(RAW_EXTRACT_API, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    console.log("Raw text extraction response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error extracting raw text:", error);
    throw new Error(error.response?.data?.message || "Failed to extract raw text from PDF");
  }
};

/**
 * Step 2: Fetch rule descriptions from rules configuration API
 * @param {string} companyId - Company UUID
 * @returns {Promise<Array<string>>} Rule descriptions sorted by priority
 */
export const getRuleDescriptionsByCompany = async (companyId = DEFAULT_COMPANY_ID) => {
  try {
    const response = await axios.get(`${RULE_CONFIG_API}/${companyId}`);
    const rules = Array.isArray(response.data) ? response.data : [];

    const descriptions = rules
      .filter((rule) => rule?.isactive === true || String(rule?.status || "").toLowerCase() === "active")
      .filter((rule) => typeof rule?.description === "string" && rule.description.trim())
      .sort(
        (a, b) =>
          Number(a?.prioritylevel ?? Number.MAX_SAFE_INTEGER) -
          Number(b?.prioritylevel ?? Number.MAX_SAFE_INTEGER),
      )
      .map((rule) => rule.description.trim());

    if (descriptions.length === 0) {
      throw new Error("No valid rule descriptions found for prediction");
    }

    console.log("Using configured rule descriptions:", descriptions);
    return descriptions;
  } catch (error) {
    console.error("Error fetching configured rules:", error);
    throw new Error(
      error.response?.data?.message || error.message || "Failed to fetch rules configuration",
    );
  }
};

/**
 * Step 3: Prepare prediction payload with raw text and configured rules
 * @param {Object} rawTextData - Data from extractRawTextFromPDF
 * @param {string} companyId - Company UUID used for rule config
 * @returns {Promise<Object>} Formatted payload for prediction API
 */
export const preparePredictionPayload = async (
  rawTextData,
  companyId = DEFAULT_COMPANY_ID,
) => {
  const rules = await getRuleDescriptionsByCompany(companyId);

  // Latest API expects only rules + raw_data.
  const payload = {
    rules,
    raw_data: rawTextData.result || rawTextData,
  };

  console.log("Prepared prediction payload:", payload);
  return payload;
};

/**
 * Step 4: Call prediction API
 * @param {Object} payload - Prepared payload from preparePredictionPayload
 * @returns {Promise<Object>} Prediction result
 */
export const callPredictionApi = async (payload) => {
  try {
    console.log("Predict API request payload:", payload);
    const response = await axios.post(PREDICT_API, payload, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    const normalized = normalizePredictionResponse(response.data);
    console.log("Prediction API response:", response.data);
    console.log("Normalized prediction response:", normalized);
    return normalized;
  } catch (error) {
    console.error("Error calling prediction API:", error);
    throw new Error(error.response?.data?.message || "Failed to get prediction");
  }
};

/**
 * MAIN FUNCTION: Complete prediction pipeline
 * @param {File} file - Uploaded PDF file
 * @param {string} companyId - Company UUID used for rule config
 * @returns {Promise<Object>} Final prediction result
 */
export const runPredictionPipeline = async (file, companyId = DEFAULT_COMPANY_ID) => {
  console.log("Starting prediction pipeline with configured rules...");

  try {
    // Step 1: Extract raw text
    console.log("Step 1: Extracting raw text...");
    const rawTextData = await extractRawTextFromPDF(file);

    // Step 2: Prepare payload with configured rules
    console.log("Step 2: Preparing prediction payload...");
    const payload = await preparePredictionPayload(rawTextData, companyId);
    console.log("Predict API payload object:", payload);
    console.log("Predict API payload JSON:", JSON.stringify(payload, null, 2));

    // Step 3: Get prediction
    console.log("Step 3: Calling prediction API...");
    const predictionResult = await callPredictionApi(payload);

    console.log("Prediction pipeline completed successfully!");
    return predictionResult;
  } catch (error) {
    console.error("Prediction pipeline failed:", error);
    throw error;
  }
};

/**
 * Export all functions individually and as a service
 */
export const PredictionService = {
  extractRawText: extractRawTextFromPDF,
  getRules: getRuleDescriptionsByCompany,
  preparePayload: preparePredictionPayload,
  getPrediction: callPredictionApi,
  runPipeline: runPredictionPipeline,
};

export default PredictionService;
