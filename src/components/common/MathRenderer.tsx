import { useMemo } from 'react'
import katex from 'katex'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

interface MathRendererProps {
  content: string
  className?: string
}

// Configure marked for Obsidian-like output
marked.setOptions({
  gfm: true,
  breaks: true,
})

/**
 * Renders Markdown + LaTeX content in an Obsidian-inspired style.
 * Pipeline: Markdown → HTML (via marked) → LaTeX rendering (via KaTeX)
 */
export function MathRenderer({ content, className = '' }: MathRendererProps) {
  const html = useMemo(() => DOMPurify.sanitize(renderContent(content), {
    // Allow KaTeX-generated SVG and MathML elements
    ADD_TAGS: ['math', 'mrow', 'mi', 'mo', 'mn', 'msup', 'msub', 'mfrac', 'munder', 'mover', 'munderover', 'mspace', 'semantics', 'annotation'],
    ADD_ATTR: ['xmlns', 'aria-hidden', 'focusable', 'viewBox', 'style', 'class', 'data-*'],
  }), [content])

  return (
    <div
      className={className}
      role="math"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

function renderContent(text: string): string {
  if (!text) return ''

  // 1. Protect LaTeX from markdown parser
  const latexBlocks: string[] = []
  let processed = text

  // Protect display math $$...$$
  processed = processed.replace(/\$\$([\s\S]*?)\$\$/g, (_match, tex: string) => {
    const idx = latexBlocks.length
    try {
      latexBlocks.push(katex.renderToString(tex.trim(), { displayMode: true, throwOnError: false }))
    } catch {
      latexBlocks.push(`<code>${tex}</code>`)
    }
    return `%%LATEX_BLOCK_${idx}%%`
  })

  // Protect inline math $...$
  processed = processed.replace(/\$([^\$\n]+?)\$/g, (_match, tex: string) => {
    const idx = latexBlocks.length
    try {
      latexBlocks.push(katex.renderToString(tex.trim(), { displayMode: false, throwOnError: false }))
    } catch {
      latexBlocks.push(`<code>${tex}</code>`)
    }
    return `%%LATEX_INLINE_${idx}%%`
  })

  // 2. Transform Obsidian-style callouts before markdown parsing
  // > [!note] Title  →  <div class="obsidian-callout callout-note">...
  processed = processed.replace(
    /^>\s*\[!(note|tip|warning|danger|info|example|quote|success|question|bug|abstract)\]\s*(.*?)$/gm,
    (_match, type: string, title: string) => {
      const icons: Record<string, string> = {
        note: '📝', tip: '💡', warning: '⚠️', danger: '🔥', info: 'ℹ️',
        example: '📋', quote: '💬', success: '✅', question: '❓', bug: '🐛', abstract: '📄',
      }
      return `<div class="obsidian-callout callout-${type}"><div class="callout-title">${icons[type] || '📌'} ${title || type.toUpperCase()}</div><div class="callout-content">`
    }
  )
  // Close callouts (detect end of blockquote)
  processed = processed.replace(
    /(<div class="callout-content">)([\s\S]*?)(?=\n(?!>)|$)/g,
    (_match, prefix: string, content: string) => {
      const cleanContent = content.replace(/^>\s?/gm, '')
      return `${prefix}${cleanContent}</div></div>`
    }
  )

  // 3. Parse markdown
  let html = marked.parse(processed) as string

  // 4. Add Obsidian-style classes to elements
  // Checkboxes
  html = html.replace(
    /<li><input type="checkbox" disabled(?: checked)?>/g,
    (match) => match.includes('checked')
      ? '<li class="obsidian-task task-done"><input type="checkbox" disabled checked>'
      : '<li class="obsidian-task"><input type="checkbox" disabled>'
  )

  // Horizontal rules
  html = html.replace(/<hr>/g, '<hr class="obsidian-hr">')

  // 5. Restore LaTeX
  html = html.replace(/%%LATEX_BLOCK_(\d+)%%/g, (_match, idx: string) => {
    return `<div class="obsidian-math-block">${latexBlocks[Number(idx)] || ''}</div>`
  })
  html = html.replace(/%%LATEX_INLINE_(\d+)%%/g, (_match, idx: string) => {
    return latexBlocks[Number(idx)] || ''
  })

  return html
}
