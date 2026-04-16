import { useSettingsStore } from '@/stores/settings.store'
import { SettingRow } from '@/components/settings/SettingRow'
import { Toggle } from '@/components/ui/Toggle'

function NotificationSettings(): JSX.Element {
  const notifications = useSettingsStore((s) => s.notifications)
  const updateNotifications = useSettingsStore((s) => s.updateNotifications)

  return (
    <div className="max-w-2xl mx-auto py-6 px-6">
      <h2 className="text-lg font-bold text-mesh-text-primary mb-6">Notifications</h2>

      <SettingRow label="Enable Notifications" description="Show desktop notifications for new messages and events">
        <Toggle
          checked={notifications.enabled}
          onChange={(v) => updateNotifications({ enabled: v })}
        />
      </SettingRow>

      <SettingRow label="Notification Sound" description="Play a sound when notifications arrive">
        <Toggle
          checked={notifications.sound}
          onChange={(v) => updateNotifications({ sound: v })}
          disabled={!notifications.enabled}
        />
      </SettingRow>

      <SettingRow label="Direct Message Notifications" description="Notify for new direct messages from friends">
        <Toggle
          checked={notifications.dmNotifications}
          onChange={(v) => updateNotifications({ dmNotifications: v })}
          disabled={!notifications.enabled}
        />
      </SettingRow>

      <SettingRow label="Server Notifications" description="Notify for new messages in community servers">
        <Toggle
          checked={notifications.serverNotifications}
          onChange={(v) => updateNotifications({ serverNotifications: v })}
          disabled={!notifications.enabled}
        />
      </SettingRow>

      <SettingRow label="Friend Requests" description="Notify when someone sends you a friend request">
        <Toggle
          checked={notifications.friendRequestNotifications}
          onChange={(v) => updateNotifications({ friendRequestNotifications: v })}
          disabled={!notifications.enabled}
        />
      </SettingRow>

      <SettingRow label="Calls" description="Notify for incoming voice and video calls">
        <Toggle
          checked={notifications.callNotifications}
          onChange={(v) => updateNotifications({ callNotifications: v })}
          disabled={!notifications.enabled}
        />
      </SettingRow>

      <SettingRow label="Server Moderation" description="Notify when you are kicked or banned from a server" separator={false}>
        <Toggle
          checked={notifications.serverKickNotifications}
          onChange={(v) => updateNotifications({ serverKickNotifications: v })}
          disabled={!notifications.enabled}
        />
      </SettingRow>
    </div>
  )
}

export { NotificationSettings }
