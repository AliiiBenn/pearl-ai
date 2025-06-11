import React, { ReactNode } from 'react'

interface TypographyProps {
  children: ReactNode
  className?: string
  id?: string
}

export function TypographyH1({ children, className = '', id }: TypographyProps) {
  return (
    <h1
      id={id}
      className={`scroll-m-20 scroll-mt-24 text-4xl font-extrabold tracking-tight ${className}`}
    >
      {children}
    </h1>
  )
}

export function TypographyH2({ children, className = '', id }: TypographyProps) {
  return (
    <h2
      id={id}
      className={`mt-10 scroll-m-20 scroll-mt-24 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0 ${className}`}
    >
      {children}
    </h2>
  )
}

export function TypographyH3({ children, className = '', id }: TypographyProps) {
  return (
    <h3
      id={id}
      className={`mt-8 scroll-m-20 scroll-mt-24 text-2xl font-semibold tracking-tight ${className}`}
    >
      {children}
    </h3>
  )
}

export function TypographyP({ children, className = '' }: TypographyProps) {
  return <p className={`leading-7 [&:not(:first-child)]:mt-6 ${className}`}>{children}</p>
}

export function TypographyBlockquote({ children, className = '' }: TypographyProps) {
  return <blockquote className={`mt-6 border-l-2 pl-6 italic ${className}`}>{children}</blockquote>
}

export function TypographyList({ children, className = '' }: TypographyProps) {
  return (
    <ul
      className={`my-4 ml-6 list-disc marker:text-gray-500 [&>li]:mt-1.5 ${className}`}
    >
      {children}
    </ul>
  )
}

export function TypographyLink({
  children,
  href = '#',
  className = '',
}: TypographyProps & { href?: string }) {
  return (
    <a href={href} className={`font-medium text-primary underline underline-offset-4 ${className}`}>
      {children}
    </a>
  )
}

export function TypographyInlineCode({ children, className = '' }: TypographyProps) {
  return (
    <code
      className={`relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm ${className}`}
    >
      {children}
    </code>
  )
}

export function TypographyBold({ children, className = '' }: TypographyProps) {
  return <strong className={`font-semibold ${className}`}>{children}</strong>
}

export function TypographyItalic({ children, className = '' }: TypographyProps) {
  return <em className={className}>{children}</em>
}


