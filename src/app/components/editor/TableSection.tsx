import { TableProperties } from 'lucide-react';
import type { KPData } from '../../types/kp';
import { SectionHeader, FieldGroup } from './TitleSection';

interface Props {
  kp: KPData;
  onChange: (kp: KPData) => void;
}

export function TableSection({ kp, onChange }: Props) {
  const { calculationTable: table } = kp;

  function updateTable(updater: (t: typeof table) => typeof table) {
    onChange({ ...kp, calculationTable: updater(table) });
  }

  function applyDimensions(cols: number, rows: number) {
    const newHeaders = Array.from({ length: cols }, (_, i) => table.headers[i] ?? `Столбец ${i + 1}`);
    const newCells = Array.from({ length: rows }, (_, ri) =>
      Array.from({ length: cols }, (__, ci) => table.cells[ri]?.[ci] ?? '')
    );
    updateTable(t => ({ ...t, numColumns: cols, numRows: rows, headers: newHeaders, cells: newCells }));
  }

  function updateHeader(colIndex: number, value: string) {
    const newHeaders = [...table.headers];
    newHeaders[colIndex] = value;
    updateTable(t => ({ ...t, headers: newHeaders }));
  }

  function updateCell(rowIndex: number, colIndex: number, value: string) {
    const newCells = table.cells.map(r => [...r]);
    if (!newCells[rowIndex]) newCells[rowIndex] = Array(table.numColumns).fill('');
    newCells[rowIndex][colIndex] = value;
    updateTable(t => ({ ...t, cells: newCells }));
  }

  const cols = Math.max(1, Math.min(10, table.numColumns));
  const rows = Math.max(1, Math.min(20, table.numRows));

  return (
    <div className="editor-section">
      <SectionHeader icon={<TableProperties size={16} />} title="Таблица расчётов (завершающий слайд)" />

      <FieldGroup label="Название таблицы">
        <input
          className="editor-input"
          placeholder="Расчёт стоимости"
          value={table.title}
          onChange={(e) => updateTable(t => ({ ...t, title: e.target.value }))}
        />
      </FieldGroup>

      <div className="flex gap-3 mb-4">
        <FieldGroup label="Столбцов">
          <input
            className="editor-input"
            type="number"
            min={1}
            max={10}
            value={table.numColumns}
            onChange={(e) => {
              const v = Math.max(1, Math.min(10, parseInt(e.target.value) || 1));
              applyDimensions(v, table.numRows);
            }}
            style={{ width: 80 }}
          />
        </FieldGroup>
        <FieldGroup label="Строк">
          <input
            className="editor-input"
            type="number"
            min={1}
            max={20}
            value={table.numRows}
            onChange={(e) => {
              const v = Math.max(1, Math.min(20, parseInt(e.target.value) || 1));
              applyDimensions(table.numColumns, v);
            }}
            style={{ width: 80 }}
          />
        </FieldGroup>
      </div>

      {/* Table input grid */}
      <div className="mb-4">
        <label style={{ display: 'block', color: '#64748B', fontSize: 11, fontWeight: 500, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Данные таблицы
        </label>
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%', borderCollapse: 'collapse',
            border: '1px solid rgba(201,168,76,0.2)',
            borderRadius: 10, overflow: 'hidden',
            fontSize: 12,
          }}>
            <thead>
              <tr style={{ background: 'rgba(201,168,76,0.1)' }}>
                {Array.from({ length: cols }, (_, ci) => (
                  <th key={ci} style={{ padding: 0, border: '1px solid rgba(201,168,76,0.15)' }}>
                    <input
                      value={table.headers[ci] ?? ''}
                      onChange={(e) => updateHeader(ci, e.target.value)}
                      placeholder={`Столбец ${ci + 1}`}
                      style={{
                        width: '100%', background: 'transparent', border: 'none', outline: 'none',
                        padding: '8px 10px', color: '#C9A84C', fontWeight: 600,
                        fontSize: 12, textAlign: 'center',
                      }}
                    />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: rows }, (_, ri) => (
                <tr key={ri} style={{ background: ri % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
                  {Array.from({ length: cols }, (__, ci) => (
                    <td key={ci} style={{ padding: 0, border: '1px solid rgba(255,255,255,0.06)' }}>
                      <input
                        value={table.cells[ri]?.[ci] ?? ''}
                        onChange={(e) => updateCell(ri, ci, e.target.value)}
                        placeholder="—"
                        style={{
                          width: '100%', background: 'transparent', border: 'none', outline: 'none',
                          padding: '7px 10px', color: '#E2E8F0', fontSize: 12,
                        }}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <FieldGroup label="Информация по расчётам">
        <textarea
          className="editor-input"
          placeholder="Дополнительные комментарии к расчёту..."
          value={table.info}
          onChange={(e) => updateTable(t => ({ ...t, info: e.target.value }))}
          rows={3}
          style={{ resize: 'vertical' }}
        />
      </FieldGroup>
    </div>
  );
}
