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
    const elementStyles = kp.elementStyles ?? {};
    const { generatePreviewElements, getTotalPages } = await import('../utils/layoutUtils');
    const elements = generatePreviewElements(kp, elementStyles);
    const totalPages = getTotalPages(kp);

    // Собираем HTML всех страниц
    let pagesHtml = '';

    for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
      const pageElements = elements.filter(e => e.pageIndex === pageIndex);
      const isTitle = pageIndex === 0;
      const isCalc = pageIndex === totalPages - 1;

      let bgStyle = 'background:#ffffff;';
      if (isTitle) bgStyle = 'background:linear-gradient(160deg,#0a2e1a 0%,#14532d 40%,#0a2e1a 100%);';
      else if (isCalc) bgStyle = 'background:linear-gradient(180deg,#f8fafc 0%,#ffffff 100%);';

      let innerHtml = '';

      if (isTitle) {
        innerHtml += `<div style="position:absolute;left:48px;top:72px;width:60px;height:4px;background:linear-gradient(90deg,#16a34a,#4ade80);border-radius:2px;"></div>`;
      }
      if (!isTitle && !isCalc) {
        innerHtml += `<div style="position:absolute;left:0;top:0;width:6px;height:100%;background:linear-gradient(180deg,#16a34a 0%,#4ade80 50%,#16a34a 100%);"></div>`;
      }

      innerHtml += `<div style="position:absolute;bottom:14px;right:20px;font-size:10px;font-family:Inter,sans-serif;color:${isTitle ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)'};">${pageIndex + 1}</div>`;

      for (const element of pageElements) {
        const { bounds, style } = element;
        const base = `position:absolute;left:${bounds.x}px;top:${bounds.y}px;width:${bounds.width}px;height:${bounds.height}px;overflow:hidden;box-sizing:border-box;`;

        if (element.type === 'image' && element.imageUrl) {
          innerHtml += `<div style="${base}"><img src="${element.imageUrl}" style="width:100%;height:100%;object-fit:contain;display:block;border-radius:4px;" /></div>`;
        } else if (element.type === 'table' && element.tableData) {
          const { headers, cells, numColumns, numRows } = element.tableData;
          const colW = `${100 / numColumns}%`;
          let tableHtml = `<table style="width:100%;border-collapse:collapse;font-size:${style.fontSize}px;font-family:${style.fontFamily},sans-serif;">`;
          tableHtml += `<thead><tr>`;
          headers.forEach(h => {
            tableHtml += `<th style="padding:8px 10px;text-align:left;width:${colW};background:#14532d;color:#ffffff;font-weight:700;border:1px solid rgba(22,163,74,0.4);font-size:${style.fontSize}px;">${h || ''}</th>`;
          });
          tableHtml += `</tr></thead><tbody>`;
          for (let ri = 0; ri < numRows; ri++) {
            const rowBg = ri % 2 === 0 ? '#ffffff' : '#f0fdf4';
            tableHtml += `<tr style="background:${rowBg};">`;
            for (let ci = 0; ci < numColumns; ci++) {
              tableHtml += `<td style="padding:7px 10px;border:1px solid rgba(0,0,0,0.1);color:#1e293b;font-size:${style.fontSize}px;">${cells[ri]?.[ci] || ''}</td>`;
            }
            tableHtml += `</tr>`;
          }
          tableHtml += `</tbody></table>`;
          innerHtml += `<div style="${base}">${tableHtml}</div>`;
        } else {
          const textColor = isTitle ? '#ffffff' : '#1e293b';
          innerHtml += `<div style="${base}font-size:${style.fontSize}px;font-weight:${style.fontWeight};font-family:${style.fontFamily},sans-serif;color:${textColor};line-height:1.5;word-break:break-word;">${element.content}</div>`;
        }
      }

      pagesHtml += `
        <div class="page" style="width:${A4_WIDTH}px;height:${A4_HEIGHT}px;position:relative;overflow:hidden;${bgStyle}margin:0;padding:0;page-break-after:always;">
          ${innerHtml}
        </div>`;
    }

    const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet"/>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family: Inter, sans-serif; }
    @page { size: ${A4_WIDTH}px ${A4_HEIGHT}px; margin: 0; }
    @media print {
      html, body { width:${A4_WIDTH}px; }
      .page { page-break-after: always; page-break-inside: avoid; }
    }
  </style>
</head>
<body>${pagesHtml}</body>
</html>`;

    // Открываем в новом окне и вызываем печать в PDF
    const printWindow = window.open('', '_blank', `width=${A4_WIDTH},height=${A4_HEIGHT}`);
    if (!printWindow) {
      toast.error('Браузер заблокировал всплывающее окно. Разрешите popup для этого сайта.');
      setIsExporting(false);
      return;
    }

    printWindow.document.write(fullHtml);
    printWindow.document.close();

    // Ждём загрузки шрифтов и картинок
    await new Promise<void>(resolve => {
      printWindow.onload = () => resolve();
      setTimeout(resolve, 2000); // fallback если onload не сработал
    });

    printWindow.focus();
    printWindow.print();

    toast.success('Откроется диалог печати — выбери "Сохранить как PDF"');

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
