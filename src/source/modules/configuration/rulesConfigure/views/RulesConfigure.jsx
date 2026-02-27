// src/pages/RulesConfigure.jsx

import React, { useState, useMemo, useEffect } from "react";
import PageHeaderV2 from "../../../../../components/shared/pageHeader/PageHeaderV2";
import { FiPlus, FiEdit3, FiX, FiCheckCircle, FiClock, FiAlertCircle } from "react-icons/fi";
import { FaSpinner } from "react-icons/fa";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import {
  fetchRuleConfigure,
  PostRuleConfigure,
  RuleStatus_Options,
} from "../controllers/RuleConfigureController";
import { appToast } from "../../../../../components/shared/toast/appToast";

const COMPANY_UUID = "company_003"; // Replace with auth context later

const RulesConfigure = () => {
  const themeColor = "#3E1067";

  const [loading, setLoading] = useState(true);
  const [rules, setRules] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    sysRuleUUID: "0",
    RuleName: "",
    Description: "",
    PriorityLevel: 1,
    IsActive: true,
    Status: "Active",
  });

  const isEditMode = !!editingRule;

  // Load rules on mount
  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    setLoading(true);
    try {
      const data = await fetchRuleConfigure(COMPANY_UUID);
      const formatted = data.map((rule) => ({
        ...rule,
        id: rule.sysRuleUUID || rule.sysruleuuid,
        name: rule.RuleName || rule.rulename,
        description: rule.Description || rule.description,
        priority: rule.PriorityLevel || rule.prioritylevel,
        isActive: rule.IsActive ?? rule.isactive ?? true,
        status: rule.Status || rule.status || "Active",
      }));
      setRules(formatted);
    } catch (error) {
      console.error("Failed to load rules:", error);
      appToast.error("Failed to load rules. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const breadcrumbList = [
    { folderName: "Home", path: "/" },
    { pageName: "Rules Configure" },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const nextValue = name === "PriorityLevel" ? parseInt(value, 10) || 1 : value;
      const nextState = {
        ...prev,
        [name]: nextValue,
      };

      // Keep IsActive synced only for explicit Active/Inactive status changes.
      if (name === "Status") {
        const normalized = String(value || "").toLowerCase();
        if (normalized === "active") nextState.IsActive = true;
        if (normalized === "inactive") nextState.IsActive = false;
      }

      return nextState;
    });
  };

  const openCreate = () => {
    setEditingRule(null);
    setFormData({
      sysRuleUUID: "0",
      RuleName: "",
      Description: "",
      PriorityLevel: 1,
      IsActive: true,
      Status: "Active",
    });
    setShowForm(true);
  };

  const openEdit = (rule) => {
    setEditingRule(rule);
    setFormData({
      sysRuleUUID: rule.id || rule.sysRuleUUID || rule.sysruleuuid,
      RuleName: rule.name || rule.RuleName || rule.rulename,
      Description: rule.description || rule.Description || rule.description,
      PriorityLevel: parseInt(rule.priority || rule.PriorityLevel || rule.prioritylevel, 10) || 1,
      IsActive: rule.isActive ?? rule.IsActive ?? rule.isactive ?? true,
      Status: rule.status || rule.Status || "Active",
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formData.RuleName?.trim()) {
      appToast.error("Rule Name is required");
      return;
    }
    if (!formData.Description?.trim()) {
      appToast.error("Description is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await PostRuleConfigure(formData);

      if (result && !result.error) {
        appToast.success(isEditMode ? "Rule updated successfully!" : "Rule created successfully!");
        await loadRules();
        setShowForm(false);
        setEditingRule(null);
      } else {
        appToast.error("Error: " + (result?.error || "Failed to save rule"));
      }
    } catch (error) {
      console.error("Save error:", error);
      appToast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingRule(null);
  };

  // Helper functions for badges
  const getPriorityBadge = (priority) => {
    if (priority <= 3) {
      return {
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        icon: FiCheckCircle,
        label: "Low"
      };
    } else if (priority <= 6) {
      return {
        bg: "bg-amber-50",
        text: "text-amber-700",
        icon: FiClock,
        label: "Medium"
      };
    } else {
      return {
        bg: "bg-rose-50",
        text: "text-rose-700",
        icon: FiAlertCircle,
        label: "High"
      };
    }
  };

  const getStatusColor = (status) => {
    const opt = RuleStatus_Options.find((o) => o.value === status);
    if (opt?.color === "green") return "bg-emerald-50 text-emerald-700";
    if (opt?.color === "orange") return "bg-amber-50 text-amber-700";
    if (opt?.color === "red") return "bg-rose-50 text-rose-700";
    return "bg-gray-50 text-gray-600";
  };

  // Column Definitions
  const [colDefs] = useState([
    {
      headerName: "",
      colId: "action",
      width: 60,
      minWidth: 60,
      maxWidth: 60,
      sortable: false,
      filter: false,
      resizable: false,
      cellClass: "flex items-center justify-center",
      cellRenderer: (params) => (
        <div className="flex items-center justify-center h-full w-full">
          <button
            onClick={() => openEdit(params.data)}
            className="bg-transparent border-none text-gray-400 cursor-pointer flex items-center justify-center p-1.5 rounded-lg hover:bg-[#3E1067]/5 hover:text-[#3E1067] transition-all"
            title="Edit Rule"
          >
            <FiEdit3 size={14} />
          </button>
        </div>
      ),
    },
    {
      headerName: "Rule Name",
      field: "name",
      flex: 2,
      minWidth: 180,
      cellRenderer: (params) => (
        <div className="flex items-center h-full font-medium text-gray-800 text-sm">
          {params.value || "-"}
        </div>
      ),
    },
    {
      headerName: "Description",
      field: "description",
      flex: 3,
      minWidth: 250,
      cellRenderer: (params) => (
        <div className="flex items-center h-full text-gray-500 text-xs leading-relaxed">
          {params.value || "-"}
        </div>
      ),
    },
    {
      headerName: "Priority",
      field: "priority",
      width: 120,
      minWidth: 120,
      cellRenderer: (params) => {
        const badge = getPriorityBadge(params.value);
        const Icon = badge.icon;
        return (
          <div className="flex items-center h-full">
            <div className={`${badge.bg} ${badge.text} px-2.5 py-1 rounded-full text-[0.65rem] font-medium flex items-center gap-1`}>
              <Icon size={10} />
              <span>P{params.value} · {badge.label}</span>
            </div>
          </div>
        );
      },
    },
    {
      headerName: "Status",
      field: "status",
      width: 110,
      minWidth: 110,
      cellRenderer: (params) => (
        <div className="flex items-center h-full">
          <div className={`${getStatusColor(params.value)} px-2.5 py-1 rounded-full text-[0.65rem] font-medium`}>
            {params.value || "Active"}
          </div>
        </div>
      ),
    },
  ]);

  const defaultColDef = useMemo(() => ({
    filter: false,
    sortable: true,
    resizable: true,
    suppressHeaderMenuButton: true,
    suppressHeaderFilterButton: true,
  }), []);

  return (
    <div className="h-screen flex flex-col bg-white font-sans overflow-hidden">
      <style>{`
        ::-webkit-scrollbar {
          width: 4px;
          height: 4px;
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
        
        .spinner { 
          animation: spin 0.8s linear infinite; 
        }
        
        @keyframes spin { 
          from { transform: rotate(0deg); } 
          to { transform: rotate(360deg); } 
        }

        /* AG Grid theme overrides */
        .ag-theme-alpine {
          --ag-header-height: 48px;
          --ag-header-foreground-color: #64748b;
          --ag-header-background-color: #ffffff;
          --ag-font-size: 12px;
          --ag-font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          --ag-border-color: #edf2f7;
          --ag-secondary-border-color: #edf2f7;
          --ag-row-border-color: #edf2f7;
          --ag-row-hover-color: rgba(62, 16, 103, 0.02);
          --ag-foreground-color: #334155;
          --ag-data-color: #1f2937;
          --ag-background-color: #ffffff;
          --ag-odd-row-background-color: #ffffff;
        }
        
        .ag-theme-alpine .ag-root-wrapper {
          border: none;
          border-radius: 0;
          overflow: hidden;
          height: 100%;
        }

        .ag-theme-alpine .ag-root-wrapper-body {
          min-height: 0;
        }

        .ag-theme-alpine .ag-header {
          border-bottom: 1px solid #edf2f7;
        }
        
        .ag-theme-alpine .ag-header-cell {
          font-weight: 600;
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          color: #64748b;
        }

        .ag-theme-alpine .ag-header-cell:first-child {
          padding-left: 8px;
        }

        .ag-theme-alpine .ag-header-cell-menu-button,
        .ag-theme-alpine .ag-header-cell-filter-button {
          display: none !important;
        }
        
        .ag-theme-alpine .ag-row {
          border-bottom: 1px solid #edf2f7;
          transition: background-color 0.2s ease;
        }
        
        .ag-theme-alpine .ag-row:hover {
          background-color: rgba(62, 16, 103, 0.02);
        }
        
        .ag-theme-alpine .ag-cell {
          display: flex;
          align-items: center;
          border-right: 1px solid #edf2f7;
        }

        .ag-theme-alpine .ag-cell:last-child {
          border-right: none;
        }

        .ag-theme-alpine .ag-paging-panel {
          border-top: 1px solid #edf2f7;
          color: #64748b;
          font-size: 12px;
          font-weight: 500;
          padding: 12px;
          min-height: 46px;
          display: flex;
          align-items: center;
        }

        .ag-theme-alpine .ag-paging-button {
          border-radius: 6px;
          padding: 4px;
        }

        .ag-theme-alpine .ag-paging-button:hover {
          background-color: rgba(62, 16, 103, 0.05);
        }
      `}</style>

      {/* Header - Fixed to top */}
      <div className="flex-shrink-0 bg-[#EDEEF0] border-b border-gray-300 px-6">
        <PageHeaderV2
          children={breadcrumbList}
          backButton={true}
          list={
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#3E1067] border-none rounded-lg text-sm text-white cursor-pointer font-medium transition-all hover:bg-[#5a2d8c] hover:-translate-y-0.5 hover:shadow-lg"
              style={{ boxShadow: '0 4px 8px rgba(62, 16, 103, 0.2)' }}
            >
              <FiPlus size={14} />
              New Rule
            </button>
          }
        />
      </div>

      {/* Content Section - Directly connected to header */}
      <div className="flex-1 flex flex-col min-h-0 bg-white">
        <div className="flex-1 overflow-hidden">
          <div className="h-full flex flex-col">
            {/* Section Header */}
            <div className="px-6 py-4 border-b border-gray-200 bg-white flex-shrink-0">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <div className="w-[3px] h-4 rounded-sm" style={{ backgroundColor: themeColor }} />
                  <span className="text-sm font-semibold text-gray-800">Rules</span>
                </div>
                <span className="bg-[#3E1067]/5 text-[#3E1067] px-2.5 py-1 rounded-full text-[0.7rem] font-medium">
                  {rules.length} total
                </span>
              </div>
            </div>

            {/* Grid Container */}
            <div className="ag-theme-alpine w-full flex-1 min-h-0 bg-white">
              <AgGridReact
                rowData={rules}
                loading={loading}
                columnDefs={colDefs}
                defaultColDef={defaultColDef}
                theme="legacy"
                pagination={true}
                paginationPageSize={10}
                domLayout="normal"
                suppressRowClickSelection={true}
                animateRows={true}
                headerHeight={48}
                rowHeight={52}
                overlayNoRowsTemplate={loading ? "" : "<span style='color:#64748b;font-size:0.85rem;display:flex;justify-content:center;padding:40px;'>No rules configured</span>"}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showForm && (
        <div 
          className="fixed inset-0 bg-white/70 backdrop-blur-sm z-[10000] flex items-center justify-center p-5"
          onClick={cancelForm}
        >
          <div 
            className="w-[520px] max-w-[90%] bg-white rounded-2xl shadow-2xl overflow-hidden"
            style={{ boxShadow: '0 25px 50px -12px rgba(62, 16, 103, 0.25)' }}
            onClick={(e) => e.stopPropagation()}
          >
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-[#3E1067]/5 rounded-xl flex items-center justify-center text-[#3E1067]">
                  {isEditMode ? <FiEdit3 size={16} /> : <FiPlus size={16} />}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-800">
                    {isEditMode ? 'Edit Rule' : 'Create new rule'}
                  </h3>
                  <p className="text-[0.7rem] text-gray-400 mt-0.5">
                    {isEditMode ? 'Update the rule details below' : 'Add a new rule to the configuration'}
                  </p>
                </div>
              </div>
              <button
                onClick={cancelForm}
                className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-[#3E1067] transition-all"
              >
                <FiX size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              
              {/* Rule Name */}
              <div className="mb-5">
                <label className="block text-[0.7rem] font-semibold uppercase tracking-wide text-gray-400 mb-1.5">
                  Rule name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="RuleName"
                  value={formData.RuleName}
                  onChange={handleInputChange}
                  placeholder="e.g., Auto-approve low value RFPs"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-800 outline-none transition-all focus:border-[#3E1067] focus:bg-white focus:shadow-[0_0_0_3px_rgba(62,16,103,0.1)]"
                  autoFocus={!isEditMode}
                />
              </div>

              {/* Description */}
              <div className="mb-5">
                <label className="block text-[0.7rem] font-semibold uppercase tracking-wide text-gray-400 mb-1.5">
                  Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  name="Description"
                  value={formData.Description}
                  onChange={handleInputChange}
                  placeholder="Describe what this rule does..."
                  rows="3"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-800 outline-none resize-none transition-all focus:border-[#3E1067] focus:bg-white focus:shadow-[0_0_0_3px_rgba(62,16,103,0.1)]"
                />
              </div>

              {/* Priority */}
              <div className="mb-5">
                <label className="block text-[0.7rem] font-semibold uppercase tracking-wide text-gray-400 mb-1.5">
                  Priority level <span className="text-rose-500">*</span>
                </label>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <div className="flex items-center gap-4 mb-2">
                    <input
                      type="range"
                      name="PriorityLevel"
                      min="1"
                      max="10"
                      value={formData.PriorityLevel}
                      onChange={handleInputChange}
                      className="flex-1 h-1 rounded-lg accent-[#3E1067]"
                    />
                    <div className="min-w-[48px] h-9 bg-white rounded-lg flex items-center justify-center text-[#3E1067] font-semibold text-sm border border-gray-100">
                      {formData.PriorityLevel}
                    </div>
                  </div>
                  <div className="flex justify-between px-1">
                    <span className="text-[0.65rem] text-gray-400">Low (1)</span>
                    <span className="text-[0.65rem] text-gray-400">High (10)</span>
                  </div>
                </div>
              </div>

              {/* Status: ONLY SHOW IN EDIT MODE */}
              {isEditMode && (
                <>
                  {/* Status Dropdown */}
                  <div className="mb-6">
                    <label className="block text-[0.7rem] font-semibold uppercase tracking-wide text-gray-400 mb-1.5">
                      Workflow Status
                    </label>
                    <select
                      name="Status"
                      value={formData.Status}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-700 outline-none focus:border-[#3E1067] focus:bg-white focus:shadow-[0_0_0_3px_rgba(62,16,103,0.1)] cursor-pointer"
                    >
                      {RuleStatus_Options.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {/* Create mode hint */}
              {!isEditMode && (
                <div className="mb-6 px-3 py-2 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-[0.7rem] text-blue-700">
                    <span className="font-semibold">Note:</span> New rules are created with "Active" status by default.
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end mt-2">
                <button
                  onClick={cancelForm}
                  className="px-5 py-2 bg-transparent border border-gray-100 rounded-xl text-xs font-medium text-gray-500 hover:bg-gray-50 hover:border-gray-300 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSubmitting || !formData.RuleName?.trim() || !formData.Description?.trim()}
                  className={`px-6 py-2 bg-[#3E1067] rounded-xl text-xs font-medium text-white transition-all flex items-center gap-2 ${
                    isSubmitting || !formData.RuleName?.trim() || !formData.Description?.trim()
                      ? 'opacity-60 cursor-not-allowed' 
                      : 'hover:bg-[#5a2d8c] hover:-translate-y-0.5 hover:shadow-lg'
                  }`}
                  style={!isSubmitting && formData.RuleName?.trim() && formData.Description?.trim() ? { boxShadow: '0 4px 8px rgba(62, 16, 103, 0.2)' } : {}}
                >
                  {isSubmitting && <FaSpinner className="spinner" size={12} />}
                  {isSubmitting ? 'Saving...' : (isEditMode ? 'Update Rule' : 'Create Rule')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RulesConfigure;
