'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export function CoachMarkdownMessage({ content }: { content: string }) {
  return (
    <div className="coach-markdown text-sm leading-7 text-inherit">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
          ul: ({ children }) => <ul className="mb-3 ml-5 list-disc space-y-1 last:mb-0">{children}</ul>,
          ol: ({ children }) => <ol className="mb-3 ml-5 list-decimal space-y-1 last:mb-0">{children}</ol>,
          li: ({ children }) => <li>{children}</li>,
          strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
          em: ({ children }) => <em className="italic">{children}</em>,
          pre: ({ children }) => (
            <pre className="mb-3 overflow-x-auto rounded-2xl bg-slate-950 px-4 py-3 text-[13px] text-white last:mb-0">
              {children}
            </pre>
          ),
          code: ({ children }) => (
            <code className="rounded bg-slate-900/8 px-1.5 py-0.5 text-[13px]">{children}</code>
          ),
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noreferrer" className="text-cyan-700 underline underline-offset-2">
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
