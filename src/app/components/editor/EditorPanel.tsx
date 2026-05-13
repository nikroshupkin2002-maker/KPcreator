import type { KPData } from '../../types/kp';
import { TitleSection } from './TitleSection';
import { SlideSection } from './SlideSection';
import { TableSection } from './TableSection';
import { EmployeeSection } from './EmployeeSection';

interface Props {
  kp: KPData;
  onChange: (kp: KPData) => void;
}

export function EditorPanel({ kp, onChange }: Props) {
  return (
    <div style={{
      height: '100%',
      overflowY: 'auto',
      padding: '24px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
    }}>
      {/* KP Name */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', color: '#64748B', fontSize: 11, fontWeight: 500, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Название КП
        </label>
        <input
          className="editor-input"
          placeholder="Название коммерческого предложения"
          value={kp.name}
          onChange={(e) => onChange({ ...kp, name: e.target.value })}
          style={{ fontSize: 15, fontWeight: 600 }}
        />
      </div>

      <TitleSection kp={kp} onChange={onChange} />
      <SlideSection kp={kp} onChange={onChange} />
      <TableSection kp={kp} onChange={onChange} />
      <EmployeeSection kp={kp} onChange={onChange} />
    </div>
  );
}
