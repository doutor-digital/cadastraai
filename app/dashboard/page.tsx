import { Suspense } from 'react'
import { DashboardContent } from '@/components/dashboard/dashboard-content'
import { AuthProvider } from '@/contexts/auth-context'
import { EmpresaProvider } from '@/contexts/empresa-context'

export default function DashboardPage() {
  return (
    <AuthProvider>
      <EmpresaProvider>
        <Suspense fallback={null}>
          <DashboardContent />
        </Suspense>
      </EmpresaProvider>
    </AuthProvider>
  )
}
