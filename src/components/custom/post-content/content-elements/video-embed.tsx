import { VideoEmbed } from "@/components/video-embed";

export function CustomVideoEmbed({ src }: HTMLVideoElement) {
  return src ? <VideoEmbed src={src} /> : null;
}
