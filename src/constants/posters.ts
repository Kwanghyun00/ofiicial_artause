export const posterFallbacks = [
  "/images/poster/1.png",
  "/images/poster/2025햄재포스터_고화질.jpg",
  "/images/poster/KakaoTalk_20250618_110721711.jpg",
  "/images/poster/KakaoTalk_20260128_150000261_02.jpg",
  "/images/poster/KakaoTalk_20260130_163437518.png",
]

export const getPosterFallback = (index: number) => posterFallbacks[index % posterFallbacks.length]
