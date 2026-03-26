import { useState } from 'react'
import { ImageLightbox } from './ImageLightbox'
import type { LightboxImage } from './ImageLightbox'
import { FileButton } from './FileButton'

interface MediaBlockProps {
  items: { type: string; url: string }[]
}

export function MediaBlock({ items }: MediaBlockProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const images = items.filter((i) => i.type.startsWith('image/'))
  const others = items.filter((i) => !i.type.startsWith('image/'))

  const galleryImages: LightboxImage[] = images.map((i) => ({ src: i.url }))

  return (
    <div className="space-y-2 my-2">
      {/* Image grid */}
      {images.length > 0 && (
        <div className={`grid gap-2 ${images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {images.map((item, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setLightboxIndex(i)}
              className="group relative overflow-hidden rounded-lg border border-border cursor-pointer"
            >
              <img
                src={item.url}
                alt=""
                className="h-40 w-full object-cover"
                loading="lazy"
              />
              {/* Hover overlay */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            </button>
          ))}
        </div>
      )}

      {/* Non-image media */}
      {others.map((item, i) => {
        if (item.type.startsWith('audio/')) {
          return <audio key={`a-${i}`} src={item.url} controls className="max-w-xs" />
        }
        if (item.type.startsWith('video/')) {
          return <video key={`v-${i}`} src={item.url} controls className="max-w-sm rounded-lg" />
        }
        return (
          <FileButton
            key={`f-${i}`}
            url={item.url}
            filename={item.url.split('/').pop() ?? 'file'}
            mimeType={item.type}
          />
        )
      })}

      {/* Lightbox */}
      {lightboxIndex !== null && galleryImages[lightboxIndex] && (
        <ImageLightbox
          src={galleryImages[lightboxIndex].src}
          onClose={() => setLightboxIndex(null)}
          images={galleryImages}
          currentIndex={lightboxIndex}
          onNavigate={setLightboxIndex}
        />
      )}
    </div>
  )
}
