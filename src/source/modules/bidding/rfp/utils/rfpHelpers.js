// Pure utility functions - no JSX, no state, no effects

export const normalizeText = (text) => {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/^\s+|\s+$/g, '')
    .replace(/[•\-●]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

export const calculateOverlapRatio = (str1, str2) => {
  if (!str1 || !str2) return 0;
  
  const tokenSet = (s) => {
    const words = normalizeText(s).split(' ').filter(Boolean);
    return new Set(words);
  };
  
  const set1 = tokenSet(str1);
  const set2 = tokenSet(str2);
  
  if (!set1.size || !set2.size) return 0;
  
  let common = 0;
  set1.forEach((t) => { 
    if (set2.has(t)) common += 1; 
  });
  
  return common / Math.max(set1.size, set2.size);
};

export const shouldDisplayField = (value) => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string' && value.trim() === '') return false;
  if (Array.isArray(value) && value.length === 0) return false;
  if (typeof value === 'object' && Object.keys(value).length === 0) return false;
  return true;
};

export const formatKey = (key) => 
  key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

export const formatValue = (value) => {
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (value instanceof Date) return value.toLocaleDateString();
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
};

export const getNormalizedContentLines = (text) => {
  if (!text) return [];
  return text
    .split('\n')
    .map(ln => normalizeText(ln))
    .filter(ln => ln.length > 0);
};