import { Suspense } from 'react'
import { DashboardContent } from '@/components/dashboard/dashboard-content'
import { AuthProvider } from '@/contexts/auth-context'

export default function DashboardPage() {
  return (
    <AuthProvider>
      <Suspense fallback={null}>
        <DashboardContent />
      </Suspense>
    </AuthProvider>
  )
}
