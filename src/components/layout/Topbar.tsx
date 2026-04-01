'use client'
import { Button } from '@/components/ui'

interface TopbarProps {
  title: string
  action?: { label: string; onClick: () => void }
}

export function Topbar({ title, action }: TopbarProps) {
  return (
    <header className="h-[52px] bg-[#161b27] border-b border-[#2a3348] flex items-center px-5 gap-3 flex-shrink-0">
      <h1 className="text-[15px] font-semibold flex-1">{title}</h1>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 px-2.5 py-1.5 bg-[#1e2535] border border-[#2a3348] rounded-lg text-[12px] text-[#8892a4] cursor-text min-w-[160px]">
          🔍 Search...
        </div>
        <Button>🔔</Button>
        {action && (
          <Button variant="primary" onClick={action.onClick}>{action.label}</Button>
        )}
      </div>
    </header>
  )
}
