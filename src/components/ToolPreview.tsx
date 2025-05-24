import React, { useRef, useEffect, useState } from 'react';
import { ToolPreviewProps } from '../types';

function parseToolCode(tool: string) {
  // Remove markdown code fences and comments
  let code = tool.replace(/```[a-z]*\n?/gi, '').replace(/```/g, '');
  code = code.replace(/\\/g, ''); // Remove escape slashes if any
  code = code.replace(/\/\*[\s\S]*?\*\//g, ''); // Remove /* ... */ comments (multiline safe)
  code = code.replace(/\/\/.*$/gm, ''); // Remove // ... comments

  // Extract <style>...</style>
  const styleMatch = code.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
  const style = styleMatch ? styleMatch[0] : '';

  // Extract <script>...</script>
  const scriptMatch = code.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
  const script = scriptMatch ? scriptMatch[0] : '';

  // Remove style and script from HTML
  let html = code.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  html = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');

  return { html, style, script };
}

// ResizablePreview component for drag-to-resize functionality
const ResizablePreview: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const boxRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 1200, height: 700 });
  const [dragging, setDragging] = useState<{ startX: number; startY: number; startWidth: number; startHeight: number } | null>(null);

  const startDrag = (e: React.MouseEvent) => {
    setDragging({
      startX: e.clientX,
      startY: e.clientY,
      startWidth: dimensions.width,
      startHeight: dimensions.height,
    });
    document.addEventListener('mousemove', onDrag);
    document.addEventListener('mouseup', stopDrag);
  };

  const onDrag = (e: MouseEvent) => {
    if (!dragging) return;
    setDimensions({
      width: Math.max(600, dragging.startWidth + (e.clientX - dragging.startX)),
      height: Math.max(300, dragging.startHeight + (e.clientY - dragging.startY)),
    });
  };

  const stopDrag = () => {
    setDragging(null);
    document.removeEventListener('mousemove', onDrag);
    document.removeEventListener('mouseup', stopDrag);
  };

  return (
    <div
      ref={boxRef}
      className="relative border-2 border-accent rounded-xl overflow-hidden bg-surface shadow-[0_0_24px_2px_rgba(127,90,240,0.15)] mx-auto"
      style={{
        width: dimensions.width,
        height: dimensions.height,
        resize: 'none',
      }}
    >
      {children}
      <div
        onMouseDown={startDrag}
        className="absolute right-0 bottom-0 w-6 h-6 cursor-nwse-resize bg-accent/10 border-t-2 border-l-2 border-accent rounded-br-xl z-10 flex items-end justify-end"
        title="Drag to resize"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" className="m-1">
          <path d="M2 16L16 2" stroke="#7f5af0" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </div>
    </div>
  );
};

const ToolPreview: React.FC<ToolPreviewProps> = ({ tool }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (iframeRef.current) {
      const doc = iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document;
      if (doc) {
        const { html, style, script } = parseToolCode(tool);
        doc.open();
        doc.write(`
          <html>
            <head>
              <script src="https://cdn.jsdelivr.net/npm/d3@7"></script>
              ${style}
            </head>
            <body>
              ${html}
              ${script}
            </body>
          </html>
        `);
        doc.close();
      }
    }
  }, [tool]);

  return (
    <div className="bg-surface shadow-lg rounded-2xl max-w-7xl mx-auto border border-accent/30">
      <div className="px-4 py-6 sm:p-8">
        <h3 className="text-2xl font-bold text-text mb-2 drop-shadow">Generated Tool Preview</h3>
        <div className="mt-2 max-w-xl text-textSecondary text-base">
          <p>Here's your generated interactive tool.</p>
        </div>
        <div className="mt-7">
          <ResizablePreview>
            <iframe
              ref={iframeRef}
              title="Tool Preview"
              style={{ width: '100%', height: '100%', border: 'none', background: 'transparent' }}
            />
          </ResizablePreview>
        </div>
      </div>
    </div>
  );
};

export default ToolPreview; 