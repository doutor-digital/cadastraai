import { RegisterForm } from '@/components/auth/register-form'
import { AuthProvider } from '@/contexts/auth-context'

export default function CadastroPage() {
  return (
    <AuthProvider>
      <RegisterForm />
    </AuthProvider>
  )
}
