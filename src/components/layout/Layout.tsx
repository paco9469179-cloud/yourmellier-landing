import type { ReactNode } from 'react'

type LayoutProps = {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  return <div className="flex min-h-screen flex-col pb-24">{children}</div>
}
