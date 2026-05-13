import { useRef, useState, useEffect, useCallback, useMemo, type RefObject } from 'react';
import type { KPData, PreviewElement, ElementBounds, TextStyle } from '../../types/kp';
import { generatePreviewElements, A4_WIDTH, A4_HEIGHT, getTotalPages } from '../../utils/layoutUtils';
import { DraggableElement } from './DraggableElement';
import { FormattingToolbar } from './FormattingToolbar';

interface Props {
  kp: KPData;
  previewRef: RefObject<HTMLDivElement | null>;
}

const PAGE_GAP = 24;

export function PreviewPanel({ kp, previewRef }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.7);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [elementStyles, setElementStyles] = useState<Record<string, { bounds: ElementBounds; style: TextStyle }>>({});

  // Compute scale based on container width
  useEffect(() => {
    const obs = new ResizeObserver(entries => {
      const w = entries[0]?.contentRect.width ?? 600;
      setScale(Math.min(0.9, (w - 48) / A4_WIDTH));
    });
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  // Generate elements from KP data + saved positions
  const elements = useMemo(() => {
    return generatePreviewElements(kp, elementStyles);
  }, [kp, elementStyles]);

  const totalPages = getTotalPages(kp);

  const handleBoundsChange = useCallback((id: string, bounds: ElementBounds) => {
    setElementStyles(prev => ({
      ...prev,
      [id]: { bounds, style: prev[id]?.style ?? elements.find(e => e.id === id)!.style },
    }));
  }, [elements]);

  const handleStyleChange = useCallback((id: string, style: TextStyle) => {
    setElementStyles(prev => ({
      ...prev,
      [id]: { style, bounds: prev[id]?.bounds ?? elements.find(e => e.id === id)!.bounds },
    }));
  }, [elements]);

  const selectedElement = selectedId ? elements.find(e => e.id === selectedId) ?? null : null;

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#0A0F1E' }}>
      {/* Formatting toolbar */}
      <div style={{
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(255,255,255,0.02)',
        flexShrink: 0,
      }}>
        <FormattingToolbar
          element={selectedElement}
          onStyleChange={handleStyleChange}
        />
      </div>

      {/* Pages container */}
      <div
        ref={containerRef}
        onClick={() => setSelectedId(null)}
        style={{
          flex: 1,
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '24px 0 40px',
          gap: PAGE_GAP,
        }}
      >
        {/* The actual preview div for PDF export */}
        <div ref={previewRef} style={{ display: 'flex', flexDirection: 'column', gap: 0, alignItems: 'center' }}>
          {pageNumbers.map(pageIndex => {
            const pageElements = elements.filter(e => e.pageIndex === pageIndex);
            const isTitle = pageIndex === 0;
            const isCalc = pageIndex === totalPages - 1;

            return (
              <div
                key={pageIndex}
                data-a4-page="true"
                onClick={(e) => e.stopPropagation()}
                style={{
                  width: A4_WIDTH,
                  height: A4_HEIGHT,
                  background: '#ffffff',
                  position: 'relative',
                  transform: `scale(${scale})`,
                  transformOrigin: 'top center',
                  marginBottom: (scale - 1) * A4_HEIGHT + PAGE_GAP,
                  boxShadow: '0 8px 40px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.4)',
                  flexShrink: 0,
                  overflow: 'hidden',
                }}
              >
                {/* Page background for title/calc */}
                {isTitle && (
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(160deg, #0d1a3a 0%, #1a2f5f 40%, #0d1a3a 100%)',
                  }} />
                )}
                {isCalc && (
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)',
                  }} />
                )}

                {/* Page number indicator */}
                <div style={{
                  position: 'absolute', bottom: 14, right: 20,
                  fontSize: 10, color: isTitle ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)',
                  zIndex: 0,
                  fontFamily: 'Inter, sans-serif',
                }}>
                  {pageIndex + 1}
                </div>

                {/* Gold decorative line on title page */}
                {isTitle && (
                  <div style={{
                    position: 'absolute', left: 48, top: 72, width: 60, height: 4,
                    background: 'linear-gradient(90deg, #C9A84C, #F0C85A)',
                    borderRadius: 2,
                  }} />
                )}

                {/* Gold accent bar for slide pages */}
                {!isTitle && !isCalc && (
                  <div style={{
                    position: 'absolute', left: 0, top: 0, width: 6, height: '100%',
                    background: 'linear-gradient(180deg, #C9A84C 0%, #F0C85A 50%, #C9A84C 100%)',
                  }} />
                )}

                {/* Elements */}
                {pageElements.map(element => (
                  <DraggableElement
                    key={element.id}
                    element={element}
                    isSelected={selectedId === element.id}
                    onSelect={() => setSelectedId(element.id)}
                    onBoundsChange={(bounds) => handleBoundsChange(element.id, bounds)}
                    onStyleChange={(style) => handleStyleChange(element.id, style)}
                    pageScale={scale}
                  />
                ))}

                {/* Empty page hint */}
                {pageElements.length === 0 && (
                  <div style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'rgba(0,0,0,0.15)', fontSize: 14,
                  }}>
                    Страница {pageIndex + 1}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
