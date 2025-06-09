import html2pdf from 'html2pdf.js';

// PDF生成選項介面
interface PDFGenerationOptions {
  filename?: string;
  margin?: number | [number, number, number, number]; // 上、右、下、左邊距 (毫米)
  pageSize?: string; // 'a4', 'letter' 等
  orientation?: 'portrait' | 'landscape';
  scale?: number; // 渲染比例，用於提高解析度
  fontFaces?: {
    family: string;
    style: string;
    weight: string;
    src: string | null;
  }[];
}

/**
 * 替換不支持的CSS顏色函數為兼容的格式
 * @param element 需要處理的DOM元素
 * @returns 返回被修改的CSS屬性列表，用於稍後還原
 */
const replaceUnsupportedCssColors = (element: HTMLElement): Map<HTMLElement, {prop: string, value: string}[]> => {
  const modifiedStyles = new Map<HTMLElement, {prop: string, value: string}[]>();
  
  // 主要顏色替換映射 - 將oklch值映射到近似的hex/rgb值
  const colorReplacements: {[key: string]: string} = {
    // 常見的oklch顏色近似值，可以根據需要擴展
    'oklch(0.61 0.19 12)': '#1e88e5', // 藍色
    'oklch(0.65 0.18 49)': '#ef6c00', // 橙色
    'oklch(0.76 0.19 129)': '#4caf50', // 綠色
    'oklch(0.55 0.2 25)': '#7e57c2', // 紫色
  };
  
  // 查找所有子元素
  const allElements = element.querySelectorAll('*');
  
  // 處理主元素和所有子元素
  [element, ...Array.from(allElements)].forEach((el) => {
    const htmlEl = el as HTMLElement;
    const computedStyle = window.getComputedStyle(htmlEl);
    const modifications: {prop: string, value: string}[] = [];
    
    // 檢查與顏色相關的CSS屬性
    const colorProps = ['color', 'background-color', 'border-color', 'fill', 'stroke'];
    
    for (const prop of colorProps) {
      const value = computedStyle.getPropertyValue(prop);
      
      // 檢查是否使用了oklch顏色函數
      if (value.includes('oklch')) {
        let replacementValue = '';
        
        // 嘗試從映射表中查找替換值
        for (const [oklchPattern, replacement] of Object.entries(colorReplacements)) {
          if (value.includes(oklchPattern)) {
            replacementValue = replacement;
            break;
          }
        }
        
        // 如果沒有找到映射，使用一個默認顏色
        if (!replacementValue) {
          // 使用相對安全的顏色作為後備
          if (prop === 'color') replacementValue = '#333333';
          else if (prop === 'background-color') replacementValue = '#ffffff';
          else if (prop === 'border-color') replacementValue = '#e0e0e0';
          else replacementValue = '#000000'; // fill, stroke等
        }
        
        // 保存原始值用於還原
        modifications.push({prop, value});
        
        // 應用兼容的替換值
        htmlEl.style.setProperty(prop, replacementValue, 'important');
      }
    }
    
    // 如果有修改，存儲到映射中
    if (modifications.length > 0) {
      modifiedStyles.set(htmlEl, modifications);
    }
  });
  
  return modifiedStyles;
};

/**
 * 還原被替換的CSS顏色函數
 * @param modifiedStyles 之前修改的樣式映射
 */
const restoreOriginalStyles = (modifiedStyles: Map<HTMLElement, {prop: string, value: string}[]>) => {
  modifiedStyles.forEach((modifications, element) => {
    modifications.forEach(({prop, value}) => {
      element.style.setProperty(prop, value);
    });
  });
};

/**
 * 優化的PDF生成工具，特別加強對中文字型的支援
 * @param elementId 要轉換為PDF的HTML元素ID
 * @param options PDF生成選項
 * @returns Promise<void>
 */
export const generatePDFWithChineseSupport = async (
  elementId: string,
  options: PDFGenerationOptions = {}
): Promise<void> => {
  const element = document.getElementById(elementId);

  if (!element) {
    throw new Error(`找不到ID為 "${elementId}" 的元素`);
  }

  // 合併預設選項與自訂選項
  const defaultOptions: PDFGenerationOptions = {
    filename: 'document.pdf',
    margin: 10,
    pageSize: 'a4',
    orientation: 'portrait',
    scale: 2,
    fontFaces: [
      {
        family: 'Noto Sans TC',
        style: 'normal',
        weight: 'normal',
        src: 'url(https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700&display=swap)'
      },
      {
        family: 'Microsoft JhengHei',
        style: 'normal',
        weight: 'normal',
        src: null // 使用系統內建字型
      },
      {
        family: '思源黑體',
        style: 'normal',
        weight: 'normal',
        src: null // 使用系統內建字型
      }
    ]
  };

  const mergedOptions = { ...defaultOptions, ...options };

  // 配置html2pdf選項
  const pdfOptions = {
    margin: 0, // 移除邊距，由CSS控制
    filename: mergedOptions.filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: mergedOptions.scale,
      letterRendering: true,
      useCORS: true,
      logging: false,
      allowTaint: true,
      foreignObjectRendering: false,
      width: element.offsetWidth,
      height: element.offsetHeight,
      windowWidth: document.documentElement.offsetWidth,
      imageTimeout: 15000,
      backgroundColor: '#ffffff', // 設定白色背景
      removeContainer: true,
      ignoreElements: function(element: Element) {
        // 不忽略任何元素，確保所有背景色都被渲染
        return false;
      },
      onclone: (clonedDoc: Document) => {
        // 在複製的文檔中設置正確的字體和樣式
        const clonedElement = clonedDoc.getElementById(elementId);
        if (clonedElement) {
          clonedElement.style.width = `${element.offsetWidth}px`;
          
          // 強制背景色顯示和頁面樣式
          const styleElement = clonedDoc.createElement('style');
          styleElement.textContent = `
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            
            /* 頁面設定 */
            .page {
              break-after: page !important;
              break-before: page !important;
              overflow: visible !important;
              position: relative !important;
              height: 297mm !important;
              max-height: none !important;
              width: 210mm !important;
              padding: 0 !important;
              margin: 0 !important;
              box-sizing: border-box !important;
            }
            
            /* 第一頁不需要 break-before */
            .page:first-child {
              break-before: auto !important;
            }
            
            /* 最後一頁不需要 break-after */
            .page:last-child {
              break-after: auto !important;
            }
            
            /* 頁面容器設定 */
            .page-container {
              margin: 0 !important;
              padding: 0 !important;
              display: block !important;
            }
            
            /* 文字對齊樣式 - 確保在 PDF 中正確顯示 */
            .text-center {
              text-align: center !important;
            }
            .text-left {
              text-align: left !important;
            }
            .text-right {
              text-align: right !important;
            }
            .justify-center {
              justify-content: center !important;
            }
            .justify-between {
              justify-content: space-between !important;
            }
            .items-center {
              align-items: center !important;
            }
            .mx-auto {
              margin-left: auto !important;
              margin-right: auto !important;
            }
            
            /* 保留重要的間距類別 */
            .mt-6 { margin-top: 1.5rem !important; }
            .mt-3 { margin-top: 0.75rem !important; }
            .mt-1 { margin-top: 0.25rem !important; }
            .mt-4 { margin-top: 1rem !important; }
            .mt-8 { margin-top: 2rem !important; }
            .mt-10 { margin-top: 2.5rem !important; }
            .mt-12 { margin-top: 3rem !important; }
            .mt-20 { margin-top: 5rem !important; }
            .mt-auto { margin-top: auto !important; }
            
            .mb-1 { margin-bottom: 0.25rem !important; }
            .mb-2 { margin-bottom: 0.5rem !important; }
            .mb-3 { margin-bottom: 0.75rem !important; }
            .mb-4 { margin-bottom: 1rem !important; }
            .mb-6 { margin-bottom: 1.5rem !important; }
            .mb-8 { margin-bottom: 2rem !important; }
            .mb-10 { margin-bottom: 2.5rem !important; }
            
            .p-4 { padding: 1rem !important; }
            .p-6 { padding: 1.5rem !important; }
            .p-8 { padding: 2rem !important; }
            .p-10 { padding: 2.5rem !important; }
            .px-2 { padding-left: 0.5rem !important; padding-right: 0.5rem !important; }
            .px-4 { padding-left: 1rem !important; padding-right: 1rem !important; }
            .py-1 { padding-top: 0.25rem !important; padding-bottom: 0.25rem !important; }
            .py-2 { padding-top: 0.5rem !important; padding-bottom: 0.5rem !important; }
            .pt-4 { padding-top: 1rem !important; }
            .pl-5 { padding-left: 1.25rem !important; }
            
            /* 間距樣式 */
            .space-y-6 > * + * { margin-top: 1.5rem !important; }
            .space-y-4 > * + * { margin-top: 1rem !important; }
            .space-y-3 > * + * { margin-top: 0.75rem !important; }
            .space-y-8 > * + * { margin-top: 2rem !important; }
            
            /* 標題邊距 */
            h1 {
              font-size: 24pt !important;
              margin: 0 0 15pt 0 !important;
            }
            h2 {
              font-size: 18pt !important;
              margin: 0 0 10pt 0 !important;
            }
            h3 {
              font-size: 14pt !important;
              margin: 0 0 8pt 0 !important;
            }
            
            /* flexbox 布局 */
            .flex {
              display: flex !important;
            }
            .flex-1 {
              flex: 1 !important;
            }
            .flex-col {
              flex-direction: column !important;
            }
            .flex-wrap {
              flex-wrap: wrap !important;
            }
            .gap-6 {
              gap: 1.5rem !important;
            }
            .gap-3 {
              gap: 0.75rem !important;
            }
            .gap-2 {
              gap: 0.5rem !important;
            }
            .gap-4 {
              gap: 1rem !important;
            }
            
            /* 如果瀏覽器不支援gap，使用margin替代 */
            @supports not (gap: 1rem) {
              .gap-3 > * {
                margin: 0.375rem !important;
              }
              .gap-3 {
                margin: 0 -0.375rem !important;
              }
              .gap-2 > * {
                margin: 0.25rem !important;
              }
              .gap-2 {
                margin: 0 -0.25rem !important;
              }
              .gap-4 > * {
                margin: 0.5rem !important;
              }
              .gap-4 {
                margin: 0 -0.5rem !important;
              }
            }
            
            /* inline-block 支援 */
            .inline-block {
              display: inline-block !important;
              vertical-align: top !important;
            }
            
            /* 文字不換行 */
            .whitespace-nowrap {
              white-space: nowrap !important;
            }
            
            /* 垂直對齊 */
            .align-top {
              vertical-align: top !important;
            }
            .align-middle {
              vertical-align: middle !important;
            }
            .align-baseline {
              vertical-align: baseline !important;
            }
            
            /* 寬度和高度 */
            .h-10 { height: 2.5rem !important; }
            .h-16 { height: 4rem !important; }
            .h-40 { height: 10rem !important; }
            .h-60 { height: 15rem !important; }
            .w-16 { width: 4rem !important; }
            .w-64 { width: 16rem !important; }
            .max-w-2xl { max-width: 42rem !important; }
            
            /* 邊框和圓角 */
            .rounded { border-radius: 0.25rem !important; }
            .rounded-lg { border-radius: 0.5rem !important; }
            .rounded-full { border-radius: 9999px !important; }
            .border-b { border-bottom-width: 1px !important; }
            .border-t { border-top-width: 1px !important; }
            .border-2 { border-width: 2px !important; }
            .border-gray-200 { border-color: #e5e7eb !important; }
            .border-blue-200 { border-color: #bfdbfe !important; }
            .border-purple-100 { border-color: #e9d5ff !important; }
            
            /* 字體粗細 */
            .font-medium { font-weight: 500 !important; }
            .font-semibold { font-weight: 600 !important; }
            .font-bold { font-weight: 700 !important; }
            
            .bg-gray-50, .bg-blue-50, .bg-green-50, .bg-purple-50, .bg-orange-50, .bg-indigo-50 {
              background-color: var(--bg-color) !important;
            }
            .bg-gray-50 { --bg-color: #f9fafb; background-color: #f9fafb !important; }
            .bg-blue-50 { --bg-color: #eff6ff; background-color: #eff6ff !important; }
            .bg-green-50 { --bg-color: #f0fdf4; background-color: #f0fdf4 !important; }
            .bg-purple-50 { --bg-color: #faf5ff; background-color: #faf5ff !important; }
            .bg-orange-50 { --bg-color: #fff7ed; background-color: #fff7ed !important; }
            .bg-indigo-50 { --bg-color: #eef2ff; background-color: #eef2ff !important; }
            .bg-blue-100 { background-color: #dbeafe !important; }
            .bg-green-100 { background-color: #dcfce7 !important; }
            .bg-purple-100 { background-color: #f3e8ff !important; }
            .bg-orange-100 { background-color: #fed7aa !important; }
            .bg-yellow-100 { background-color: #fef3c7 !important; }
            .bg-white { background-color: #ffffff !important; }
            .bg-teal-50 { background-color: #f0fdfa !important; }
            
            /* 紫色相關文字顏色 */
            .text-purple-700 { color: #7c3aed !important; }
            .text-purple-800 { color: #6b21a8 !important; }
            .text-purple-600 { color: #9333ea !important; }
            
            /* 邊框顏色 */
            .border-purple-100 { border-color: #e9d5ff !important; }
            .border-purple-200 { border-color: #ddd6fe !important; }
            .border-purple-300 { border-color: #c4b5fd !important; }
          `;
          clonedDoc.head.appendChild(styleElement);
          
          // 添加 flexbox 布局支援
          const layoutStyleElement = clonedDoc.createElement('style');
          layoutStyleElement.textContent = `
            .esg-metrics-grid {
              display: flex !important;
              gap: 1.5rem !important;
              margin: 2rem 0 !important;
              width: 100% !important;
              box-sizing: border-box !important;
            }
            .esg-metrics-grid > div {
              flex: 1 !important;
              min-width: 0 !important;
              width: 33.333% !important;
              box-sizing: border-box !important;
            }
            
            .flex {
              display: flex !important;
            }
            .flex-1 {
              flex: 1 !important;
            }
            .flex-col {
              flex-direction: column !important;
            }
            .flex-wrap {
              flex-wrap: wrap !important;
            }
            .justify-center {
              justify-content: center !important;
            }
            .justify-between {
              justify-content: space-between !important;
            }
            .items-center {
              align-items: center !important;
            }
            .gap-6 { gap: 1.5rem !important; }
            .gap-3 { gap: 0.75rem !important; }
            .gap-2 { gap: 0.5rem !important; }
            .gap-4 { gap: 1rem !important; }
            
            /* inline-block 佈局支援 */
            .inline-block {
              display: inline-block !important;
              vertical-align: top !important;
            }
            .text-center {
              text-align: center !important;
              width: 100% !important;
            }
            .align-top {
              vertical-align: top !important;
            }
            .whitespace-nowrap {
              white-space: nowrap !important;
            }
          `;
          clonedDoc.head.appendChild(layoutStyleElement);
          
          // 強制使用像素單位以保持精確間距
          const allTextElements = clonedElement.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div');
          allTextElements.forEach((el: Element) => {
            const htmlEl = el as HTMLElement;
            const style = window.getComputedStyle(htmlEl);
            htmlEl.style.lineHeight = style.lineHeight;
            htmlEl.style.letterSpacing = style.letterSpacing;
            htmlEl.style.fontFamily = "'Noto Sans TC', 'Microsoft JhengHei', '思源黑體', sans-serif";
            
            // 保留文字對齊屬性
            htmlEl.style.textAlign = style.textAlign;
          });
          
          // 特別處理文字對齊類別
          const alignmentElements = clonedElement.querySelectorAll('.text-center, .text-left, .text-right');
          alignmentElements.forEach((el: Element) => {
            const htmlEl = el as HTMLElement;
            if (htmlEl.classList.contains('text-center')) {
              htmlEl.style.textAlign = 'center';
            } else if (htmlEl.classList.contains('text-left')) {
              htmlEl.style.textAlign = 'left';
            } else if (htmlEl.classList.contains('text-right')) {
              htmlEl.style.textAlign = 'right';
            }
          });
          
          // 特別處理 footer 元素，確保置中
          const footerElements = clonedElement.querySelectorAll('footer');
          footerElements.forEach((footer: Element) => {
            const htmlFooter = footer as HTMLElement;
            htmlFooter.style.textAlign = 'center';
            htmlFooter.style.width = '100%';
          });
          
          // 強制設置所有有背景色的元素
          const bgElements = clonedElement.querySelectorAll('[class*="bg-"]');
          bgElements.forEach((bgEl: Element) => {
            const htmlBgEl = bgEl as HTMLElement;
            const classList = Array.from(htmlBgEl.classList);
            
            // 根據 class 名稱設置對應的背景色
            classList.forEach(className => {
              if (className.startsWith('bg-')) {
                switch(className) {
                  case 'bg-gray-50':
                    htmlBgEl.style.backgroundColor = '#f9fafb';
                    break;
                  case 'bg-blue-50':
                    htmlBgEl.style.backgroundColor = '#eff6ff';
                    break;
                  case 'bg-green-50':
                    htmlBgEl.style.backgroundColor = '#f0fdf4';
                    break;
                  case 'bg-purple-50':
                    htmlBgEl.style.backgroundColor = '#faf5ff';
                    break;
                  case 'bg-orange-50':
                    htmlBgEl.style.backgroundColor = '#fff7ed';
                    break;
                  case 'bg-indigo-50':
                    htmlBgEl.style.backgroundColor = '#eef2ff';
                    break;
                  case 'bg-teal-50':
                    htmlBgEl.style.backgroundColor = '#f0fdfa';
                    break;
                  case 'bg-blue-100':
                    htmlBgEl.style.backgroundColor = '#dbeafe';
                    break;
                  case 'bg-green-100':
                    htmlBgEl.style.backgroundColor = '#dcfce7';
                    break;
                  case 'bg-purple-100':
                    htmlBgEl.style.backgroundColor = '#f3e8ff';
                    break;
                  case 'bg-orange-100':
                    htmlBgEl.style.backgroundColor = '#fed7aa';
                    break;
                  case 'bg-yellow-100':
                    htmlBgEl.style.backgroundColor = '#fef3c7';
                    break;
                  case 'bg-white':
                    htmlBgEl.style.backgroundColor = '#ffffff';
                    break;
                }
                // 強制設置 print-color-adjust
                htmlBgEl.style.setProperty('-webkit-print-color-adjust', 'exact', 'important');
                htmlBgEl.style.setProperty('print-color-adjust', 'exact', 'important');
                htmlBgEl.style.setProperty('color-adjust', 'exact', 'important');
                
                // 額外針對紫色區塊加強設置
                if (className === 'bg-purple-50' || className === 'bg-purple-100') {
                  htmlBgEl.style.setProperty('background', htmlBgEl.style.backgroundColor, 'important');
                  htmlBgEl.style.setProperty('background-image', 'none', 'important');
                }
              }
            });
          });
          
          // 特別處理 ESG 三欄布局
          const esgGrid = clonedElement.querySelector('.esg-metrics-grid');
          if (esgGrid) {
            const htmlEsgGrid = esgGrid as HTMLElement;
            htmlEsgGrid.style.display = 'flex';
            htmlEsgGrid.style.gap = '1.5rem';
            htmlEsgGrid.style.margin = '2rem 0';
            htmlEsgGrid.style.width = '100%';
            htmlEsgGrid.style.boxSizing = 'border-box';
            
            // 為每個子元素設置樣式
            const gridChildren = htmlEsgGrid.children;
            for (let i = 0; i < gridChildren.length; i++) {
              const child = gridChildren[i] as HTMLElement;
              child.style.flex = '1';
              child.style.minWidth = '0';
              child.style.width = '33.333%';
              child.style.boxSizing = 'border-box';
            }
          }
          
          // 特別處理 flex 和 gap 佈局
          const flexElements = clonedElement.querySelectorAll('.flex, [style*="flex"]');
          flexElements.forEach((flexEl: Element) => {
            const htmlFlexEl = flexEl as HTMLElement;
            htmlFlexEl.style.display = 'flex';
            
            // 處理 gap 間距
            if (htmlFlexEl.classList.contains('gap-3')) {
              htmlFlexEl.style.gap = '0.75rem';
              // 如果瀏覽器不支援gap，使用margin替代
              if (!CSS.supports('gap', '1rem')) {
                htmlFlexEl.style.margin = '0 -0.375rem';
                Array.from(htmlFlexEl.children).forEach((child: Element) => {
                  const htmlChild = child as HTMLElement;
                  htmlChild.style.margin = '0.375rem';
                });
              }
            }
            if (htmlFlexEl.classList.contains('gap-2')) {
              htmlFlexEl.style.gap = '0.5rem';
            }
            if (htmlFlexEl.classList.contains('gap-4')) {
              htmlFlexEl.style.gap = '1rem';
            }
            if (htmlFlexEl.classList.contains('gap-6')) {
              htmlFlexEl.style.gap = '1.5rem';
            }
            
            // 處理 flex-wrap
            if (htmlFlexEl.classList.contains('flex-wrap')) {
              htmlFlexEl.style.flexWrap = 'wrap';
            }
            
            // 處理 flex-col
            if (htmlFlexEl.classList.contains('flex-col')) {
              htmlFlexEl.style.flexDirection = 'column';
            }
            
            // 處理置中對齊
            if (htmlFlexEl.classList.contains('justify-center')) {
              htmlFlexEl.style.justifyContent = 'center';
            }
            if (htmlFlexEl.classList.contains('justify-between')) {
              htmlFlexEl.style.justifyContent = 'space-between';
            }
            if (htmlFlexEl.classList.contains('items-center')) {
              htmlFlexEl.style.alignItems = 'center';
            }
          });
          
          // 處理 inline-block 元素
          const inlineBlockElements = clonedElement.querySelectorAll('.inline-block, [style*="inline-block"]');
          inlineBlockElements.forEach((inlineEl: Element) => {
            const htmlInlineEl = inlineEl as HTMLElement;
            htmlInlineEl.style.display = 'inline-block';
            htmlInlineEl.style.verticalAlign = 'top';
            
            // 處理文字不換行
            if (htmlInlineEl.classList.contains('whitespace-nowrap')) {
              htmlInlineEl.style.whiteSpace = 'nowrap';
            }
            
            // 確保margin正確設置
            if (htmlInlineEl.style.margin) {
              htmlInlineEl.style.setProperty('margin', htmlInlineEl.style.margin, 'important');
            }
          });
          
          // 處理 inline 元素和 span 標籤
          const inlineElements = clonedElement.querySelectorAll('span, [style*="inline"]');
          inlineElements.forEach((inlineEl: Element) => {
            const htmlInlineEl = inlineEl as HTMLElement;
            
            // 確保基本樣式正確設置
            if (htmlInlineEl.style.margin) {
              htmlInlineEl.style.setProperty('margin', htmlInlineEl.style.margin, 'important');
            }
            if (htmlInlineEl.style.padding) {
              htmlInlineEl.style.setProperty('padding', htmlInlineEl.style.padding, 'important');
            }
            if (htmlInlineEl.style.backgroundColor) {
              htmlInlineEl.style.setProperty('background-color', htmlInlineEl.style.backgroundColor, 'important');
              htmlInlineEl.style.setProperty('-webkit-print-color-adjust', 'exact', 'important');
              htmlInlineEl.style.setProperty('print-color-adjust', 'exact', 'important');
            }
            if (htmlInlineEl.style.color) {
              htmlInlineEl.style.setProperty('color', htmlInlineEl.style.color, 'important');
            }
            if (htmlInlineEl.style.fontSize) {
              htmlInlineEl.style.setProperty('font-size', htmlInlineEl.style.fontSize, 'important');
            }
            if (htmlInlineEl.style.whiteSpace) {
              htmlInlineEl.style.setProperty('white-space', htmlInlineEl.style.whiteSpace, 'important');
            }
          });
          
          // 特別處理text-center容器
          const textCenterElements = clonedElement.querySelectorAll('.text-center, [style*="text-align: center"]');
          textCenterElements.forEach((centerEl: Element) => {
            const htmlCenterEl = centerEl as HTMLElement;
            htmlCenterEl.style.textAlign = 'center';
            htmlCenterEl.style.width = '100%';
          });
        }
      }
    },
    jsPDF: {
      unit: 'mm',
      format: 'a4', // 使用標準 A4 格式，留出血由 CSS 控制
      orientation: mergedOptions.orientation,
      compress: true,
      language: 'zh-TW',
      precision: 16 // 增加精確度
    },
    fontFaces: mergedOptions.fontFaces,
    pagebreak: {
      mode: ['css'],
      before: '.break-before:not(.page:first-child)', // 避免第一頁前分頁
      avoid: '.no-break, footer, header, h1, h2, .chart-container, .break-inside-avoid'
    }
  };

  let styleEl = null;
  let modifiedStyles = null;

  try {
    // 在生成PDF前添加必要的CSS樣式
    styleEl = document.createElement('style');
    styleEl.id = 'pdf-font-styles';
    styleEl.textContent = `
      @font-face {
        font-family: 'Noto Sans TC';
        font-style: normal;
        font-weight: 400;
        src: url(https://fonts.gstatic.com/s/notosanstc/v26/-nF7OG829Oofr2wohFbTp9i1OCEJ.ttf) format('truetype');
      }
      .force-chinese-font {
        font-family: 'Noto Sans TC', 'Microsoft JhengHei', '思源黑體', '微軟正黑體', sans-serif !important;
      }
      .force-chinese-font * {
        font-family: 'Noto Sans TC', 'Microsoft JhengHei', '思源黑體', '微軟正黑體', sans-serif !important;
      }
      /* 強制背景色顯示 */
      * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        color-adjust: exact !important;
      }
      .bg-gray-50 { background-color: #f9fafb !important; }
      .bg-blue-50 { background-color: #eff6ff !important; }
      .bg-green-50 { background-color: #f0fdf4 !important; }
      .bg-purple-50 { background-color: #faf5ff !important; }
      .bg-orange-50 { background-color: #fff7ed !important; }
      .bg-indigo-50 { background-color: #eef2ff !important; }
      .bg-blue-100 { background-color: #dbeafe !important; }
      .bg-green-100 { background-color: #dcfce7 !important; }
      .bg-purple-100 { background-color: #f3e8ff !important; }
      .bg-orange-100 { background-color: #fed7aa !important; }
      .bg-yellow-100 { background-color: #fef3c7 !important; }
      .bg-white { background-color: #ffffff !important; }
      /* 手動分頁控制樣式 - 僅使用現代屬性 */
      .break-before {
        break-before: page !important;
      }
      .break-after {
        break-after: page !important;
      }
      .break-inside-avoid {
        break-inside: avoid !important;
      }
      .break-manual {
        break-before: page !important;
        height: 0 !important;
        min-height: 0 !important;
        max-height: 0 !important;
        margin: 0 !important;
        padding: 0 !important;
        border: none !important;
        visibility: hidden !important;
        font-size: 0 !important;
        line-height: 0 !important;
        display: block !important;
        position: absolute !important;
        top: 0 !important;
        left: 0 !important;
        width: 0 !important;
        overflow: hidden !important;
        z-index: -1 !important;
      }
      /* 紫色相關樣式 */
      .text-purple-700 { color: #7c3aed !important; }
      .text-purple-800 { color: #6b21a8 !important; }
      .text-purple-600 { color: #9333ea !important; }
      .border-purple-100 { border-color: #e9d5ff !important; }
      .border-purple-200 { border-color: #ddd6fe !important; }
      @media print {
        body, html {
          margin: 0;
          padding: 0;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        p, h1, h2, h3, h4, h5, h6, span, div {
          text-rendering: optimizeLegibility;
        }
        /* 確保所有背景色在列印時顯示 */
        .bg-gray-50, .bg-blue-50, .bg-green-50, .bg-purple-50, .bg-orange-50, .bg-indigo-50,
        .bg-blue-100, .bg-green-100, .bg-purple-100, .bg-orange-100, .bg-yellow-100, .bg-white {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          color-adjust: exact !important;
        }
      }
    `;
    document.head.appendChild(styleEl);

    // 添加強制字型類到要轉換的元素
    element.classList.add('force-chinese-font');
    
    // 替換不支持的CSS顏色函數
    modifiedStyles = replaceUnsupportedCssColors(element);

    // 生成PDF
    await html2pdf().set(pdfOptions).from(element).save();

  } catch (error) {
    console.error('生成PDF時發生錯誤:', error);
    throw error;
  } finally {
    // 清理添加的樣式和類
    if (styleEl && document.head.contains(styleEl)) {
      document.head.removeChild(styleEl);
    }
    element.classList.remove('force-chinese-font');
    
    // 還原被替換的樣式
    if (modifiedStyles) {
      restoreOriginalStyles(modifiedStyles);
    }
  }
};

/**
 * 處理圖表和複雜佈局的PDF生成
 * 適合包含Chart.js圖表的報告
 * @param elementId 要轉換為PDF的HTML元素ID
 * @param options PDF生成選項
 * @returns Promise<void>
 */
export const generateReportPDF = async (
  elementId: string,
  options: PDFGenerationOptions = {}
): Promise<void> => {
  // 先確保所有圖表都已完全渲染
  // 對於Chart.js圖表，可能需要等待一小段時間
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // 添加更精確的分頁控制
  const pagebreakOptions = {
    mode: ['avoid-all', 'css', 'legacy'], // 添加 avoid-all 模式，避免元素中間分頁
    before: '.page',   // 只在第一個之後的 .page 元素前添加分頁
    avoid: '.no-break, footer, header, h1, h2, .chart-container' // 避免在這些元素內部分頁
  };
  
  const mergedOptions = {
    ...options,
    pagebreak: pagebreakOptions
  };
  
  try {
    await generatePDFWithChineseSupport(elementId, mergedOptions);
  } catch (error) {
    console.error('生成報告PDF時發生錯誤:', error);
    throw error;
  }
}; 