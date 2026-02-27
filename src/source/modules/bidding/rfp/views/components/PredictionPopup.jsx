import React from 'react';
import { FiX, FiCheckCircle, FiAlertCircle, FiInfo } from 'react-icons/fi';

const themeColor = '#3E1067';

const getStatusColor = (status) => {
  switch(status) {
    case 'passed': return '#10b981'; // green
    case 'failed': return '#ef4444'; // red
    case 'review': return '#f59e0b'; // amber
    default: return '#6b7280'; // gray
  }
};

const getStatusIcon = (status) => {
  switch(status) {
    case 'passed': return <FiCheckCircle size={14} color="#10b981" />;
    case 'failed': return <FiAlertCircle size={14} color="#ef4444" />;
    case 'review': return <FiInfo size={14} color="#f59e0b" />;
    default: return null;
  }
};

// Simple CSS-based progress circle component
const ProgressCircle = ({ percentage, color, size = 120, strokeWidth = 8 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;
  
  return (
    <div style={{ width: size, height: size, position: 'relative' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#edf2f7"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        fontSize: size > 80 ? '1.2rem' : '0.9rem',
        fontWeight: 600,
        color: '#1a1e24'
      }}>
        {percentage}%
      </div>
    </div>
  );
};

// Smaller circle for rules
const SmallProgressCircle = ({ percentage, color }) => {
  return (
    <div style={{ width: 60, height: 60, position: 'relative' }}>
      <svg width={60} height={60} viewBox="0 0 60 60">
        {/* Background circle */}
        <circle
          cx={30}
          cy={30}
          r={24}
          fill="none"
          stroke="#edf2f7"
          strokeWidth={4}
        />
        {/* Progress circle */}
        <circle
          cx={30}
          cy={30}
          r={24}
          fill="none"
          stroke={color}
          strokeWidth={4}
          strokeLinecap="round"
          strokeDasharray={150.72} // 2 * π * 24 ≈ 150.72
          strokeDashoffset={150.72 - (percentage / 100) * 150.72}
          transform="rotate(-90 30 30)"
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        fontSize: '0.7rem',
        fontWeight: 600,
        color: '#1a1e24'
      }}>
        {Math.round(percentage)}%
      </div>
    </div>
  );
};

const PredictionPopup = ({ isOpen, onClose, result }) => {
  if (!isOpen || !result) return null;

  const { prediction, match_percentage, detailed_reasons, rule_breakdown } = result;
  const isMatch = prediction === "MATCH";

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(6px)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div 
        style={{
          width: '800px',
          maxWidth: '95%',
          maxHeight: '80vh',
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          boxShadow: '0 25px 50px -12px rgba(62, 16, 103, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #f0f2f5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              backgroundColor: `rgba(62, 16, 103, 0.1)`,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <img src="/images/LYA SYMBOL.svg" alt="LYA" style={{ width: '20px', height: '20px' }} />
            </div>
            <div>
              <h3 style={{
                margin: 0,
                fontSize: '1.1rem',
                fontWeight: 600,
                color: '#1a1e24',
              }}>
                LYA Prediction Results
              </h3>
              <div style={{
                display: 'flex',
                gap: '8px',
                marginTop: '2px',
                fontSize: '0.7rem',
                color: '#8a94a6',
              }}>
                <span>{result.metadata?.client_name || 'Client'}</span>
                <span>•</span>
                <span>{result.metadata?.tender_id || 'Tender'}</span>
              </div>
            </div>
          </div>
          
          <button
            onClick={onClose}
            style={{
              width: '36px',
              height: '36px',
              border: 'none',
              backgroundColor: '#f5f7fa',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#8a94a6',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#fee2e2';
              e.currentTarget.style.color = '#991b1b';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#f5f7fa';
              e.currentTarget.style.color = '#8a94a6';
            }}
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px',
        }}>
          
          {/* Overall Result Card */}
          <div style={{
            background: isMatch
              ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, #ffffff 100%)'
              : 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, #ffffff 100%)',
            border: `1px solid ${isMatch ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)'}`,
            borderRadius: '18px',
            padding: '24px',
            marginBottom: '24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '14px',
            textAlign: 'center'
          }}>
            {/* Overall Progress Circle */}
            <ProgressCircle 
              percentage={match_percentage} 
              color={themeColor} 
              size={120} 
              strokeWidth={8}
            />

            {/* Overall Text */}
            <div style={{ maxWidth: '580px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                <h4 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: '#1a1e24' }}>
                  {match_percentage}% Match
                </h4>
                <span style={{
                  backgroundColor: isMatch ? '#10b981' : '#ef4444',
                  color: 'white',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  textTransform: 'uppercase'
                }}>
                  {prediction}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#4a5a6e', lineHeight: '1.5' }}>
                {result.reason || 'Prediction analysis complete'}
              </p>
            </div>
          </div>

          {/* Rule Breakdown Section */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <div style={{ width: '3px', height: '16px', backgroundColor: themeColor, borderRadius: '2px' }} />
              <h5 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: '#1a1e24' }}>
                Rule-wise Analysis
              </h5>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '12px'
            }}>
              {rule_breakdown?.map((rule, index) => {
                const status = rule.status;
                const statusColor = getStatusColor(status);
                const contribution = rule.score_contribution;
                
                // Find detailed reason for this rule
                const detail =
                  detailed_reasons?.[status === 'passed' ? 'passed' : 'failed']?.find(
                    d => d.rule_id === rule.id
                  ) || {
                    explanation: rule.explanation,
                    description: rule.description
                  };

                return (
                  <div
                    key={index}
                    style={{
                      backgroundColor: '#f9fafc',
                      border: '1px solid #edf2f7',
                      borderRadius: '12px',
                      padding: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      flexWrap: 'wrap'
                    }}
                  >
                    {/* Rule Progress Circle */}
                    <SmallProgressCircle percentage={contribution} color={statusColor} />

                    {/* Rule Details */}
                    <div style={{ flex: 1, minWidth: '200px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                        {getStatusIcon(status)}
                        <span style={{
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          color: '#1a1e24'
                        }}>
                          {rule.description || detail?.description || rule.id?.replace(/_/g, ' ') || 'Rule'}
                        </span>
                        <span style={{
                          backgroundColor: `${statusColor}15`,
                          color: statusColor,
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '0.65rem',
                          fontWeight: 500,
                          marginLeft: 'auto'
                        }}>
                          {contribution.toFixed(1)}%
                        </span>
                      </div>
                      
                      <p style={{
                        margin: 0,
                        fontSize: '0.75rem',
                        color: '#6b7280',
                        lineHeight: '1.4'
                      }}>
                        {detail?.explanation?.replace(/[✅⚠️❌]/g, '') || 
                         detail?.description || 
                         rule.description ||
                         'No additional details'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Metadata Footer */}
          <div style={{
            marginTop: '24px',
            paddingTop: '16px',
            borderTop: '1px dashed #edf2f7',
            fontSize: '0.65rem',
            color: '#9ca3af',
            display: 'flex',
            justifyContent: 'space-between'
          }}>
            <span>Analysis completed at: {new Date(result.timestamp || Date.now()).toLocaleString()}</span>
            <span>Confidence: {((result.confidence || 0) * 100).toFixed(0)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictionPopup;
