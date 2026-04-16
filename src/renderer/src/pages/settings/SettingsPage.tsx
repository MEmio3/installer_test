import { useParams } from 'react-router-dom'
import { ProfileSettings } from './ProfileSettings'
import { AppearanceSettings } from './AppearanceSettings'
import { NotificationSettings } from './NotificationSettings'
import { RelaySettings } from './RelaySettings'
import { NetworkSettings } from './NetworkSettings'
import { AboutPage } from './AboutPage'
import { PrivacySettings } from './PrivacySettings'
import { Settings } from 'lucide-react'

const pages: Record<string, () => JSX.Element> = {
  profile: ProfileSettings,
  account: AccountPlaceholder,
  privacy: PrivacySettings,
  appearance: AppearanceSettings,
  notifications: NotificationSettings,
  relay: RelaySettings,
  connection: NetworkSettings,
  about: AboutPage,
}

function AccountPlaceholder(): JSX.Element {
  return (
    <div className="max-w-2xl mx-auto py-6 px-6">
      <h2 className="text-lg font-bold text-mesh-text-primary mb-6">Account</h2>
      <div className="flex flex-col items-center py-12 text-center">
        <div className="h-14 w-14 rounded-2xl bg-mesh-bg-tertiary flex items-center justify-center mb-4">
          <Settings className="h-7 w-7 text-mesh-text-muted" />
        </div>
        <p className="text-sm text-mesh-text-muted">
          Account settings will be available once key export/import is implemented.
        </p>
      </div>
    </div>
  )
}

function SettingsPage(): JSX.Element {
  const { category } = useParams<{ category: string }>()
  const PageComponent = pages[category || 'profile'] || pages.profile

  return (
    <div className="h-full overflow-y-auto">
      <PageComponent />
    </div>
  )
}

export { SettingsPage }
