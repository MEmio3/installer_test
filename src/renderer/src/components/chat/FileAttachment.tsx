import { useState, useEffect } from 'react'
import { FileIcon, Download, FolderOpen, Loader2 } from 'lucide-react'
import type { FileAttachment as FileAttachmentType } from '@/types/messages'
import { cn } from '@/lib/utils'

interface FileAttachmentProps {
  file: FileAttachmentType
  isOwnMessage: boolean
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function isImageType(fileType: string): boolean {
  return fileType.startsWith('image/')
}

function FileAttachmentDisplay({ file, isOwnMessage }: FileAttachmentProps): JSX.Element {
  const [imageData, setImageData] = useState<string | null>(null)
  const [imageError, setImageError] = useState(false)

  useEffect(() => {
    if (!isImageType(file.fileType)) return

    // Use inline base64 if available (just received or small file)
    if (file.base64) {
      setImageData(`data:${file.fileType};base64,${file.base64}`)
      return
    }

    // Otherwise load from disk
    if (file.filePath) {
      window.api.file.readBase64(file.filePath).then((b64) => {
        if (b64) setImageData(`data:${file.fileType};base64,${b64}`)
        else setImageError(true)
      })
    }
  }, [file.base64, file.filePath, file.fileType])

  const handleOpen = (): void => {
    if (file.filePath) window.api.file.open(file.filePath)
  }

  const handleOpenFolder = (): void => {
    if (file.filePath) window.api.file.openFolder(file.filePath)
  }

  const isTransferring = file.transferProgress !== undefined && file.transferProgress < 100

  // Image preview
  if (isImageType(file.fileType) && !imageError) {
    return (
      <div className="mt-1 max-w-sm">
        {imageData ? (
          <div className="relative group">
            <img
              src={imageData}
              alt={file.fileName}
              className="rounded-lg max-h-[300px] w-auto object-contain cursor-pointer border border-mesh-border/30"
              onClick={handleOpen}
            />
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
              {file.filePath && (
                <button
                  onClick={handleOpenFolder}
                  className="p-1.5 rounded-md bg-mesh-bg-primary/80 hover:bg-mesh-bg-primary text-mesh-text-secondary hover:text-mesh-text-primary transition-colors"
                  title="Show in folder"
                >
                  <FolderOpen className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        ) : isTransferring ? (
          <div className="rounded-lg bg-mesh-bg-tertiary border border-mesh-border/30 p-4 flex items-center gap-3">
            <Loader2 className="h-5 w-5 text-mesh-green animate-spin" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-mesh-text-primary truncate">{file.fileName}</p>
              <div className="mt-1 h-1 bg-mesh-bg-primary rounded-full overflow-hidden">
                <div
                  className="h-full bg-mesh-green rounded-full transition-all duration-300"
                  style={{ width: `${file.transferProgress}%` }}
                />
              </div>
              <p className="text-[10px] text-mesh-text-muted mt-0.5">
                {file.transferProgress}% - {formatFileSize(file.fileSize)}
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-lg bg-mesh-bg-tertiary border border-mesh-border/30 p-4 flex items-center gap-3">
            <Loader2 className="h-5 w-5 text-mesh-text-muted animate-spin" />
            <p className="text-sm text-mesh-text-muted">Loading image...</p>
          </div>
        )}
        <p className="text-[10px] text-mesh-text-muted mt-0.5">{file.fileName} - {formatFileSize(file.fileSize)}</p>
      </div>
    )
  }

  // Non-image file download card
  return (
    <div className={cn(
      'mt-1 inline-flex items-center gap-3 rounded-lg border p-3 max-w-sm',
      'bg-mesh-bg-tertiary border-mesh-border/50'
    )}>
      <div className="shrink-0 flex items-center justify-center w-10 h-10 rounded-lg bg-mesh-bg-primary">
        <FileIcon className="h-5 w-5 text-mesh-green" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm text-mesh-green font-medium truncate cursor-pointer hover:underline" onClick={handleOpen}>
          {file.fileName}
        </p>
        <p className="text-[11px] text-mesh-text-muted">
          {formatFileSize(file.fileSize)}
        </p>
        {isTransferring && (
          <div className="mt-1 h-1 bg-mesh-bg-primary rounded-full overflow-hidden">
            <div
              className="h-full bg-mesh-green rounded-full transition-all duration-300"
              style={{ width: `${file.transferProgress}%` }}
            />
          </div>
        )}
      </div>

      <div className="shrink-0 flex gap-1">
        {file.filePath && (
          <>
            <button
              onClick={handleOpen}
              className="p-1.5 rounded-md hover:bg-mesh-bg-hover text-mesh-text-secondary hover:text-mesh-text-primary transition-colors"
              title="Open file"
            >
              <Download className="h-4 w-4" />
            </button>
            <button
              onClick={handleOpenFolder}
              className="p-1.5 rounded-md hover:bg-mesh-bg-hover text-mesh-text-secondary hover:text-mesh-text-primary transition-colors"
              title="Show in folder"
            >
              <FolderOpen className="h-4 w-4" />
            </button>
          </>
        )}
        {isTransferring && (
          <Loader2 className="h-4 w-4 text-mesh-green animate-spin" />
        )}
      </div>
    </div>
  )
}

export { FileAttachmentDisplay }
