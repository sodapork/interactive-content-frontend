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
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900">
          Generated Tool Preview
        </h3>
        <div className="mt-2 max-w-xl text-sm text-gray-500">
          <p>Here's your generated interactive tool. You can copy the embed code below.</p>
        </div>
        <div className="mt-5">
          <div className="bg-gray-50 p-4 rounded-md">
            <iframe
              ref={iframeRef}
              title="Tool Preview"
              style={{ width: '100%', height: 400, border: '1px solid #ccc', background: '#fff' }}
            />
          </div>
          <div className="mt-4">
            <label
              htmlFor="embed-code"
              className="block text-sm font-medium text-gray-700"
            >
              Embed Code
            </label>
            <div className="mt-1">
              <textarea
                id="embed-code"
                name="embed-code"
                rows={4}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                value={`<script>${tool}</script>`}
                readOnly
              />
            </div>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(`<script>${tool}</script>`);
              }}
              className="mt-2 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Copy to Clipboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToolPreview; 