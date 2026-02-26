import React from 'react';
import { FiFile, FiX, FiEye } from 'react-icons/fi';

const themeColor = '#3E1067';

export const ChunkModal = ({ isOpen, onClose, chunk, onViewInPdf }) => {
  if (!isOpen || !chunk) return null;

  const pageNumber = chunk.metadata?.page || 1;

  const handleViewInPdf = () => {
    if (onViewInPdf) {
      onViewInPdf(pageNumber, chunk.metadata?.title, chunk.text);
    }
  };

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
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div 
        style={{
          width: '680px',
          maxWidth: '90%',
          height: '560px',
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          boxShadow: '0 20px 40px -12px rgba(62, 16, 103, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid #f0f2f5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              backgroundColor: `rgba(62, 16, 103, 0.05)`,
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: themeColor
            }}>
              <FiFile size={18} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <h3 style={{
                  margin: 0,
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  color: '#1a1e24',
                }}>
                  {chunk.metadata?.title || 'Document Page'}
                </h3>
                
                {onViewInPdf && (
                  <button
                    onClick={handleViewInPdf}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 12px',
                      backgroundColor: themeColor,
                      border: 'none',
                      borderRadius: '16px',
                      fontSize: '0.7rem',
                      color: 'white',
                      cursor: 'pointer',
                      fontWeight: 500,
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#5a2d8c';
                      e.currentTarget.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = themeColor;
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    <FiEye size={12} />
                    View in PDF
                  </button>
                )}
              </div>
              <div style={{
                display: 'flex',
                gap: '8px',
                marginTop: '2px',
                fontSize: '0.7rem',
                color: '#8a94a6',
              }}>
                <span>Page {pageNumber}</span>
                {chunk.text && (
                  <span>• {chunk.text.length} characters</span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              border: 'none',
              backgroundColor: '#f5f7fa',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#8a94a6',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#edf2f7';
              e.currentTarget.style.color = themeColor;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#f5f7fa';
              e.currentTarget.style.color = '#8a94a6';
            }}
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px 24px',
          backgroundColor: '#ffffff',
          fontFamily: "'Inter', sans-serif",
        }}>
          <div style={{
            color: '#2d3a4a',
            fontSize: '0.9rem',
            lineHeight: '1.5'
          }}>
            {chunk.text?.split('\n').map((paragraph, index) => {
              const isHeader = paragraph.match(/^[A-Z][A-Z\s]+:$/) || 
                               paragraph.startsWith('#') ||
                               paragraph.includes('**');
              
              if (isHeader) {
                return (
                  <div key={index} style={{
                    color: themeColor,
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    marginTop: '16px',
                    marginBottom: '8px',
                  }}>
                    {paragraph.replace(/\*\*/g, '').replace(/#/g, '').trim()}
                  </div>
                );
              }

              if (paragraph.trim().match(/^[•\-]\s/) || paragraph.trim().match(/^\d+\.\s/)) {
                return (
                  <div key={index} style={{
                    display: 'flex',
                    gap: '8px',
                    marginBottom: '4px',
                    paddingLeft: '8px'
                  }}>
                    <span style={{ color: themeColor }}>
                      {paragraph.trim().match(/^\d+\./) ? paragraph.trim().split('.')[0] + '.' : '•'}
                    </span>
                    <span style={{ flex: 1, color: '#4a5a6e' }}>
                      {paragraph.replace(/^[•\-]\s|^\d+\.\s/, '')}
                    </span>
                  </div>
                );
              }

              if (!paragraph.trim()) {
                return <div key={index} style={{ height: '8px' }} />;
              }

              return (
                <p key={index} style={{
                  marginBottom: '10px',
                  color: '#4a5a6e'
                }}>
                  {paragraph}
                </p>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};