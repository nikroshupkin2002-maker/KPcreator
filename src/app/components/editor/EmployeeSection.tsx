import { useRef } from 'react';
import { UserCircle, ImagePlus, X } from 'lucide-react';
import type { KPData } from '../../types/kp';
import { SectionHeader, FieldGroup } from './TitleSection';

interface Props {
  kp: KPData;
  onChange: (kp: KPData) => void;
}

export function EmployeeSection({ kp, onChange }: Props) {
  const empPhotoRef = useRef<HTMLInputElement>(null);
  const freedomPhotoRef = useRef<HTMLInputElement>(null);

  function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>, field: 'employeePhoto' | 'freedomPhoto') {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      if (field === 'employeePhoto') {
        onChange({ ...kp, employee: { ...kp.employee, photoDataUrl: dataUrl } });
      } else {
        onChange({ ...kp, freedomPhotoDataUrl: dataUrl });
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  return (
    <div className="editor-section">
      <SectionHeader icon={<UserCircle size={16} />} title="Информация о сотруднике (последний слайд)" />

      <div className="flex gap-3 mb-4">
        <FieldGroup label="Имя Фамилия">
          <input
            className="editor-input"
            placeholder="Иван Иванов"
            value={kp.employee.name}
            onChange={(e) => onChange({ ...kp, employee: { ...kp.employee, name: e.target.value } })}
          />
        </FieldGroup>
        <FieldGroup label="Номер телефона">
          <input
            className="editor-input"
            placeholder="+7 000 000-00-00"
            value={kp.employee.phone}
            onChange={(e) => onChange({ ...kp, employee: { ...kp.employee, phone: e.target.value } })}
          />
        </FieldGroup>
      </div>

      <FieldGroup label="Фото сотрудника">
        <input ref={empPhotoRef} type="file" accept="image/*" className="hidden" onChange={(e) => handlePhotoUpload(e, 'employeePhoto')} />
        {kp.employee.photoDataUrl ? (
          <div style={{ position: 'relative', width: 100, borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(201,168,76,0.25)' }}>
            <img src={kp.employee.photoDataUrl} alt="employee" style={{ width: 100, height: 100, objectFit: 'cover' }} />
            <button
              onClick={() => onChange({ ...kp, employee: { ...kp.employee, photoDataUrl: null } })}
              style={{
                position: 'absolute', top: 4, right: 4,
                background: 'rgba(0,0,0,0.7)', border: 'none',
                borderRadius: 4, color: 'white', cursor: 'pointer', padding: '3px', display: 'flex',
              }}
            >
              <X size={11} />
            </button>
          </div>
        ) : (
          <button className="upload-btn" onClick={() => empPhotoRef.current?.click()} style={{ padding: '10px 16px' }}>
            <ImagePlus size={16} style={{ color: '#C9A84C' }} />
            <span>Загрузить фото</span>
          </button>
        )}
      </FieldGroup>

      <FieldGroup label="Логотип Freedom (в самом низу последнего слайда)">
        <input ref={freedomPhotoRef} type="file" accept="image/*" className="hidden" onChange={(e) => handlePhotoUpload(e, 'freedomPhoto')} />
        {kp.freedomPhotoDataUrl ? (
          <div style={{ position: 'relative', display: 'inline-block', borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(201,168,76,0.25)' }}>
            <img src={kp.freedomPhotoDataUrl} alt="freedom" style={{ height: 48, objectFit: 'contain' }} />
            <button
              onClick={() => onChange({ ...kp, freedomPhotoDataUrl: null })}
              style={{
                position: 'absolute', top: 4, right: 4,
                background: 'rgba(0,0,0,0.7)', border: 'none',
                borderRadius: 4, color: 'white', cursor: 'pointer', padding: '3px', display: 'flex',
              }}
            >
              <X size={11} />
            </button>
          </div>
        ) : (
          <button className="upload-btn" onClick={() => freedomPhotoRef.current?.click()} style={{ padding: '10px 16px' }}>
            <ImagePlus size={16} style={{ color: '#C9A84C' }} />
            <span>Загрузить логотип Freedom</span>
          </button>
        )}
      </FieldGroup>
    </div>
  );
}
