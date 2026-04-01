'use client'
import React from 'react'
import { cn } from '@/lib/utils'

// Badge
const badgeColors: Record<string, string> = {
  green:  'bg-emerald-500/10 text-emerald-400',
  yellow: 'bg-amber-500/10 text-amber-400',
  red:    'bg-red-500/10 text-red-400',
  blue:   'bg-blue-500/10 text-blue-400',
  purple: 'bg-violet-500/10 text-violet-400',
  orange: 'bg-orange-500/10 text-orange-400',
  teal:   'bg-teal-500/10 text-teal-400',
  gray:   'bg-white/5 text-gray-400',
}

export function Badge({ color = 'gray', children }: { color?: string; children: React.ReactNode }) {
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide', badgeColors[color] || badgeColors.gray)}>
      {children}
    </span>
  )
}

// Button
export function Button({
  variant = 'default', size = 'md', className, children, ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'default' | 'primary' | 'danger'; size?: 'sm' | 'md' }) {
  return (
    <button
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg border font-medium transition-all duration-150 cursor-pointer',
        size === 'sm' ? 'px-2.5 py-1 text-[11px]' : 'px-3 py-1.5 text-[12px]',
        variant === 'primary'
          ? 'bg-blue-600 border-blue-600 text-white hover:bg-blue-700'
          : variant === 'danger'
          ? 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20'
          : 'bg-[#1e2535] border-[#2a3348] text-[#e2e8f0] hover:bg-[#252d40] hover:border-blue-500/50',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

// Input
export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn('w-full px-2.5 py-2 bg-[#1e2535] border border-[#2a3348] rounded-lg text-[#e2e8f0] text-[13px] focus:border-blue-500 outline-none transition-colors', className)}
      {...props}
    />
  )
}

// Select
export function Select({ className, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn('w-full px-2.5 py-2 bg-[#1e2535] border border-[#2a3348] rounded-lg text-[#e2e8f0] text-[13px] focus:border-blue-500 outline-none', className)}
      {...props}
    >
      {children}
    </select>
  )
}

// Textarea
export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn('w-full px-2.5 py-2 bg-[#1e2535] border border-[#2a3348] rounded-lg text-[#e2e8f0] text-[13px] focus:border-blue-500 outline-none resize-y', className)}
      {...props}
    />
  )
}

// Card
export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn('bg-[#161b27] border border-[#2a3348] rounded-xl overflow-hidden', className)}>
      {children}
    </div>
  )
}

export function CardHeader({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn('px-4 py-3 border-b border-[#2a3348] flex items-center justify-between', className)}>
      {children}
    </div>
  )
}

export function CardTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-[13px] font-semibold text-[#e2e8f0]">{children}</h3>
}

export function CardBody({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('p-4', className)}>{children}</div>
}

// Stat Card
export function StatCard({
  label, value, sub, icon, color = 'blue'
}: { label: string; value: string | number; sub?: React.ReactNode; icon?: string; color?: 'blue' | 'green' | 'yellow' | 'red' }) {
  const colorMap = { blue: 'text-blue-400', green: 'text-emerald-400', yellow: 'text-amber-400', red: 'text-red-400' }
  return (
    <div className="bg-[#161b27] border border-[#2a3348] rounded-xl p-4 relative overflow-hidden">
      {icon && <div className="absolute top-3.5 right-3.5 text-lg opacity-40">{icon}</div>}
      <div className="text-[11px] text-[#8892a4] font-medium mb-1.5">{label}</div>
      <div className={cn('text-[22px] font-bold leading-none', colorMap[color])}>{value}</div>
      {sub && <div className="text-[11px] text-[#8892a4] mt-1.5">{sub}</div>}
    </div>
  )
}

// Modal
export function Modal({ open, onClose, title, children, footer }: {
  open: boolean; onClose: () => void; title: string; children: React.ReactNode; footer?: React.ReactNode
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-in" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="bg-[#161b27] border border-[#2a3348] rounded-xl w-[560px] max-h-[85vh] overflow-y-auto">
        <div className="px-5 py-4 border-b border-[#2a3348] flex items-center justify-between">
          <h3 className="font-semibold text-[14px]">{title}</h3>
          <button onClick={onClose} className="text-[#8892a4] hover:text-white text-lg leading-none cursor-pointer bg-transparent border-none">✕</button>
        </div>
        <div className="p-5">{children}</div>
        {footer && <div className="px-5 py-3.5 border-t border-[#2a3348] flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  )
}

// FormGroup
export function FormGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-3.5">
      <label className="block text-[10px] font-semibold text-[#8892a4] uppercase tracking-wider mb-1.5">{label}</label>
      {children}
    </div>
  )
}

// Loading
export function Loading() {
  return (
    <div className="flex items-center justify-center p-12">
      <div className="spinner" />
    </div>
  )
}

// Empty State
export function Empty({ message = 'No data found' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-[#8892a4]">
      <div className="text-3xl mb-2 opacity-30">📭</div>
      <div className="text-[12px]">{message}</div>
    </div>
  )
}
