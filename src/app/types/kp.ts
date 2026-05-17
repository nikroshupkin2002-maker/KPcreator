export type FontWeight = 'normal' | 'bold' | '600';
export type FontFamily = 'Inter' | 'Montserrat' | 'Playfair Display' | 'Roboto';

export interface TextStyle {
  fontSize: number;
  fontWeight: FontWeight;
  fontFamily: FontFamily;
}

export interface SlideInfoItem {
  id: string;
  type: 'info' | 'additional';
  content: string;
}

export interface SlidePhoto {
  id: string;
  dataUrl: string;
  naturalWidth?: number;
  naturalHeight?: number;
}

export interface Slide {
  id: string;
  title: string;
  items: SlideInfoItem[];
  photos: SlidePhoto[];
}

export interface CalculationTable {
  title: string;
  numColumns: number;
  numRows: number;
  headers: string[];
  cells: string[][];
  info: string;
}

export interface Employee {
  name: string;
  phone: string;
  photoDataUrl: string | null;
}

export interface ElementBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SavedElementState {
  bounds: ElementBounds;
  style: TextStyle;
}

export interface PreviewElement {
  id: string;
  type: 'text' | 'image' | 'table';
  pageIndex: number;
  bounds: ElementBounds;
  content: string;
  imageUrl?: string;
  tableData?: {
    headers: string[];
    cells: string[][];
    numColumns: number;
    numRows: number;
  };
  style: TextStyle;
}

export interface KPData {
  id: string;
  name: string;
  companyName: string;
  titlePhotoDataUrl: string | null;
  slides: Slide[];
  calculationTable: CalculationTable;
  employee: Employee;
  freedomPhotoDataUrl: string | null;
  elementStyles: Record<string, SavedElementState>;
  createdAt: string;
  updatedAt: string;
}
