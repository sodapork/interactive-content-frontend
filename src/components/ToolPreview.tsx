import React, { useRef, useEffect } from 'react';
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
    <div className="bg-white shadow sm:rounded-lg max-w-4xl mx-auto">
      <div className="px-6 py-8 sm:p-10">
        <h3 className="text-lg font-medium leading-6 text-gray-900">
          Generated Tool Preview
        </h3>
        <div className="mt-2 max-w-xl text-sm text-gray-500">
          <p>Here's your generated interactive tool.</p>
        </div>
        <div className="mt-5">
          <div className="bg-gray-50 p-4 rounded-md">
            <iframe
              ref={iframeRef}
              title="Tool Preview"
              style={{ width: '100%', height: 700, border: '1px solid #ccc', background: '#fff' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToolPreview; 