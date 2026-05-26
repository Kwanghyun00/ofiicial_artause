import Image from "next/image"

type Props = {
  title: string
  images: string[]
}

export function DetailImageGallery({ title, images }: Props) {
  if (!images.length) return null

  return (
    <div className="flex flex-col gap-3">
      {images.map((url, index) => (
        <div
          key={`${url}-${index}`}
          className="w-full overflow-hidden rounded-2xl border border-border/60"
        >
          <Image
            src={url}
            alt={`${title} 상세 이미지 ${index + 1}`}
            width={0}
            height={0}
            sizes="(max-width: 768px) 100vw, 800px"
            style={{ width: "100%", height: "auto" }}
            unoptimized={url.startsWith("http://")}
          />
        </div>
      ))}
    </div>
  )
}
