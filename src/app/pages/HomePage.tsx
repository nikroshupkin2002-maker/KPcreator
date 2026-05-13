import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Plus, FileText, Clock, Trash2, Copy, ArrowRight, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useKPStore, createNewKP } from '../store/kpStore';
import type { KPData } from '../types/kp';

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' });
}

export function HomePage() {
  const navigate = useNavigate();
  const { proposals, saveProposal, deleteProposal } = useKPStore();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  function handleCreateNew() {
    const kp = createNewKP();
    saveProposal(kp);
    navigate(`/create/${kp.id}`);
  }

  function handleUseAsTemplate(kp: KPData) {
    const newKP = createNewKP(`Копия: ${kp.name}`);
    const copy: KPData = {
      ...kp,
      id: newKP.id,
      name: newKP.name,
      createdAt: newKP.createdAt,
      updatedAt: newKP.updatedAt,
    };
    saveProposal(copy);
    navigate(`/create/${copy.id}`);
    toast.success('КП создано на основе шаблона');
  }

  function handleEdit(kp: KPData) {
    navigate(`/create/${kp.id}`);
  }

  function handleDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    deleteProposal(id);
    toast.success('КП удалено');
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #080D1C 0%, #0D1525 50%, #080D1C 100%)' }}>
      {/* Ambient light effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div style={{
          position: 'absolute', top: '-20%', left: '-10%',
          width: '600px', height: '600px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', bottom: '-20%', right: '-10%',
          width: '800px', height: '800px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 70%)',
        }} />
      </div>

      {/* Header */}
      <header style={{ borderBottom: '1px solid rgba(201,168,76,0.15)' }}>
        <div className="max-w-7xl mx-auto px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div style={{
              width: 36, height: 36, borderRadius: 8,
              background: 'linear-gradient(135deg, #C9A84C, #F0C85A)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <FileText size={18} color="#080D1C" />
            </div>
            <span style={{ color: '#F1F5F9', letterSpacing: '0.05em' }} className="text-lg font-semibold">
              КП <span style={{ color: '#C9A84C' }}>Studio</span>
            </span>
          </div>
          <div style={{ color: '#64748B', fontSize: 13 }}>
            {proposals.length} {proposals.length === 1 ? 'предложение' : proposals.length >= 2 && proposals.length <= 4 ? 'предложения' : 'предложений'}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-8 pt-24 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8" style={{
            background: 'rgba(201,168,76,0.1)',
            border: '1px solid rgba(201,168,76,0.25)',
          }}>
            <Sparkles size={14} style={{ color: '#C9A84C' }} />
            <span style={{ color: '#C9A84C', fontSize: 13, letterSpacing: '0.05em' }}>
              Профессиональные коммерческие предложения
            </span>
          </div>

          <h1 style={{
            fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            background: 'linear-gradient(135deg, #F1F5F9 0%, #C9A84C 60%, #F0C85A 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '1.5rem',
          }}>
            Создавайте КП<br />уровня премиум
          </h1>

          <p style={{ color: '#94A3B8', fontSize: 18, maxWidth: 520, margin: '0 auto 3rem' }}>
            Профессиональный редактор с визуальным предпросмотром, экспортом в PDF и хранением на платформе
          </p>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleCreateNew}
            className="inline-flex items-center gap-3 px-10 py-5 rounded-2xl text-lg font-semibold"
            style={{
              background: 'linear-gradient(135deg, #C9A84C 0%, #F0C85A 100%)',
              color: '#080D1C',
              boxShadow: '0 0 40px rgba(201,168,76,0.35), 0 8px 32px rgba(0,0,0,0.4)',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <Plus size={22} />
            Создать КП
            <ArrowRight size={20} />
          </motion.button>
        </motion.div>

        {/* Stats */}
        {proposals.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex justify-center gap-12 mt-16"
          >
            {[
              { label: 'Всего КП', value: proposals.length },
              { label: 'Слайдов создано', value: proposals.reduce((a, p) => a + p.slides.length, 0) },
            ].map(stat => (
              <div key={stat.label} className="text-center">
                <div style={{ color: '#C9A84C', fontSize: 32, fontWeight: 700 }}>{stat.value}</div>
                <div style={{ color: '#64748B', fontSize: 13 }}>{stat.label}</div>
              </div>
            ))}
          </motion.div>
        )}
      </section>

      {/* Proposals Gallery */}
      {proposals.length > 0 && (
        <section className="max-w-7xl mx-auto px-8 pb-24">
          <div className="flex items-center gap-4 mb-8">
            <div style={{ width: 3, height: 28, background: 'linear-gradient(180deg, #C9A84C, #F0C85A)', borderRadius: 2 }} />
            <h2 style={{ color: '#F1F5F9', fontSize: 22, fontWeight: 600 }}>
              Сохранённые КП
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {proposals.map((kp, index) => (
              <motion.div
                key={kp.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onMouseEnter={() => setHoveredId(kp.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => handleEdit(kp)}
                style={{
                  background: hoveredId === kp.id
                    ? 'linear-gradient(135deg, #1A2235 0%, #1E2A40 100%)'
                    : 'linear-gradient(135deg, #111827 0%, #1A2235 100%)',
                  border: hoveredId === kp.id
                    ? '1px solid rgba(201,168,76,0.4)'
                    : '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 16,
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  boxShadow: hoveredId === kp.id
                    ? '0 8px 40px rgba(201,168,76,0.12), 0 4px 16px rgba(0,0,0,0.4)'
                    : '0 4px 16px rgba(0,0,0,0.3)',
                  overflow: 'hidden',
                }}
              >
                {/* Card preview area */}
                <div style={{
                  height: 160,
                  background: 'linear-gradient(135deg, #0D1525 0%, #111827 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                }}>
                  {kp.titlePhotoDataUrl ? (
                    <img
                      src={kp.titlePhotoDataUrl}
                      alt="preview"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7 }}
                    />
                  ) : (
                    <div style={{ textAlign: 'center' }}>
                      <FileText size={32} style={{ color: '#C9A84C', opacity: 0.5, margin: '0 auto 8px' }} />
                      <div style={{ color: '#475569', fontSize: 13 }}>
                        {kp.slides.length} {kp.slides.length === 1 ? 'слайд' : kp.slides.length <= 4 ? 'слайда' : 'слайдов'}
                      </div>
                    </div>
                  )}

                  {/* Overlay on hover */}
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'rgba(8,13,28,0.5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    gap: 12,
                    opacity: hoveredId === kp.id ? 1 : 0,
                    transition: 'opacity 0.25s',
                  }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleEdit(kp); }}
                      style={{
                        background: 'linear-gradient(135deg, #C9A84C, #F0C85A)',
                        color: '#080D1C',
                        border: 'none',
                        borderRadius: 10,
                        padding: '8px 16px',
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 6,
                      }}
                    >
                      Открыть
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleUseAsTemplate(kp); }}
                      style={{
                        background: 'rgba(255,255,255,0.1)',
                        color: '#F1F5F9',
                        border: '1px solid rgba(255,255,255,0.15)',
                        borderRadius: 10,
                        padding: '8px 16px',
                        fontSize: 13,
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 6,
                      }}
                    >
                      <Copy size={13} />
                      Шаблон
                    </button>
                  </div>
                </div>

                <div style={{ padding: '16px 20px 20px' }}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div style={{ color: '#F1F5F9', fontWeight: 600, fontSize: 15, marginBottom: 4 }}>
                        {kp.name || 'Без названия'}
                      </div>
                      {kp.companyName && (
                        <div style={{ color: '#C9A84C', fontSize: 13, marginBottom: 8 }}>
                          {kp.companyName}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={(e) => handleDelete(kp.id, e)}
                      style={{
                        background: 'rgba(212,24,61,0.1)',
                        border: '1px solid rgba(212,24,61,0.2)',
                        borderRadius: 8,
                        padding: '6px',
                        cursor: 'pointer',
                        color: '#D4183D',
                        display: 'flex',
                        flexShrink: 0,
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1.5" style={{ color: '#475569', fontSize: 12 }}>
                      <Clock size={12} />
                      {formatDate(kp.updatedAt || kp.createdAt)}
                    </div>
                    <div style={{
                      background: 'rgba(201,168,76,0.1)',
                      border: '1px solid rgba(201,168,76,0.2)',
                      borderRadius: 6,
                      padding: '2px 8px',
                      fontSize: 11,
                      color: '#C9A84C',
                    }}>
                      {kp.slides.length} слайд{kp.slides.length === 1 ? '' : kp.slides.length <= 4 ? 'а' : 'ов'}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Create new card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: proposals.length * 0.05 }}
              onClick={handleCreateNew}
              style={{
                background: 'rgba(201,168,76,0.03)',
                border: '2px dashed rgba(201,168,76,0.25)',
                borderRadius: 16,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
                minHeight: 240,
                transition: 'all 0.25s ease',
              }}
              whileHover={{ background: 'rgba(201,168,76,0.07)', borderColor: 'rgba(201,168,76,0.5)' }}
            >
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: 'rgba(201,168,76,0.1)',
                border: '1px solid rgba(201,168,76,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Plus size={22} style={{ color: '#C9A84C' }} />
              </div>
              <span style={{ color: '#94A3B8', fontSize: 14 }}>Создать новое КП</span>
            </motion.div>
          </div>
        </section>
      )}

      {/* Empty state */}
      {proposals.length === 0 && (
        <section className="max-w-7xl mx-auto px-8 pb-24">
          <div style={{
            textAlign: 'center',
            padding: '80px 40px',
            border: '1px dashed rgba(201,168,76,0.2)',
            borderRadius: 24,
            background: 'rgba(201,168,76,0.02)',
          }}>
            <FileText size={48} style={{ color: 'rgba(201,168,76,0.3)', margin: '0 auto 16px' }} />
            <div style={{ color: '#64748B', fontSize: 16 }}>
              Нет созданных КП. Начните с нажатия кнопки выше.
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
