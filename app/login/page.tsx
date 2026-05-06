import { LoginForm } from '@/components/auth/login-form'
import { AuthProvider } from '@/contexts/auth-context'

export default function LoginPage() {
  return (
    <AuthProvider>
      <LoginForm />
    </AuthProvider>
  )
}
