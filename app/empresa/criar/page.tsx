import { CreateEmpresaForm } from '@/components/empresa/create-empresa-form'
import { AuthProvider } from '@/contexts/auth-context'
import { EmpresaProvider } from '@/contexts/empresa-context'

export default function CriarEmpresaPage() {
  return (
    <AuthProvider>
      <EmpresaProvider>
        <CreateEmpresaForm />
      </EmpresaProvider>
    </AuthProvider>
  )
}
