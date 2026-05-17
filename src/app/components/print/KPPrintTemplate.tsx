import type { KPData } from '../../types/kp';
import { generatePreviewElements, A4_WIDTH, A4_HEIGHT, getTotalPages } from '../../utils/layoutUtils';

interface Props {
  kp: KPData;
}

export function KPPrintTemplate({ kp }: Props) {
  const elementStyles = kp.elementStyles ?? {};
  const elements = generatePreviewElements(kp, elementStyles);
  const totalPages = getTotalPages(kp);

  return (
    <div
      id="kp-print-root"
      style={{
        position: 'fixed',
        top: 0,
        left: '-9999px',
        width: A4_WIDTH,
        zIndex: -1,
        pointerEvents: 'none',
      }}
    >
      {Array.from({ length: totalPages }, (_, pageIndex) => {
        const pageElements = elements.filter(e => e.pageIndex === pageIndex);
        const isTitle = pageIndex === 0;
        const isCalc = pageIndex === totalPages - 1;

        return (
          <div
            key={pageIndex}
            data-print-page="true"
            style={{
              width: A4_WIDTH,
              height: A4_HEIGHT,
              position: 'relative',
              overflow: 'hidden',
              background: '#ffffff',
              marginBottom: 0,
            }}
          >
            {/* Фон титульной страницы */}
            {isTitle && (
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(160deg, #0a2e1a 0%, #14532d 40%, #0a2e1a 100%)',
              }} />
            )}

            {/* Фон страницы расчёта */}
            {isCalc && (
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)',
              }} />
            )}

            {/* Номер страницы */}
            <div style={{
              position: 'absolute', bottom: 14, right: 20,
              fontSize: 10,
              color: isTitle ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)',
              fontFamily: 'Inter, sans-serif',
              zIndex: 1,
            }}>
              {pageIndex + 1}
            </div>

            {/* Зелёная линия на титуле */}
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

            {/* Элементы страницы */}
            {pageElements.map(element => {
              const { bounds, style } = element;

              const baseStyle: React.CSSProperties = {
                position: 'absolute',
                left: bounds.x,
                top: bounds.y,
                width: bounds.width,
                height: bounds.height,
                overflow: 'hidden',
                boxSizing: 'border-box',
              };

              if (element.type === 'image' && element.imageUrl) {
                return (
                  <div key={element.id} style={baseStyle}>
                    <img
                      src={element.imageUrl}
                      alt=""
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        display: 'block',
                        borderRadius: 4,
                      }}
                    />
                  </div>
                );
              }

              if (element.type === 'table' && element.tableData) {
                const { headers, cells, numColumns, numRows } = element.tableData;
                const colW = `${100 / numColumns}%`;
                return (
                  <div key={element.id} style={baseStyle}>
                    <table style={{
                      width: '100%',
                      borderCollapse: 'collapse',
                      fontSize: style.fontSize,
                      fontFamily: style.fontFamily,
                    }}>
                      <thead>
                        <tr>
                          {headers.map((h, ci) => (
                            <th key={ci} style={{
                              padding: '8px 10px',
                              textAlign: 'left',
                              width: colW,
                              background: '#14532d',
                              color: '#ffffff',
                              fontWeight: 700,
                              border: '1px solid rgba(22,163,74,0.4)',
                              fontSize: style.fontSize,
                            }}>
                              {h || `Столбец ${ci + 1}`}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {Array.from({ length: numRows }, (_, ri) => (
                          <tr key={ri} style={{
                            background: ri % 2 === 0 ? '#ffffff' : '#f0fdf4',
                          }}>
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

              // Текстовый элемент
              const textColor = isTitle ? '#ffffff' : '#1e293b';
              return (
                <div key={element.id} style={{
                  ...baseStyle,
                  fontSize: style.fontSize,
                  fontWeight: style.fontWeight,
                  fontFamily: style.fontFamily,
                  color: textColor,
                  lineHeight: 1.5,
                  wordBreak: 'break-word',
                }}>
                  {element.content}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
