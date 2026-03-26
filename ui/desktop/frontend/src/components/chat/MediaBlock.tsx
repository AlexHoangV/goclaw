import { useState } from 'react'
import { ImageLightbox } from './ImageLightbox'
import type { LightboxImage } from './ImageLightbox'

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
          <a
            key={`f-${i}`}
            href={item.url}
            className="inline-flex items-center gap-1.5 text-xs text-accent hover:underline rounded-md border border-border px-2 py-1"
            target="_blank"
            rel="noopener noreferrer"
          >
            {/* File icon */}
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            {item.type}
          </a>
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
