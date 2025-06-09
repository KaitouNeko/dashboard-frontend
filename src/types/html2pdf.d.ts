declare module 'html2pdf.js' {
  interface Html2PdfOptions {
    margin?: number | [number, number, number, number];
    filename?: string;
    image?: {
      type?: string;
      quality?: number;
    };
    html2canvas?: {
      scale?: number;
      letterRendering?: boolean;
      useCORS?: boolean;
      logging?: boolean;
      allowTaint?: boolean;
      foreignObjectRendering?: boolean;
    };
    jsPDF?: {
      unit?: string;
      format?: string;
      orientation?: 'portrait' | 'landscape';
      compress?: boolean;
      language?: string;
    };
    fontFaces?: Array<{
      family: string;
      style: string;
      weight: string;
      src: string | null;
    }>;
  }

  interface Html2Pdf {
    set(options: Html2PdfOptions): Html2Pdf;
    from(element: HTMLElement): Html2Pdf;
    save(): Promise<void>;
  }

  export default function html2pdf(): Html2Pdf;
} 