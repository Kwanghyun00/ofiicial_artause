import { redirect } from "next/navigation";

interface LegacyTicketDetailPageProps {
  params: { slug: string };
}

export default function LegacyTicketDetailRedirect({ params }: LegacyTicketDetailPageProps) {
  redirect(`/events/${params.slug}`);
}
