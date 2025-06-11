import { cn } from '@/lib/utils'
import { marked } from 'marked'
import { memo, useId, useMemo } from 'react'
import ReactMarkdown, { Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { CodeBlock, CodeBlockCode } from './code-block'
import {
  TypographyH1,
  TypographyH2,
  TypographyH3,
  TypographyP,
  TypographyBlockquote,
  TypographyList,
  TypographyLink,
  TypographyInlineCode,
  TypographyBold,
  TypographyItalic,
} from './typography'

// Add slugify function
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export type MarkdownProps = {
  children: string
  id?: string
  className?: string
  components?: Partial<Components>
}

function parseMarkdownIntoBlocks(markdown: string): string[] {
  const tokens = marked.lexer(markdown)
  return tokens.map((token) => token.raw)
}

function extractLanguage(className?: string): string {
  if (!className) return 'plaintext'
  const match = className.match(/language-(\w+)/)
  return match ? match[1] : 'plaintext'
}

const INITIAL_COMPONENTS: Partial<Components> = {
  h1: function H1Component({ children, ...props }) {
    const id = typeof children === 'string' ? slugify(children) : ''
    return (
      <TypographyH1 id={id} {...props}>
        {children}
      </TypographyH1>
    )
  },
  h2: function H2Component({ children, ...props }) {
    const id = typeof children === 'string' ? slugify(children) : ''
    return (
      <TypographyH2 id={id} {...props}>
        {children}
      </TypographyH2>
    )
  },
  h3: function H3Component({ children, ...props }) {
    const id = typeof children === 'string' ? slugify(children) : ''
    return (
      <TypographyH3 id={id} {...props}>
        {children}
      </TypographyH3>
    )
  },
  h4: function H4Component({ children, ...props }) {
    const id = typeof children === 'string' ? slugify(children) : ''
    return (
      <TypographyH3 id={id} className="text-lg" {...props}>
        {children}
      </TypographyH3>
    )
  },
  h5: function H5Component({ children, ...props }) {
    const id = typeof children === 'string' ? slugify(children) : ''
    return (
      <TypographyH3 id={id} className="text-base" {...props}>
        {children}
      </TypographyH3>
    )
  },
  h6: function H6Component({ children, ...props }) {
    const id = typeof children === 'string' ? slugify(children) : ''
    return (
      <TypographyH3 id={id} className="text-sm" {...props}>
        {children}
      </TypographyH3>
    )
  },
  p: function PComponent({ children, ...props }) {
    return <TypographyP {...props}>{children}</TypographyP>
  },
  blockquote: function BlockquoteComponent({ children, ...props }) {
    return <TypographyBlockquote {...props}>{children}</TypographyBlockquote>
  },
  ul: function UlComponent({ children, ...props }) {
    return <TypographyList {...props}>{children}</TypographyList>
  },
  ol: function OlComponent({ children, ...props }) {
    return (
      <TypographyList className="list-decimal" {...props}>
        {children}
      </TypographyList>
    )
  },
  a: function AComponent({ children, href, ...props }) {
    return (
      <TypographyLink href={href} {...props}>
        {children}
      </TypographyLink>
    )
  },
  strong: function StrongComponent({ children, ...props }) {
    return <TypographyBold {...props}>{children}</TypographyBold>
  },
  em: function EmComponent({ children, ...props }) {
    return <TypographyItalic {...props}>{children}</TypographyItalic>
  },
  code: function CodeComponent({ className, children, ...props }) {
    const isInline =
      !props.node?.position?.start.line ||
      props.node?.position?.start.line === props.node?.position?.end.line

    if (isInline) {
      return <TypographyInlineCode {...props}>{children}</TypographyInlineCode>
    }

    const language = extractLanguage(className)

    return (
      <CodeBlock className={className}>
        <CodeBlockCode code={children as string} language={language} />
      </CodeBlock>
    )
  },
  pre: function PreComponent({ children }) {
    return <>{children}</>
  },
}

const MemoizedMarkdownBlock = memo(
  function MarkdownBlock({
    content,
    components = INITIAL_COMPONENTS,
  }: {
    content: string
    components?: Partial<Components>
  }) {
    return (
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    )
  },
  function propsAreEqual(prevProps, nextProps) {
    return prevProps.content === nextProps.content
  },
)

MemoizedMarkdownBlock.displayName = 'MemoizedMarkdownBlock'

function MarkdownComponent({
  children,
  id,
  className,
  components = INITIAL_COMPONENTS,
}: MarkdownProps) {
  const generatedId = useId()
  const blockId = id ?? generatedId
  const blocks = useMemo(() => parseMarkdownIntoBlocks(children), [children])

  // Merge provided components with default components
  const mergedComponents = { ...INITIAL_COMPONENTS, ...components }

  return (
    <div className={className}>
      {blocks.map((block, index) => (
        <MemoizedMarkdownBlock
          key={`${blockId}-block-${index}`}
          content={block}
          components={mergedComponents}
        />
      ))}
    </div>
  )
}

const Markdown = memo(MarkdownComponent)
Markdown.displayName = 'Markdown'

export { Markdown }
