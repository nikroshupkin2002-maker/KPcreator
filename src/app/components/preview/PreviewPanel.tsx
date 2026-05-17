import { useRef, useState, useEffect, useCallback, useMemo, type RefObject } from 'react';
import type { KPData, PreviewElement, ElementBounds, TextStyle, SavedElementState } from '../../types/kp';
import { generatePreviewElements, A4_WIDTH, A4_HEIGHT, getTotalPages } from '../../utils/layoutUtils';
import { DraggableElement } from './DraggableElement';
import { FormattingToolbar } from './FormattingToolbar';

interface Props {
  kp: KPData;
  onChange: (updated: KPData) => void;
  previewRef: RefObject<HTMLDivElement | null>;
}

const PAGE_GAP = 24;

export function PreviewPanel({ kp, onChange, previewRef }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.7);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const obs = new ResizeObserver(entries => {
      const w = entries[0]?.contentRect.width ?? 600;
      setScale(Math.min(0.9, (w - 48) / A4_WIDTH));
    });
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  const elementStyles = kp.elementStyles ?? {};

  const elements = useMemo(() => {
    return generatePreviewElements(kp, elementStyles);
  }, [kp, elementStyles]);

  const totalPages = getTotalPages(kp);

  const handleBoundsChange = useCallback((id: string, bounds: ElementBounds) => {
    const current = elementStyles[id];
    const el = elements.find(e => e.id === id);
    const newStyles: Record<string, SavedElementState> = {
      ...elementStyles,
      [id]: { bounds, style: current?.style ?? el!.style },
    };
    onChange({ ...kp, elementStyles: newStyles });
  }, [kp, elementStyles, elements, onChange]);

  const handleStyleChange = useCallback((id: string, style: TextStyle) => {
    const current = elementStyles[id];
    const el = elements.find(e => e.id === id);
    const newStyles: Record<string, SavedElementState> = {
      ...elementStyles,
      [id]: { style, bounds: current?.bounds ?? el!.bounds },
    };
    onChange({ ...kp, elementStyles: newStyles });
  }, [kp, elementStyles, elements, onChange]);

  const selectedElement = selectedId ? elements.find(e => e.id === selectedId) ?? null : null;
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#0A0F1E' }}>
      <div style={{
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(255,255,255,0.02)',
        flexShrink: 0,
      }}>
        <FormattingToolbar element={selectedElement} onStyleChange={handleStyleChange} />
      </div>

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
                {/* Титульная страница — зелёный градиент */}
                {isTitle && (
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(160deg, #0a2e1a 0%, #14532d 40%, #0a2e1a 100%)',
                  }} />
                )}
                {/* Страница расчёта — белая */}
                {isCalc && (
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)',
                  }} />
                )}

                {/* Номер страницы */}
                <div style={{
                  position: 'absolute', bottom: 14, right: 20,
                  fontSize: 10, color: isTitle ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)',
                  zIndex: 0, fontFamily: 'Inter, sans-serif',
                }}>
                  {pageIndex + 1}
                </div>

                {/* Зелёная декоративная линия на титуле */}
                {isTitle && (
                  <div style={{
                    position: 'absolute', left: 48, top: 72, width: 60, height: 4,
                    background: 'linear-gradient(90deg, #16a34a, #4ade80)',
                    borderRadius: 2,
                  }} />
                )}

                {/* Зелёная полоса слева на слайдах */}
                {!isTitle && !isCalc && (
                  <div style={{
                    position: 'absolute', left: 0, top: 0, width: 6, height: '100%',
                    background: 'linear-gradient(180deg, #16a34a 0%, #4ade80 50%, #16a34a 100%)',
                  }} />
                )}

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
