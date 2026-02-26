// src/controllers/master/RuleConfigureController.js

import {
  GetDataFromApiServerAsync_AXIOS,
  PostDataToApiServerAsync_AXIOS,
} from "../../../../common/CommonDB";

// Hardcoded values (replace when auth is implemented)
const HARDCODED_COMPANY_UUID = "company_003";
const HARDCODED_POSTED_BY = "Hunar";

/**
 * GET: Fetch all rules for a specific company
 * @param {string} companyUUID 
 * @returns {Promise<Array>}
 */
export const fetchRuleConfigure = async (companyUUID) => {
  try {
    const response = await GetDataFromApiServerAsync_AXIOS(
      `master/Select_RuleConfigure/${companyUUID}`
    );
    return response || [];
  } catch (error) {
    console.error("Error fetching RuleConfigure:", error);
    return [];
  }
};

/**
 * POST: Create or Update a Rule
 * @param {Object} data - Form data with required fields
 * @returns {Promise<Object>}
 */
export const PostRuleConfigure = async (data) => {
  const isCreateMode = !data.sysRuleUUID || data.sysRuleUUID === "0";

  const payload = {
    sysCompanyUUID: HARDCODED_COMPANY_UUID || data.sysCompanyUUID,
    sysRuleUUID: data.sysRuleUUID || "0",
    RuleName: data.RuleName,
    Description: data.Description,
    PriorityLevel: parseInt(data.PriorityLevel, 10),
    // ✅ CREATE: force defaults | UPDATE: use form values
    IsActive: isCreateMode ? true : (data.IsActive ?? true),
    Status: isCreateMode ? "Active" : (data.Status || "Active"),
    Postedby: HARDCODED_POSTED_BY || data.Postedby,
  };

  try {
    const response = await PostDataToApiServerAsync_AXIOS(
      "master/Post_RuleConfigure/",
      payload
    );
    return response?.data || response;
  } catch (error) {
    console.error("PostRuleConfigure Error:", error);
    return {
      success: false,
      error: error.message || "Failed to save rule",
    };
  }
};

/**
 * Status options for dropdown (exported for UI convenience)
 */
export const RuleStatus_Options = [
  { value: "Active", label: "Active", color: "green" },
  { value: "Inactive", label: "Inactive", color: "red" },
  { value: "Hold", label: "Hold", color: "orange" },
];
