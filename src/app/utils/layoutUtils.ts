import type { KPData, PreviewElement, ElementBounds, TextStyle } from '../types/kp';

export const A4_WIDTH = 794;
export const A4_HEIGHT = 1122;
const PADDING = 48;
const CONTENT_WIDTH = A4_WIDTH - PADDING * 2;

function defaultStyle(fontSize = 16, fontWeight: TextStyle['fontWeight'] = 'normal'): TextStyle {
  return { fontSize, fontWeight, fontFamily: 'Inter' };
}

export type SavedElementState = { bounds: ElementBounds; style: TextStyle };

export function generatePreviewElements(
  kp: KPData,
  existingBounds: Record<string, SavedElementState> = {}
): PreviewElement[] {
  const elements: PreviewElement[] = [];

  function el(
    id: string,
    pageIndex: number,
    type: PreviewElement['type'],
    defaultBounds: ElementBounds,
    content: string,
    defaultStyle_: TextStyle,
    extra?: Partial<PreviewElement>
  ): PreviewElement {
    const saved = existingBounds[id];
    return {
      id,
      type,
      pageIndex,
      bounds: saved ? saved.bounds : defaultBounds,
      content,
      style: saved?.style ?? defaultStyle_,
      ...extra,
    };
  }

  // === PAGE 0: Title page ===
  elements.push(
    el('title-company', 0, 'text',
      { x: PADDING, y: 120, width: CONTENT_WIDTH, height: 80 },
      kp.companyName || 'Название компании',
      defaultStyle(40, 'bold')
    )
  );

  if (kp.titlePhotoDataUrl) {
    elements.push(
      el('title-photo', 0, 'image',
        { x: PADDING, y: 240, width: CONTENT_WIDTH, height: 500 },
        '',
        defaultStyle(16),
        { imageUrl: kp.titlePhotoDataUrl }
      )
    );
  }

  // === SLIDE PAGES ===
  kp.slides.forEach((slide, si) => {
    const pageIndex = si + 1;
    let yOffset = 60;

    elements.push(
      el(`slide-${si}-title`, pageIndex, 'text',
        { x: PADDING, y: yOffset, width: CONTENT_WIDTH, height: 60 },
        slide.title || `Слайд ${si + 1}`,
        defaultStyle(28, 'bold')
      )
    );
    yOffset += 80;

    slide.items.forEach((item, ii) => {
      const h = item.type === 'additional' ? 36 : 56;
      const fs = item.type === 'additional' ? 13 : 16;
      elements.push(
        el(`slide-${si}-item-${ii}`, pageIndex, 'text',
          { x: item.type === 'additional' ? PADDING + 20 : PADDING, y: yOffset, width: CONTENT_WIDTH - (item.type === 'additional' ? 20 : 0), height: h },
          item.content || (item.type === 'additional' ? 'Дополнительная информация' : 'Информация'),
          defaultStyle(fs)
        )
      );
      yOffset += h + 12;
    });

    slide.photos.forEach((photo, pi) => {
      const w = pi === 0 ? CONTENT_WIDTH : CONTENT_WIDTH / 2 - 8;
      const x = pi > 0 && pi % 2 === 1 ? PADDING + CONTENT_WIDTH / 2 + 8 : PADDING;
      elements.push(
        el(`slide-${si}-photo-${pi}`, pageIndex, 'image',
          { x, y: yOffset, width: w, height: 280 },
          '',
          defaultStyle(16),
          { imageUrl: photo.dataUrl }
        )
      );
      if (pi === 0 || pi % 2 === 1) yOffset += 292;
    });
  });

  // === LAST PAGE: Calculation ===
  const calcPage = kp.slides.length + 1;
  let calcY = 48;

  elements.push(
    el('calc-title', calcPage, 'text',
      { x: PADDING, y: calcY, width: CONTENT_WIDTH, height: 52 },
      kp.calculationTable.title || 'Расчёт стоимости',
      defaultStyle(24, 'bold')
    )
  );
  calcY += 68;

  const tableH = kp.calculationTable.numRows * 42 + 50;
  elements.push(
    el('calc-table', calcPage, 'table',
      { x: PADDING, y: calcY, width: CONTENT_WIDTH, height: tableH },
      '',
      defaultStyle(13),
      {
        tableData: {
          headers: kp.calculationTable.headers,
          cells: kp.calculationTable.cells,
          numColumns: kp.calculationTable.numColumns,
          numRows: kp.calculationTable.numRows,
        },
      }
    )
  );
  calcY += tableH + 20;

  if (kp.calculationTable.info) {
    elements.push(
      el('calc-info', calcPage, 'text',
        { x: PADDING, y: calcY, width: CONTENT_WIDTH, height: 60 },
        kp.calculationTable.info,
        defaultStyle(14)
      )
    );
    calcY += 76;
  }

  const employeeY = Math.max(calcY, A4_HEIGHT - 280);
  elements.push(
    el('employee-name', calcPage, 'text',
      { x: PADDING, y: employeeY, width: 300, height: 32 },
      kp.employee.name || 'Имя Фамилия',
      defaultStyle(16, 'bold')
    )
  );
  elements.push(
    el('employee-phone', calcPage, 'text',
      { x: PADDING, y: employeeY + 40, width: 300, height: 28 },
      kp.employee.phone || '+7 000 000-00-00',
      defaultStyle(14)
    )
  );

  if (kp.employee.photoDataUrl) {
    elements.push(
      el('employee-photo', calcPage, 'image',
        { x: PADDING + 320, y: employeeY - 20, width: 100, height: 120 },
        '',
        defaultStyle(16),
        { imageUrl: kp.employee.photoDataUrl }
      )
    );
  }

  if (kp.freedomPhotoDataUrl) {
    elements.push(
      el('freedom-photo', calcPage, 'image',
        { x: A4_WIDTH - PADDING - 160, y: A4_HEIGHT - 100, width: 160, height: 60 },
        '',
        defaultStyle(16),
        { imageUrl: kp.freedomPhotoDataUrl }
      )
    );
  }

  return elements;
}

export function getTotalPages(kp: KPData): number {
  return kp.slides.length + 2; // title + slides + calc
}
