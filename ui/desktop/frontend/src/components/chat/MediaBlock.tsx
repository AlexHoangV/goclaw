interface MediaBlockProps {
  items: { type: string; url: string }[]
}

export function MediaBlock({ items }: MediaBlockProps) {
  return (
    <div className="flex flex-wrap gap-2 my-2">
      {items.map((item, i) => {
        if (item.type.startsWith('image/')) {
          return (
            <img
              key={i}
              src={item.url}
              alt=""
              className="max-w-sm max-h-64 rounded-lg border border-border object-cover"
              loading="lazy"
            />
          )
        }
        if (item.type.startsWith('audio/')) {
          return <audio key={i} src={item.url} controls className="max-w-xs" />
        }
        if (item.type.startsWith('video/')) {
          return <video key={i} src={item.url} controls className="max-w-sm rounded-lg" />
        }
        return (
          <a
            key={i}
            href={item.url}
            className="text-xs text-accent hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {item.type} attachment
          </a>
        )
      })}
    </div>
  )
}
