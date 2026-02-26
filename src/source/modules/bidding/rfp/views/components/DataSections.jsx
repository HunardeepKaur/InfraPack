import React from 'react';
import { shouldDisplayField, formatKey, formatValue } from '../../utils/rfpHelpers';

const themeColor = '#3E1067';

const SectionItem = ({ label, value }) => (
  <div style={{
    backgroundColor: "#ffffff",
    border: "1px solid #edf2f7",
    borderRadius: "8px",
    padding: "10px",
  }}>
    <div style={{
      color: "#8a94a6",
      fontSize: "0.65rem",
      textTransform: "uppercase",
      letterSpacing: "0.3px",
      fontWeight: 600,
      marginBottom: "2px"
    }}>
      {formatKey(label)}
    </div>
    <div style={{
      color: "#1a1e24",
      fontSize: "0.85rem",
      fontWeight: 500,
      wordBreak: "break-word",
      lineHeight: "1.4"
    }}>
      {formatValue(value)}
    </div>
  </div>
);

const SectionHeader = ({ title, level }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '12px'
  }}>
    {level === 0 && (
      <div style={{
        width: '3px',
        height: '16px',
        backgroundColor: themeColor,
        borderRadius: '2px'
      }} />
    )}
    <h5 style={{
      color: level === 0 ? '#1a1e24' : '#4a5568',
      fontSize: level === 0 ? '0.9rem' : '0.85rem',
      fontWeight: 600,
      margin: 0,
    }}>
      {formatKey(title)}
    </h5>
  </div>
);

const renderSection = (sectionName, data, level = 0) => {
  if (!data || typeof data !== 'object') return null;

  const entries = Object.entries(data).filter(([, value]) => shouldDisplayField(value));
  if (entries.length === 0) return null;

  return (
    <div key={sectionName} style={{ marginBottom: '20px' }}>
      <SectionHeader title={sectionName} level={level} />
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: '8px',
        paddingLeft: level === 0 ? '8px' : 0
      }}>
        {entries.map(([key, value]) => {
          if (value && typeof value === 'object' && !Array.isArray(value)) {
            return (
              <div key={key} style={{ gridColumn: '1 / -1' }}>
                {renderSection(key, value, level + 1)}
              </div>
            );
          }
          return <SectionItem key={key} label={key} value={value} />;
        })}
      </div>
    </div>
  );
};

export const DataSections = ({ data }) => {
  if (!data || typeof data !== 'object') return null;

  const sectionOrder = ['project', 'business', 'geography', 'funding', 'client', 'tender'];
  const orderedEntries = [];
  
  sectionOrder.forEach(key => {
    if (data[key] && shouldDisplayField(data[key])) orderedEntries.push([key, data[key]]);
  });
  
  Object.entries(data)
    .filter(([key]) => !sectionOrder.includes(key) && shouldDisplayField(data[key]))
    .forEach(entry => orderedEntries.push(entry));

  return orderedEntries.map(([key, value]) => {
    if (value && typeof value === 'object') return renderSection(key, value);
    return null;
  });
};