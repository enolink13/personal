import React from 'react';

export const MarkdownRenderer: React.FC<{ content: string; className?: string }> = ({
  content,
  className = '',
}) => {
  if (!content) return null;

  // Split by double newline into block chunks
  const blocks = content.split(/\n\n+/);

  return (
    <div className={`prose prose-neutral max-w-none space-y-5 text-zinc-800 leading-relaxed ${className}`}>
      {blocks.map((block, i) => {
        const trimmed = block.trim();

        // Heading 1
        if (trimmed.startsWith('# ')) {
          return (
            <h1 key={i} className="text-3xl font-serif font-bold text-zinc-900 tracking-tight mt-8 mb-4">
              {trimmed.slice(2)}
            </h1>
          );
        }

        // Heading 2
        if (trimmed.startsWith('## ')) {
          return (
            <h2 key={i} className="text-2xl font-serif font-semibold text-zinc-900 tracking-tight mt-7 mb-3 border-b border-zinc-200 pb-2">
              {trimmed.slice(3)}
            </h2>
          );
        }

        // Heading 3
        if (trimmed.startsWith('### ')) {
          return (
            <h3 key={i} className="text-xl font-serif font-medium text-zinc-900 tracking-tight mt-6 mb-2">
              {trimmed.slice(4)}
            </h3>
          );
        }

        // Blockquote
        if (trimmed.startsWith('> ')) {
          return (
            <blockquote
              key={i}
              className="border-l-4 border-zinc-400 pl-4 py-1 italic text-zinc-700 bg-zinc-50 rounded-r my-4"
            >
              {renderInline(trimmed.slice(2))}
            </blockquote>
          );
        }

        // Unordered list
        if (trimmed.split('\n').every(line => line.trim().startsWith('- ') || line.trim().startsWith('* '))) {
          const items = trimmed.split('\n').map(line => line.trim().replace(/^[-*]\s+/, ''));
          return (
            <ul key={i} className="list-disc list-outside pl-6 space-y-1.5 my-3 text-zinc-800">
              {items.map((item, idx) => (
                <li key={idx}>{renderInline(item)}</li>
              ))}
            </ul>
          );
        }

        // Ordered list
        if (trimmed.split('\n').every(line => /^\d+\.\s+/.test(line.trim()))) {
          const items = trimmed.split('\n').map(line => line.trim().replace(/^\d+\.\s+/, ''));
          return (
            <ol key={i} className="list-decimal list-outside pl-6 space-y-1.5 my-3 text-zinc-800">
              {items.map((item, idx) => (
                <li key={idx}>{renderInline(item)}</li>
              ))}
            </ol>
          );
        }

        // Horizontal rule
        if (trimmed === '---' || trimmed === '***') {
          return <hr key={i} className="my-8 border-zinc-200" />;
        }

        // Regular paragraph with potential single line breaks
        const lines = trimmed.split('\n');
        return (
          <p key={i} className="text-base sm:text-lg leading-relaxed text-zinc-800 font-sans">
            {lines.map((line, lIdx) => (
              <React.Fragment key={lIdx}>
                {renderInline(line)}
                {lIdx < lines.length - 1 && <br />}
              </React.Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
};

function renderInline(text: string): React.ReactNode {
  // Support bold **text** and italic *text* and code `text`
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*.*?\*\*|\*.*?\*|`.*?`)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith('**') && token.endsWith('**')) {
      parts.push(<strong key={match.index} className="font-semibold text-zinc-900">{token.slice(2, -2)}</strong>);
    } else if (token.startsWith('*') && token.endsWith('*')) {
      parts.push(<em key={match.index} className="italic">{token.slice(1, -1)}</em>);
    } else if (token.startsWith('`') && token.endsWith('`')) {
      parts.push(
        <code key={match.index} className="px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-800 font-mono text-sm border border-zinc-200">
          {token.slice(1, -1)}
        </code>
      );
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}
