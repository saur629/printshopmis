'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { cn } from '@/lib/utils'

const navItems = [
  { section: 'Main', items: [
    { href: '/dashboard', icon: '📊', label: 'Dashboard' },
  ]},
  { section: 'Jobs', items: [
    { href: '/job-cards', icon: '📋', label: 'Job Cards', badge: '12', badgeColor: 'blue' },
    { href: '/job-status', icon: '🔄', label: 'Job Status' },
  ]},
  { section: 'Finance', items: [
    { href: '/quotation', icon: '📝', label: 'Quotations', badge: '3', badgeColor: 'green' },
    { href: '/invoice', icon: '🧾', label: 'Invoices' },
    { href: '/payments', icon: '💳', label: 'Payments', badge: '2', badgeColor: 'red' },
    { href: '/purchase', icon: '🛒', label: 'Purchase' },
  ]},
  { section: 'HR & Reports', items: [
    { href: '/attendance', icon: '🕐', label: 'Attendance' },
    { href: '/reports', icon: '📈', label: 'Reports' },
  ]},
  { section: 'Admin', items: [
    { href: '/access-control', icon: '🔐', label: 'Access Control', roles: ['SUPER_ADMIN'] },
    { href: '/masters', icon: '⚙️', label: 'Masters', roles: ['SUPER_ADMIN', 'ADMIN'] },
    { href: '/sms', icon: '📱', label: 'SMS Alerts', roles: ['SUPER_ADMIN', 'ADMIN'] },
  ]},
]

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const role = (session?.user as any)?.role || 'USER'
  const userName = session?.user?.name || 'User'
  const initials = userName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <aside className="w-[220px] flex-shrink-0 bg-[#161b27] border-r border-[#2a3348] flex flex-col overflow-y-auto">

      {/* Brand */}
      <div className="px-4 py-4 border-b border-[#2a3348] flex items-center gap-2.5">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-base flex-shrink-0">🖨️</div>
        <div>
          <div className="text-[13px] font-semibold text-[#e2e8f0]">PrintFlow MIS</div>
          <div className="text-[10px] text-[#8892a4]">Management System</div>
        </div>
      </div>

      {/* Role Badge */}
      <div className="mx-3 my-2.5 px-2.5 py-2 bg-[#1e2535] rounded-lg border border-[#2a3348] flex items-center justify-between">
        <div>
          <div className="text-[9px] text-[#8892a4]">Logged in as</div>
          <div className="text-[10px] font-semibold text-blue-400 uppercase tracking-wide">{role.replace('_', ' ')}</div>
        </div>
        <div className="w-6 h-6 rounded-full bg-blue-900 flex items-center justify-center text-[9px] font-bold text-blue-300">{initials}</div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-1">
        {navItems.map(section => {
          const visibleItems = section.items.filter(item =>
            !(item as any).roles || (item as any).roles.includes(role)
          )
          if (!visibleItems.length) return null
          return (
            <div key={section.section}>
              <div className="px-3.5 py-2 text-[9px] font-bold text-[#8892a4] uppercase tracking-widest">{section.section}</div>
              {visibleItems.map(item => {
                const active = pathname.startsWith(item.href)
                return (
                  <Link key={item.href} href={item.href}
                    className={cn(
                      'flex items-center gap-2.5 px-3 py-2 mx-1.5 rounded-lg text-[12px] font-medium transition-all duration-150',
                      active ? 'bg-blue-500/10 text-blue-400' : 'text-[#8892a4] hover:bg-[#1e2535] hover:text-[#e2e8f0]'
                    )}>
                    <span className="text-sm w-5 text-center flex-shrink-0">{item.icon}</span>
                    <span className="flex-1">{item.label}</span>
                    {(item as any).badge && (
                      <span className={cn(
                        'text-[9px] font-bold px-1.5 py-0.5 rounded-full',
                        (item as any).badgeColor === 'red' ? 'bg-red-500 text-white' :
                        (item as any).badgeColor === 'green' ? 'bg-emerald-600 text-white' :
                        'bg-blue-600 text-white'
                      )}>{(item as any).badge}</span>
                    )}
                  </Link>
                )
              })}
            </div>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-[#2a3348]">
        <Link href="/profile" style={{ textDecoration: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 8, borderRadius: 8, background: '#1e2535', border: '1px solid #2a3348', marginBottom: 8, cursor: 'pointer' }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#8b5cf6,#3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
              {initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{userName}</div>
              <div style={{ fontSize: 10, color: '#8892a4' }}>🔐 Change Password</div>
            </div>
          </div>
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          style={{ width: '100%', padding: 7, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, color: '#ef4444', fontSize: 11, cursor: 'pointer', fontWeight: 600 }}>
          Sign Out
        </button>
      </div>

    </aside>
  )
}