import { CreateEmpresaForm } from '@/components/empresa/create-empresa-form'
import { AuthProvider } from '@/contexts/auth-context'

export default function CriarEmpresaPage() {
  return (
    <AuthProvider>
      <CreateEmpresaForm />
    </AuthProvider>
  )
}
