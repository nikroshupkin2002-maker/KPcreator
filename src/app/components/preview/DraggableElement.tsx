import { useRef, useState, useCallback, useEffect } from 'react';
import type { PreviewElement, ElementBounds, TextStyle } from '../../types/kp';
import { A4_WIDTH, A4_HEIGHT } from '../../utils/layoutUtils';

interface Props {
  element: PreviewElement;
  isSelected: boolean;
  onSelect: () => void;
  onBoundsChange: (bounds: ElementBounds) => void;
  onStyleChange: (style: TextStyle) => void;
  pageScale: number;
}

const HANDLE_SIZE = 8;

type ResizeDir = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

const resizeHandles: { dir: ResizeDir; style: React.CSSProperties }[] = [
  { dir: 'nw', style: { top: -4, left: -4, cursor: 'nw-resize' } },
  { dir: 'ne', style: { top: -4, right: -4, cursor: 'ne-resize' } },
  { dir: 'sw', style: { bottom: -4, left: -4, cursor: 'sw-resize' } },
  { dir: 'se', style: { bottom: -4, right: -4, cursor: 'se-resize' } },
  { dir: 'n', style: { top: -4, left: '50%', transform: 'translateX(-50%)', cursor: 'n-resize' } },
  { dir: 's', style: { bottom: -4, left: '50%', transform: 'translateX(-50%)', cursor: 's-resize' } },
  { dir: 'w', style: { top: '50%', left: -4, transform: 'translateY(-50%)', cursor: 'w-resize' } },
  { dir: 'e', style: { top: '50%', right: -4, transform: 'translateY(-50%)', cursor: 'e-resize' } },
];

export function DraggableElement({ element, isSelected, onSelect, onBoundsChange, onStyleChange, pageScale }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  const dragStart = useRef({ mouseX: 0, mouseY: 0, elX: 0, elY: 0 });
  const resizeStart = useRef({ mouseX: 0, mouseY: 0, bounds: element.bounds, dir: '' as ResizeDir });

  const { bounds, style } = element;

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).dataset.resize) return;
    e.preventDefault();
    e.stopPropagation();
    onSelect();
    setIsDragging(true);
    dragStart.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      elX: bounds.x,
      elY: bounds.y,
    };
  }, [bounds, onSelect]);

  const handleResizeMouseDown = useCallback((e: React.MouseEvent, dir: ResizeDir) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    resizeStart.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      bounds: { ...bounds },
      dir,
    };
  }, [bounds]);

  useEffect(() => {
    if (!isDragging && !isResizing) return;

    const onMove = (e: MouseEvent) => {
      const dx = (e.clientX - (isDragging ? dragStart.current.mouseX : resizeStart.current.mouseX)) / pageScale;
      const dy = (e.clientY - (isDragging ? dragStart.current.mouseY : resizeStart.current.mouseY)) / pageScale;

      if (isDragging) {
        const newX = Math.max(0, Math.min(A4_WIDTH - bounds.width, dragStart.current.elX + dx));
        const newY = Math.max(0, Math.min(A4_HEIGHT - bounds.height, dragStart.current.elY + dy));
        onBoundsChange({ ...bounds, x: newX, y: newY });
      } else if (isResizing) {
        const { dir, bounds: startBounds } = resizeStart.current;
        let { x, y, width, height } = startBounds;

        if (dir.includes('e')) width = Math.max(50, startBounds.width + dx);
        if (dir.includes('s')) height = Math.max(20, startBounds.height + dy);
        if (dir.includes('w')) {
          const newWidth = Math.max(50, startBounds.width - dx);
          x = startBounds.x + (startBounds.width - newWidth);
          width = newWidth;
        }
        if (dir.includes('n')) {
          const newHeight = Math.max(20, startBounds.height - dy);
          y = startBounds.y + (startBounds.height - newHeight);
          height = newHeight;
        }

        x = Math.max(0, Math.min(A4_WIDTH - 50, x));
        y = Math.max(0, Math.min(A4_HEIGHT - 20, y));

        onBoundsChange({ x, y, width, height });
      }
    };

    const onUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [isDragging, isResizing, bounds, pageScale, onBoundsChange]);

  const renderContent = () => {
    if (element.type === 'image' && element.imageUrl) {
      return (
        <img
          src={element.imageUrl}
          alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', userSelect: 'none', pointerEvents: 'none', borderRadius: 4 }}
          draggable={false}
        />
      );
    }

    if (element.type === 'table' && element.tableData) {
      const { headers, cells, numColumns, numRows } = element.tableData;
      const colW = `${100 / numColumns}%`;
      return (
        <div style={{ overflow: 'auto', height: '100%' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: style.fontSize, fontFamily: style.fontFamily }}>
            <thead>
              <tr>
                {headers.map((h, ci) => (
                  <th key={ci} style={{
                    padding: '8px 10px', textAlign: 'left', width: colW,
                    background: 'linear-gradient(135deg, #1a2847 0%, #1e3160 100%)',
                    color: '#C9A84C', fontWeight: 700,
                    border: '1px solid rgba(201,168,76,0.3)',
                    fontSize: style.fontSize,
                  }}>
                    {h || `Столбец ${ci + 1}`}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: numRows }, (_, ri) => (
                <tr key={ri} style={{ background: ri % 2 === 0 ? 'rgba(255,255,255,0.95)' : 'rgba(248,250,252,0.95)' }}>
                  {Array.from({ length: numColumns }, (__, ci) => (
                    <td key={ci} style={{
                      padding: '7px 10px',
                      border: '1px solid rgba(0,0,0,0.1)',
                      color: '#1e293b',
                      fontSize: style.fontSize,
                    }}>
                      {cells[ri]?.[ci] || ''}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    return (
      <div style={{
        width: '100%',
        height: '100%',
        fontSize: style.fontSize,
        fontWeight: style.fontWeight,
        fontFamily: style.fontFamily,
        color: '#1e293b',
        lineHeight: 1.5,
        wordBreak: 'break-word',
        overflow: 'hidden',
        userSelect: 'none',
      }}>
        {element.content}
      </div>
    );
  };

  return (
    <div
      onMouseDown={handleMouseDown}
      style={{
        position: 'absolute',
        left: bounds.x,
        top: bounds.y,
        width: bounds.width,
        height: bounds.height,
        cursor: isDragging ? 'grabbing' : 'grab',
        outline: isSelected ? '2px solid #3b82f6' : 'none',
        outlineOffset: 1,
        zIndex: isSelected ? 10 : 1,
        boxSizing: 'border-box',
      }}
    >
      {renderContent()}

      {/* Resize handles */}
      {isSelected && resizeHandles.map(({ dir, style: hStyle }) => (
        <div
          key={dir}
          data-resize={dir}
          onMouseDown={(e) => handleResizeMouseDown(e, dir)}
          style={{
            position: 'absolute',
            width: HANDLE_SIZE,
            height: HANDLE_SIZE,
            background: '#3b82f6',
            border: '2px solid white',
            borderRadius: 2,
            zIndex: 20,
            ...hStyle,
          }}
        />
      ))}
    </div>
  );
}
