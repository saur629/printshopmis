import { clsx, type ClassValue } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}

export function generateJobNo(): string {
  const year = new Date().getFullYear()
  const seq = Math.floor(Math.random() * 9000) + 1000
  return `JC-${year}-${seq}`
}

export function generateInvNo(): string {
  const seq = Math.floor(Math.random() * 900) + 100
  return `INV-${seq}`
}

export function generateQtNo(): string {
  const year = new Date().getFullYear()
  const seq = Math.floor(Math.random() * 900) + 100
  return `QT-${year}-${seq}`
}

export function generatePoNo(): string {
  const seq = Math.floor(Math.random() * 900) + 100
  return `PO-${seq}`
}

export function generateReceiptNo(): string {
  const seq = Math.floor(Math.random() * 900) + 100
  return `REC-${seq}`
}

export const JOB_STATUS_LABELS: Record<string, string> = {
  RECEIVED: 'Received',
  PRE_PRESS: 'Pre-Press',
  IN_PRESS: 'In Press',
  CUTTING: 'Cutting',
  BINDING: 'Binding',
  QUALITY_CHECK: 'Quality Check',
  READY: 'Ready',
  DISPATCHED: 'Dispatched',
  CANCELLED: 'Cancelled',
}

export const JOB_STATUS_COLORS: Record<string, string> = {
  RECEIVED: 'gray',
  PRE_PRESS: 'yellow',
  IN_PRESS: 'blue',
  CUTTING: 'purple',
  BINDING: 'teal',
  QUALITY_CHECK: 'orange',
  READY: 'green',
  DISPATCHED: 'green',
  CANCELLED: 'red',
}
