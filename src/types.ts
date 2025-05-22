export type ContentType = 'text' | 'url';

export interface ContentInputProps {
  onSubmit: (content: string, type: ContentType) => void;
}

export interface ToolPreviewProps {
  tool: string;
} 