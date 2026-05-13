import { Bold, Type, AlignLeft } from 'lucide-react';
import type { PreviewElement, TextStyle, FontFamily } from '../../types/kp';

interface Props {
  element: PreviewElement | null;
  onStyleChange: (id: string, style: TextStyle) => void;
}

const FONTS: { label: string; value: FontFamily }[] = [
  { label: 'Inter', value: 'Inter' },
  { label: 'Montserrat', value: 'Montserrat' },
  { label: 'Playfair', value: 'Playfair Display' },
  { label: 'Roboto', value: 'Roboto' },
];

const FONT_SIZES = [10, 12, 13, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48];

export function FormattingToolbar({ element, onStyleChange }: Props) {
  if (!element || element.type !== 'text') {
    return (
      <div style={{
        height: 48,
        display: 'flex',
        alignItems: 'center',
        paddingLeft: 16,
        color: '#475569',
        fontSize: 13,
      }}>
        Выберите текстовый элемент для форматирования
      </div>
    );
  }

  const { style } = element;

  function updateStyle(patch: Partial<TextStyle>) {
    onStyleChange(element!.id, { ...style, ...patch });
  }

  return (
    <div style={{
      height: 48,
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      padding: '0 12px',
    }}>
      {/* Font family */}
      <select
        value={style.fontFamily}
        onChange={(e) => updateStyle({ fontFamily: e.target.value as FontFamily })}
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 6,
          color: '#E2E8F0',
          padding: '4px 8px',
          fontSize: 12,
          cursor: 'pointer',
          outline: 'none',
        }}
      >
        {FONTS.map(f => (
          <option key={f.value} value={f.value} style={{ background: '#1a2235', color: '#E2E8F0' }}>
            {f.label}
          </option>
        ))}
      </select>

      <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.1)' }} />

      {/* Font size */}
      <div className="flex items-center gap-1">
        <Type size={13} style={{ color: '#94A3B8' }} />
        <select
          value={style.fontSize}
          onChange={(e) => updateStyle({ fontSize: parseInt(e.target.value) })}
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 6,
            color: '#E2E8F0',
            padding: '4px 8px',
            fontSize: 12,
            cursor: 'pointer',
            width: 65,
            outline: 'none',
          }}
        >
          {FONT_SIZES.map(s => (
            <option key={s} value={s} style={{ background: '#1a2235', color: '#E2E8F0' }}>{s}</option>
          ))}
        </select>
      </div>

      <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.1)' }} />

      {/* Bold */}
      <button
        onClick={() => updateStyle({ fontWeight: style.fontWeight === 'bold' ? 'normal' : 'bold' })}
        style={{
          width: 30, height: 30,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: 6,
          border: 'none',
          cursor: 'pointer',
          background: style.fontWeight === 'bold' ? 'rgba(201,168,76,0.2)' : 'rgba(255,255,255,0.05)',
          color: style.fontWeight === 'bold' ? '#C9A84C' : '#94A3B8',
          fontWeight: 700,
          transition: 'all 0.15s',
        }}
      >
        <Bold size={14} />
      </button>

      <div style={{ marginLeft: 'auto', fontSize: 11, color: '#475569' }}>
        {element.id}
      </div>
    </div>
  );
}
