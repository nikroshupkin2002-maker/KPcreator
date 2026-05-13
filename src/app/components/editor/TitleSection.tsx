import { useRef } from 'react';
import { Building2, ImagePlus, X } from 'lucide-react';
import type { KPData } from '../../types/kp';

interface Props {
  kp: KPData;
  onChange: (kp: KPData) => void;
}

export function TitleSection({ kp, onChange }: Props) {
  const photoRef = useRef<HTMLInputElement>(null);

  function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      onChange({ ...kp, titlePhotoDataUrl: ev.target?.result as string });
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="editor-section">
      <SectionHeader icon={<Building2 size={16} />} title="Титульный лист" />

      <FieldGroup label="Название компании">
        <input
          className="editor-input"
          placeholder="ООО «Название компании»"
          value={kp.companyName}
          onChange={(e) => onChange({ ...kp, companyName: e.target.value })}
        />
      </FieldGroup>

      <FieldGroup label="Фото титульного листа">
        <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
        {kp.titlePhotoDataUrl ? (
          <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(201,168,76,0.25)' }}>
            <img src={kp.titlePhotoDataUrl} alt="title" style={{ width: '100%', height: 160, objectFit: 'cover' }} />
            <button
              onClick={() => onChange({ ...kp, titlePhotoDataUrl: null })}
              style={{
                position: 'absolute', top: 8, right: 8,
                background: 'rgba(0,0,0,0.7)',
                border: 'none', borderRadius: 6,
                color: 'white', cursor: 'pointer', padding: '4px',
                display: 'flex',
              }}
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <button className="upload-btn" onClick={() => photoRef.current?.click()}>
            <ImagePlus size={20} style={{ color: '#C9A84C' }} />
            <span>Загрузить фото</span>
          </button>
        )}
      </FieldGroup>
    </div>
  );
}

export function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2.5 mb-5">
      <div style={{
        width: 30, height: 30, borderRadius: 8,
        background: 'rgba(201,168,76,0.1)',
        border: '1px solid rgba(201,168,76,0.25)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#C9A84C', flexShrink: 0,
      }}>
        {icon}
      </div>
      <h3 style={{ color: '#F1F5F9', fontWeight: 600, fontSize: 14, letterSpacing: '0.01em' }}>{title}</h3>
    </div>
  );
}

export function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <label style={{ display: 'block', color: '#94A3B8', fontSize: 12, fontWeight: 500, marginBottom: 8, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
        {label}
      </label>
      {children}
    </div>
  );
}
