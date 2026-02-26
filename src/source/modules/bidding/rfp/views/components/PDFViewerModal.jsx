import React, { useState, useEffect, useRef } from 'react';
import { FiFile, FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { FaSpinner } from 'react-icons/fa';
import toast from 'react-hot-toast';
import * as pdfjsLib from 'pdfjs-dist';
import { version as pdfjsVersion } from 'pdfjs-dist';
import 'pdfjs-dist/web/pdf_viewer.css';
import { normalizeText, calculateOverlapRatio, getNormalizedContentLines } from '../../utils/rfpHelpers';

// Set worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsVersion}/build/pdf.worker.min.mjs`;

const themeColor = '#3E1067';
const highlightFill = 'rgba(62, 16, 103, 0.14)';

export const PDFViewerModal = ({ 
  isOpen, 
  onClose, 
  pdfUrl, 
  targetPage = 1, 
  highlightTitle = '', 
  highlightContent = '' 
}) => {
  const containerRef = useRef(null);
  const renderedPagesRef = useRef({});
  const renderRunRef = useRef(0);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(targetPage);
  const [pageLayouts, setPageLayouts] = useState({});
  const [renderedPages, setRenderedPages] = useState({});
  const [highlights, setHighlights] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [scale, setScale] = useState(1.2);

  // Reset when modal opens/closes or when target page changes
  useEffect(() => {
    if (isOpen) {
      setCurrentPage(targetPage);
      // Increment render run to trigger re-render when props change
      renderRunRef.current += 1;
    }
  }, [isOpen, targetPage, highlightTitle, highlightContent]);

  // Load PDF
  useEffect(() => {
    if (!isOpen || !pdfUrl) return;

    let mounted = true;
    let loadingTask = null;
    let loadedDoc = null;

    const loadPDF = async () => {
      setIsLoading(true);
      setIsReady(false);
      // Clear old PDF data
      setPdfDoc(null);
      setNumPages(0);
      setRenderedPages({});
      renderedPagesRef.current = {};
      setHighlights({});
      setPageLayouts({});

      try {
        loadingTask = pdfjsLib.getDocument(pdfUrl);
        const pdf = await loadingTask.promise;
        loadedDoc = pdf;
        
        if (!mounted) {
          pdf.destroy?.();
          return;
        }
        
        setPdfDoc(pdf);
        setNumPages(pdf.numPages);
      } catch (error) {
        console.error('Error loading PDF:', error);
        toast.error('Failed to load PDF');
        setIsLoading(false);
      }
    };

    loadPDF();

    return () => {
      mounted = false;
      if (loadingTask) {
        loadingTask.destroy?.();
      }
      if (loadedDoc) {
        loadedDoc.destroy?.();
      }
    };
  }, [isOpen, pdfUrl]);

  // Render a single page
  const renderPage = async (pageNum, doc = pdfDoc) => {
    if (!doc) return null;
    if (renderedPagesRef.current[pageNum]) return renderedPagesRef.current[pageNum];

    try {
      const page = await doc.getPage(pageNum);
      const viewport = page.getViewport({ scale });

      const canvas = document.createElement('canvas');
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const context = canvas.getContext('2d');

      await page.render({
        canvasContext: context,
        viewport,
      }).promise;

      renderedPagesRef.current[pageNum] = canvas;
      setRenderedPages(prev => ({
        ...prev,
        [pageNum]: canvas
      }));

      return { page, viewport };
    } catch (error) {
      console.error(`Error rendering page ${pageNum}:`, error);
      return null;
    }
  };

  // Find highlights on a page
  const findHighlights = async (page, pageNum, viewport, options = {}) => {
    try {
      const textContent = await page.getTextContent();
      const items = textContent.items;
      const matchedIndices = new Set();

      const { titleText = '', contentLines = [], startLineIndex = 0 } = options;
      const normalizedTitle = normalizeText(titleText);

      // Group by visual lines
      const lines = [];
      let currentLine = null;
      const lineTolerance = 3;

      items.forEach((item, itemIndex) => {
        const tx = pdfjsLib.Util.transform(viewport.transform, item.transform);
        const fontHeight = Math.hypot(tx[2], tx[3]);
        const yTop = tx[5] - fontHeight;

        if (!currentLine || Math.abs(currentLine.yTop - yTop) > lineTolerance) {
          currentLine = {
            yTop,
            itemIndexes: [],
            rawTextParts: [],
          };
          lines.push(currentLine);
        }

        currentLine.itemIndexes.push(itemIndex);
        currentLine.rawTextParts.push(item.str || '');
      });

      const normalizedLines = lines.map(ln => normalizeText(ln.rawTextParts.join(' ')));

      // Match title
      let nextLineIndex = startLineIndex;
      let titleAnchorIndex = -1;
      if (normalizedTitle) {
        let bestScore = 0;
        let bestIdx = -1;
        
        normalizedLines.forEach((lineText, idx) => {
          if (!lineText) return;
          const containsScore = lineText.includes(normalizedTitle) || normalizedTitle.includes(lineText) ? 1 : 0;
          const score = Math.max(containsScore, calculateOverlapRatio(normalizedTitle, lineText));
          if (score > bestScore) {
            bestScore = score;
            bestIdx = idx;
          }
        });

        if (bestIdx >= 0 && bestScore >= 0.45) {
          titleAnchorIndex = bestIdx;
          lines[bestIdx].itemIndexes.forEach(idx => matchedIndices.add(idx));
        }
      }

      // Match content lines sequentially
      if (contentLines.length > 0 && nextLineIndex < contentLines.length) {
        let lineCursor = titleAnchorIndex >= 0 ? titleAnchorIndex : 0;
        let misses = 0;
        
        for (let i = nextLineIndex; i < contentLines.length; i++) {
          const targetLine = contentLines[i];
          const words = targetLine.split(' ').filter(Boolean);
          if (words.length < 2 && !/\d/.test(targetLine)) continue;

          let bestIdx = -1;
          let bestScore = 0;
          const maxSearchWindow = 22;
          const end = Math.min(lines.length, lineCursor + maxSearchWindow);
          
          for (let j = lineCursor; j < end; j++) {
            const lineText = normalizedLines[j];
            if (!lineText) continue;

            let score = calculateOverlapRatio(targetLine, lineText);
            if (lineText.includes(targetLine) || targetLine.includes(lineText)) {
              score = Math.max(score, 0.95);
            }
            if (score > bestScore) {
              bestScore = score;
              bestIdx = j;
            }
          }

          const threshold = words.length >= 5 ? 0.5 : 0.38;
          if (bestIdx >= 0 && bestScore >= threshold) {
            lines[bestIdx].itemIndexes.forEach(idx => matchedIndices.add(idx));
            lineCursor = bestIdx;
            nextLineIndex = i + 1;
            misses = 0;
          } else {
            misses += 1;
            if (misses >= 2) break;
          }
        }
      }

      // Fallback: strict phrase matching for completely missed or remaining chunk lines
      if (matchedIndices.size === 0 || nextLineIndex < contentLines.length) {
        const fallbackPhrases = [];
        if (normalizedTitle) fallbackPhrases.push(normalizedTitle);
        fallbackPhrases.push(
          ...contentLines.slice(nextLineIndex).filter((ln) => ln.split(' ').length >= 3).slice(0, 60)
        );

        fallbackPhrases.forEach((phrase) => {
          const phraseWords = phrase.split(' ').filter(Boolean);
          for (let i = 0; i < items.length; i++) {
            let combined = '';
            let combinedIdx = [];
            for (let j = i; j < Math.min(i + 25, items.length); j++) {
              const txt = normalizeText(items[j].str);
              if (!txt) continue;
              combined = combined ? `${combined} ${txt}` : txt;
              combinedIdx.push(j);

              if (combined.includes(phrase)) {
                combinedIdx.forEach((idx) => matchedIndices.add(idx));
                break;
              }
              if (combined.split(' ').length > Math.max(phraseWords.length + 12, 20)) break;
            }
          }
        });
      }

      // Create highlights
      if (matchedIndices.size > 0) {
        const pageHighlights = Array.from(matchedIndices).map(index => {
          const item = items[index];
          const tx = pdfjsLib.Util.transform(viewport.transform, item.transform);
          const fontHeight = Math.hypot(tx[2], tx[3]);
          const width = item.width * viewport.scale;
          
          return {
            x: tx[4],
            y: tx[5] - fontHeight,
            width,
            height: fontHeight
          };
        });

        return {
          pageHighlights,
          nextLineIndex,
        };
      }

      return {
        pageHighlights: [],
        nextLineIndex: startLineIndex,
      };
    } catch (error) {
      console.error('Error finding highlights:', error);
      return {
        pageHighlights: [],
        nextLineIndex: options.startLineIndex || 0,
      };
    }
  };

  // Render all pages and find highlights
  useEffect(() => {
    if (!isOpen || !pdfDoc) return;

    const renderAndHighlight = async () => {
      const currentRun = renderRunRef.current;
      const isStale = () => renderRunRef.current !== currentRun;

      setIsLoading(true);
      setIsReady(false);

      try {
        // Precompute page sizes
        const layouts = {};
        for (let i = 1; i <= pdfDoc.numPages; i++) {
          const p = await pdfDoc.getPage(i);
          if (isStale()) return;
          const vp = p.getViewport({ scale });
          layouts[i] = { width: vp.width, height: vp.height };
        }
        if (isStale()) return;
        setPageLayouts(layouts);

        // Render target page first
        await renderPage(targetPage, pdfDoc);
        if (isStale()) return;

        // Find highlights on target page
        const page = await pdfDoc.getPage(targetPage);
        const viewport = page.getViewport({ scale });
        const contentLines = getNormalizedContentLines(highlightContent);
        
        const targetResult = await findHighlights(page, targetPage, viewport, {
          titleText: highlightTitle,
          contentLines,
          startLineIndex: 0,
        });
        if (isStale()) return;

        // Update highlights for target page
        setHighlights(prev => ({
          ...prev,
          [targetPage]: targetResult.pageHighlights || []
        }));

        let contentCursor = targetResult.nextLineIndex || 0;

        // Mark as ready immediately after target page is done
        setIsReady(true);
        setIsLoading(false);

        // Scroll to highlight
        requestAnimationFrame(() => {
          if (isStale()) return;
          const container = containerRef.current;
          const pageElement = document.getElementById(`page-container-${targetPage}`);
          
          if (container && pageElement) {
            if (targetResult.pageHighlights?.length > 0) {
              const firstHighlight = targetResult.pageHighlights[0];
              const pageRect = pageElement.getBoundingClientRect();
              const containerRect = container.getBoundingClientRect();
              
              const scrollTop = container.scrollTop + 
                (pageRect.top - containerRect.top) + 
                firstHighlight.y - 80;
              
              container.scrollTo({
                top: Math.max(0, scrollTop),
                behavior: 'smooth'
              });
            } else {
              pageElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }
        });

        // Continue with remaining pages in background
        for (let i = 1; i <= pdfDoc.numPages; i++) {
          if (i !== targetPage) {
            await renderPage(i, pdfDoc);
            if (isStale()) return;
          }
        }

        // Find highlights on subsequent pages if needed
        if (contentLines.length > 0 && contentCursor < contentLines.length) {
          let noMatchStreak = 0;
          for (let i = targetPage + 1; i <= pdfDoc.numPages; i++) {
            if (noMatchStreak >= 2) break;
            
            const spillPage = await pdfDoc.getPage(i);
            const spillViewport = spillPage.getViewport({ scale });
            const spillResult = await findHighlights(spillPage, i, spillViewport, {
              titleText: '',
              contentLines,
              startLineIndex: contentCursor,
            });
            if (isStale()) return;

            if (spillResult.pageHighlights?.length > 0) {
              setHighlights(prev => ({
                ...prev,
                [i]: spillResult.pageHighlights
              }));
            }

            if ((spillResult.nextLineIndex || contentCursor) > contentCursor) {
              contentCursor = spillResult.nextLineIndex;
              noMatchStreak = 0;
            } else {
              noMatchStreak += 1;
            }

            if (contentCursor >= contentLines.length) break;
          }
        }
      } catch (error) {
        if (isStale()) return;
        console.error('Error in render and highlight:', error);
        setIsLoading(false);
        setIsReady(true);
      }
    };

    renderAndHighlight();
  }, [isOpen, pdfDoc, scale, targetPage, highlightTitle, highlightContent]);

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.2, 3));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.5));

  const buttonStyle = {
    width: '32px',
    height: '32px',
    border: '1px solid #edf2f7',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontSize: '1.2rem',
    color: '#334155',
    transition: 'all 0.2s'
  };

  const closeButtonStyle = {
    width: '36px',
    height: '36px',
    border: 'none',
    backgroundColor: '#fee2e2',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#991b1b',
    cursor: 'pointer',
    marginLeft: '8px'
  };

  if (!isOpen) return null;

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
          width: '680px',
          maxWidth: '90%',
          height: '560px',
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          boxShadow: '0 20px 40px -12px rgba(62, 16, 103, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid #f0f2f5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#ffffff',
          zIndex: 2,
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
              <h3 style={{
                margin: 0,
                fontSize: '0.95rem',
                fontWeight: 600,
                color: '#1a1e24',
              }}>
                {highlightTitle || 'Document Page'}
              </h3>
              <div style={{
                display: 'flex',
                gap: '8px',
                marginTop: '2px',
                fontSize: '0.7rem',
                color: '#8a94a6',
              }}>
                <span>Page {targetPage} of {numPages}</span>
                <span>•</span>
                <span>{Math.round(scale * 100)}%</span>
              </div>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              onClick={handleZoomOut}
              style={buttonStyle}
              disabled={!isReady}
            >
              −
            </button>
            <button
              onClick={handleZoomIn}
              style={buttonStyle}
              disabled={!isReady}
            >
              +
            </button>
            
            <button
              onClick={onClose}
              style={closeButtonStyle}
            >
              <FiX size={18} />
            </button>
          </div>
        </div>

        {/* PDF Container */}
        <div
          ref={containerRef}
          style={{
            flex: 1,
            backgroundColor: '#f5f7fa',
            overflow: 'auto',
            padding: '20px',
            position: 'relative',
            opacity: isReady ? 1 : 0,
            transition: 'opacity 0.3s ease',
            visibility: isReady ? 'visible' : 'hidden',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '20px',
            }}
          >
            {Array.from({ length: numPages }, (_, i) => i + 1).map((pageNum) => (
              <div
                key={pageNum}
                id={`page-container-${pageNum}`}
                style={{
                  position: 'relative',
                  width: pageLayouts[pageNum]?.width || 'auto',
                  minHeight: pageLayouts[pageNum]?.height || '220px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  backgroundColor: '#ffffff',
                }}
              >
                {renderedPages[pageNum] && (
                  <>
                    <canvas
                      ref={(el) => {
                        if (el && renderedPages[pageNum]) {
                          const ctx = el.getContext('2d');
                          ctx.drawImage(renderedPages[pageNum], 0, 0);
                        }
                      }}
                      width={renderedPages[pageNum]?.width}
                      height={renderedPages[pageNum]?.height}
                      style={{ display: 'block' }}
                    />
                    
                    {/* Highlights */}
                    {highlights[pageNum]?.map((h, idx) => (
                      <div
                        key={`${pageNum}-${idx}`}
                        style={{
                          position: 'absolute',
                          left: h.x,
                          top: h.y,
                          width: h.width,
                          height: h.height,
                          backgroundColor: highlightFill,
                          borderRadius: '2px',
                          pointerEvents: 'none',
                        }}
                      />
                    ))}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Loading Overlay */}
        {!isReady && (
          <div style={{
            position: 'absolute',
            top: '73px',
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '20px',
            zIndex: 10,
          }}>
            <FaSpinner className="spinner" size={32} color={themeColor} />
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '0.9rem',
                fontWeight: 500,
                color: '#1a1e24',
                marginBottom: '4px'
              }}>
                Preparing PDF Viewer
              </div>
              <div style={{
                fontSize: '0.75rem',
                color: '#8a94a6',
              }}>
                {isLoading ? 'Loading PDF...' : 'Finding highlights...'}
              </div>
            </div>
          </div>
        )}

        {/* Page Navigation */}
        {isReady && numPages > 1 && (
          <div style={{
            padding: '12px 20px',
            borderTop: '1px solid #f0f2f5',
            backgroundColor: '#ffffff',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '8px',
            zIndex: 2,
          }}>
            <button
              onClick={() => {
                const newPage = Math.max(currentPage - 1, 1);
                setCurrentPage(newPage);
                document.getElementById(`page-container-${newPage}`)
                  ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              disabled={currentPage === 1}
              style={{
                ...buttonStyle,
                opacity: currentPage === 1 ? 0.5 : 1,
              }}
            >
              <FiChevronLeft size={16} />
            </button>
            
            <span style={{
              display: 'flex',
              alignItems: 'center',
              padding: '0 12px',
              backgroundColor: '#f5f7fa',
              borderRadius: '8px',
              color: '#334155',
              fontSize: '0.8rem',
              height: '32px',
            }}>
              Page {currentPage} of {numPages}
            </span>
            
            <button
              onClick={() => {
                const newPage = Math.min(currentPage + 1, numPages);
                setCurrentPage(newPage);
                document.getElementById(`page-container-${newPage}`)
                  ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              disabled={currentPage === numPages}
              style={{
                ...buttonStyle,
                opacity: currentPage === numPages ? 0.5 : 1,
              }}
            >
              <FiChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      <style>{`
        .spinner { 
          animation: spin 0.8s linear infinite; 
        }
        @keyframes spin { 
          from { transform: rotate(0deg); } 
          to { transform: rotate(360deg); } 
        }
      `}</style>
    </div>
  );
};
