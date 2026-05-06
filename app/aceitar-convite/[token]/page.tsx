import { AcceptInviteView } from '@/components/invite/accept-invite-view'
import { AuthProvider } from '@/contexts/auth-context'

interface PageProps {
  params: Promise<{ token: string }>
}

export default async function AceitarConvitePage({ params }: PageProps) {
  const { token } = await params
  return (
    <AuthProvider>
      <AcceptInviteView token={token} />
    </AuthProvider>
  )
}
