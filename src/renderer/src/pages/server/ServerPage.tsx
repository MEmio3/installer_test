import { useParams } from 'react-router-dom'
import { Hash } from 'lucide-react'
import { useServersStore } from '@/stores/servers.store'
import { ServerTextChannel } from './ServerTextChannel'

function ServerPage(): JSX.Element {
  const { serverId } = useParams<{ serverId: string }>()
  const servers = useServersStore((s) => s.servers)
  const server = servers.find((s) => s.id === serverId)

  if (!server) {
    return (
      <div className="flex flex-col h-full items-center justify-center">
        <div className="h-16 w-16 rounded-2xl bg-mesh-bg-tertiary flex items-center justify-center mb-4">
          <Hash className="h-8 w-8 text-mesh-text-muted" />
        </div>
        <p className="text-sm text-mesh-text-muted">Server not found</p>
      </div>
    )
  }

  // Default view is the text channel
  return <ServerTextChannel server={server} />
}

export { ServerPage }
