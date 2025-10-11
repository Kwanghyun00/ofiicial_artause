import { redirect } from "next/navigation";

export const metadata = {
  title: "Spotlight 리다이렉트",
  description: "Spotlight 섹션은 /shows로 통합되었습니다.",
};

export default function SpotlightRedirectPage() {
  redirect("/shows");
}
