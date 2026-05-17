import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { ArrowLeft, Save, Download, Eye, Loader2, FileText } from 'lucide-react';
import type { KPData } from '../types/kp';
import { useKPStore, createNewKP } from '../store/kpStore';
import { EditorPanel } from '../components/editor/EditorPanel';
import { PreviewPanel } from '../components/preview/PreviewPanel';
import { KPPrintTemplate } from '../components/print/KPPrintTemplate';
import { A4_WIDTH, A4_HEIGHT, getTotalPages } from '../utils/layoutUtils';

export function CreateKPPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getProposal, saveProposal } = useKPStore();
  const [kp, setKP] = useState<KPData | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!id) {
      const newKP = createNewKP();
      saveProposal(newKP);
      navigate(`/create/${newKP.id}`, { replace: true });
      return;
    }
    const existing = getProposal(id);
    if (existing) {
      setKP(existing);
    } else {
      const newKP = createNewKP();
      newKP.id = id;
      setKP(newKP);
      saveProposal(newKP);
    }
  }, [id]);

  const handleChange = useCallback((updated: KPData) => {
    setKP(updated);
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      saveProposal(updated);
    }, 1000);
  }, [saveProposal]);

  function handleSave() {
    if (!kp) return;
    setIsSaving(true);
    saveProposal(kp);
    setTimeout(() => {
      setIsSaving(false);
      toast.success('КП сохранено');
    }, 400);
  }

  async function handleExportPDF() {
    if (!kp) return;
    setIsExporting(true);

    try {
      const { default: html2canvas } = await import('html2canvas');
      const { default: jsPDF } = await import('jspdf');

      // Даём браузеру время отрендерить скрытый шаблон
      await new Promise(resolve => setTimeout(resolve, 300));

      const printRoot = document.getElementById('kp-print-root');
      if (!printRoot) {
        toast.error('Шаблон для печати не найден');
        setIsExporting(false);
        return;
      }

      const pages = printRoot.querySelectorAll<HTMLElement>('[data-print-page]');
      if (pages.length === 0) {
        toast.error('Нет страниц для экспорта');
        setIsExporting(false);
        return;
      }

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [A4_WIDTH, A4_HEIGHT],
        compress: true,
      });

      for (let i = 0; i < pages.length; i++) {
        const canvas = await html2canvas(pages[i], {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          width: A4_WIDTH,
          height: A4_HEIGHT,
          windowWidth: A4_WIDTH,
          windowHeight: A4_HEIGHT,
          logging: false,
          backgroundColor: '#ffffff',
        });

        if (i > 0) pdf.addPage();
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        pdf.addImage(imgData, 'JPEG', 0, 0, A4_WIDTH, A4_HEIGHT);
      }

      const fileName = `${kp.name || 'КП'}_${new Date().toLocaleDateString('ru-RU').replace(/\./g, '-')}.pdf`;
      pdf.save(fileName);
      toast.success('PDF сохранён');
    } catch (err) {
      console.error('PDF export error:', err);
      toast.error('Ошибка экспорта PDF');
    } finally {
      setIsExporting(false);
    }
  }

  if (!kp) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#080D1C' }}>
        <Loader2 size={32} style={{ color: '#16a34a', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#080D1C', overflow: 'hidden' }}>

      {/* Top bar */}
      <div style={{
        height: 56,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '0 16px',
        background: 'rgba(13,21,37,0.95)',
        borderBottom: '1px solid rgba(22,163,74,0.15)',
        flexShrink: 0,
        backdropFilter: 'blur(12px)',
      }}>
        <button
          onClick={() => navigate('/')}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            color: '#94A3B8', background: 'none', border: 'none',
            cursor: 'pointer', fontSize: 13, padding: '6px 10px',
            borderRadius: 8, transition: 'all 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = '#F1F5F9')}
          onMouseLeave={e => (e.currentTarget.style.color = '#94A3B8')}
        >
          <ArrowLeft size={15} />
          Назад
        </button>

        <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.08)' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 24, height: 24, borderRadius: 6,
            background: 'linear-gradient(135deg, #16a34a, #4ade80)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <FileText size={13} color="#ffffff" />
          </div>
          <input
            value={kp.name}
            onChange={(e) => handleChange({ ...kp, name: e.target.value })}
            style={{
              background: 'none', border: 'none', outline: 'none',
              color: '#F1F5F9', fontSize: 14, fontWeight: 600,
              minWidth: 200,
            }}
            placeholder="Название КП"
          />
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>

          <div style={{
            padding: '4px 10px',
            background: 'rgba(22,163,74,0.1)',
            border: '1px solid rgba(22,163,74,0.2)',
            borderRadius: 8,
            color: '#16a34a',
            fontSize: 12,
          }}>
            {getTotalPages(kp)} стр.
          </div>

          <button
            onClick={handleSave}
            disabled={isSaving}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '7px 14px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8,
              color: '#F1F5F9',
              cursor: 'pointer',
              fontSize: 13,
              transition: 'all 0.15s',
            }}
          >
            {isSaving
              ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
              : <Save size={14} />}
            Сохранить
          </button>

          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '7px 16px',
              background: 'linear-gradient(135deg, #16a34a, #4ade80)',
              border: 'none',
              borderRadius: 8,
              color: '#ffffff',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600,
              transition: 'all 0.15s',
            }}
          >
            {isExporting
              ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
              : <Download size={14} />}
            Экспорт PDF
          </button>
        </div>
      </div>

      {/* Main split layout */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* Left: Editor */}
        <div style={{
          width: '42%',
          minWidth: 340,
          maxWidth: 520,
          flexShrink: 0,
          borderRight: '1px solid rgba(22,163,74,0.1)',
          background: 'rgba(13,21,37,0.6)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}>
          <div style={{
            padding: '12px 20px',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            color: '#64748B',
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}>
            Редактор содержимого
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <EditorPanel kp={kp} onChange={handleChange} />
          </div>
        </div>

        {/* Right: Preview */}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{
            padding: '12px 20px',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            color: '#64748B',
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            background: 'rgba(13,21,37,0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            <Eye size={12} />
            Визуальный предпросмотр А4
            <span style={{ marginLeft: 'auto', fontWeight: 400, textTransform: 'none', fontSize: 11, color: '#475569' }}>
              Перетащите и измените размер элементов
            </span>
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <PreviewPanel kp={kp} previewRef={previewRef} />
          </div>
        </div>
      </div>

      {/* Скрытый шаблон для экспорта PDF — не виден пользователю */}
      <KPPrintTemplate kp={kp} />

    </div>
  );
}
