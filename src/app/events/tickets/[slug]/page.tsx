import { redirect } from "next/navigation";

export default async function LegacyTicketDetailRedirect({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(`/invites/${slug}`);
}
