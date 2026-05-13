import { useRef } from 'react';
import { Layers, Plus, Trash2, ImagePlus, X } from 'lucide-react';
import type { KPData, Slide, SlideInfoItem, SlidePhoto } from '../../types/kp';
import { SectionHeader, FieldGroup } from './TitleSection';

interface Props {
  kp: KPData;
  onChange: (kp: KPData) => void;
}

function uid() {
  return `id_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

function updateSlide(kp: KPData, slideId: string, updater: (s: Slide) => Slide): KPData {
  return { ...kp, slides: kp.slides.map(s => s.id === slideId ? updater(s) : s) };
}

function SlideCard({
  slide, index, kp, onChange, onDelete, canDelete,
}: {
  slide: Slide; index: number; kp: KPData; onChange: (kp: KPData) => void;
  onDelete: () => void; canDelete: boolean;
}) {
  const photoRef = useRef<HTMLInputElement>(null);

  function update(updater: (s: Slide) => Slide) {
    onChange(updateSlide(kp, slide.id, updater));
  }

  function addInfoItem(type: 'info' | 'additional') {
    update(s => ({
      ...s,
      items: [...s.items, { id: uid(), type, content: '' }],
    }));
  }

  function updateItem(id: string, content: string) {
    update(s => ({ ...s, items: s.items.map(i => i.id === id ? { ...i, content } : i) }));
  }

  function removeItem(id: string) {
    update(s => ({ ...s, items: s.items.filter(i => i.id !== id) }));
  }

  function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const photo: SlidePhoto = { id: uid(), dataUrl: ev.target?.result as string };
      update(s => ({ ...s, photos: [...s.photos, photo] }));
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  function removePhoto(id: string) {
    update(s => ({ ...s, photos: s.photos.filter(p => p.id !== id) }));
  }

  const infoItems = slide.items.filter(i => i.type === 'info');
  const additionalItems = slide.items.filter(i => i.type === 'additional');

  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(201,168,76,0.15)',
      borderRadius: 14,
      overflow: 'hidden',
      marginBottom: 12,
    }}>
      {/* Slide header */}
      <div style={{
        padding: '12px 16px',
        background: 'rgba(201,168,76,0.05)',
        borderBottom: '1px solid rgba(201,168,76,0.1)',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <div style={{
          width: 24, height: 24, borderRadius: 6,
          background: 'rgba(201,168,76,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#C9A84C', fontSize: 11, fontWeight: 700, flexShrink: 0,
        }}>
          {index + 1}
        </div>
        <input
          className="editor-input flex-1"
          placeholder="Название слайда"
          value={slide.title}
          onChange={(e) => update(s => ({ ...s, title: e.target.value }))}
          style={{ margin: 0 }}
        />
        {canDelete && (
          <button onClick={onDelete} className="icon-btn danger">
            <Trash2 size={13} />
          </button>
        )}
      </div>

      <div style={{ padding: '14px 16px' }}>
        {/* Info items */}
        <div className="mb-3">
          <label style={{ display: 'block', color: '#64748B', fontSize: 11, fontWeight: 500, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Информация на слайде
          </label>
          {infoItems.map(item => (
            <div key={item.id} className="flex gap-2 mb-2">
              <textarea
                className="editor-input flex-1"
                placeholder="Введите информацию..."
                value={item.content}
                onChange={(e) => updateItem(item.id, e.target.value)}
                rows={2}
                style={{ resize: 'vertical', margin: 0 }}
              />
              <button onClick={() => removeItem(item.id)} className="icon-btn danger" style={{ alignSelf: 'flex-start' }}>
                <X size={12} />
              </button>
            </div>
          ))}
          <button className="add-btn" onClick={() => addInfoItem('info')}>
            <Plus size={13} /> Добавить информацию
          </button>
        </div>

        {/* Additional items */}
        <div className="mb-3">
          <label style={{ display: 'block', color: '#64748B', fontSize: 11, fontWeight: 500, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Дополнительная информация
          </label>
          {additionalItems.map(item => (
            <div key={item.id} className="flex gap-2 mb-2">
              <textarea
                className="editor-input flex-1"
                placeholder="Дополнительные детали..."
                value={item.content}
                onChange={(e) => updateItem(item.id, e.target.value)}
                rows={2}
                style={{ resize: 'vertical', margin: 0 }}
              />
              <button onClick={() => removeItem(item.id)} className="icon-btn danger" style={{ alignSelf: 'flex-start' }}>
                <X size={12} />
              </button>
            </div>
          ))}
          <button className="add-btn" onClick={() => addInfoItem('additional')}>
            <Plus size={13} /> Добавить доп. информацию
          </button>
        </div>

        {/* Photos */}
        <div>
          <label style={{ display: 'block', color: '#64748B', fontSize: 11, fontWeight: 500, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Фотографии
          </label>
          {slide.photos.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mb-2">
              {slide.photos.map(photo => (
                <div key={photo.id} style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <img src={photo.dataUrl} alt="" style={{ width: '100%', height: 80, objectFit: 'cover' }} />
                  <button
                    onClick={() => removePhoto(photo.id)}
                    style={{
                      position: 'absolute', top: 4, right: 4,
                      background: 'rgba(0,0,0,0.7)', border: 'none',
                      borderRadius: 4, color: 'white', cursor: 'pointer', padding: '3px',
                      display: 'flex',
                    }}
                  >
                    <X size={11} />
                  </button>
                </div>
              ))}
            </div>
          )}
          <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
          <button className="add-btn" onClick={() => photoRef.current?.click()}>
            <ImagePlus size={13} /> Добавить фото
          </button>
        </div>
      </div>
    </div>
  );
}

export function SlideSection({ kp, onChange }: Props) {
  function addSlide() {
    const newSlide: Slide = {
      id: uid(),
      title: '',
      items: [],
      photos: [],
    };
    onChange({ ...kp, slides: [...kp.slides, newSlide] });
  }

  function deleteSlide(id: string) {
    onChange({ ...kp, slides: kp.slides.filter(s => s.id !== id) });
  }

  return (
    <div className="editor-section">
      <SectionHeader icon={<Layers size={16} />} title="Слайды" />

      {kp.slides.map((slide, index) => (
        <SlideCard
          key={slide.id}
          slide={slide}
          index={index}
          kp={kp}
          onChange={onChange}
          onDelete={() => deleteSlide(slide.id)}
          canDelete={kp.slides.length > 1}
        />
      ))}

      <button
        onClick={addSlide}
        style={{
          width: '100%',
          padding: '10px',
          border: '2px dashed rgba(201,168,76,0.25)',
          borderRadius: 12,
          background: 'rgba(201,168,76,0.03)',
          color: '#C9A84C',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          fontSize: 13,
          transition: 'all 0.2s',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'rgba(201,168,76,0.08)';
          e.currentTarget.style.borderColor = 'rgba(201,168,76,0.45)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'rgba(201,168,76,0.03)';
          e.currentTarget.style.borderColor = 'rgba(201,168,76,0.25)';
        }}
      >
        <Plus size={15} />
        Добавить слайд
      </button>
    </div>
  );
}
