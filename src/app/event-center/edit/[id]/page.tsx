import { notFound, redirect } from "next/navigation";
import { createAdminSupabaseClient, createServerSupabaseClient } from "@/lib/supabase/server";
import { getPartnerSession } from "@/lib/auth/partner-session";
import { isSupabaseConfigured } from "@/lib/config";
import EditCampaignForm from "./EditCampaignForm";

interface Props {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: "이벤트 수정 | 알터즈",
};

export default async function EditCampaignPage({ params }: Props) {
  const { id } = await params;

  const partnerEmail = await getPartnerSession();
  if (!partnerEmail) {
    redirect("/partner/login");
  }

  // Mock mode: show form with empty defaults
  if (!isSupabaseConfigured) {
    return (
      <EditCampaignForm
        id={id}
        initialData={{
          title: "Mock 이벤트",
          description: null,
          starts_at: null,
          ends_at: null,
          ticket_purchase_url: null,
          venue_name: null,
          one_line_intro: null,
          poster_image: null,
        }}
      />
    );
  }

  const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createAdminSupabaseClient()
    : await createServerSupabaseClient();
  const { data: campaign } = await supabase
    .from("ticket_campaigns")
    .select(
      "id, title, description, starts_at, ends_at, ticket_purchase_url, venue_name, one_line_intro, poster_image, status, partner_email"
    )
    .eq("id", id)
    .single();

  if (!campaign) notFound();
  if (campaign.partner_email !== partnerEmail) notFound();
  if (campaign.status !== "pending_approval") {
    redirect("/event-center");
  }

  return (
    <EditCampaignForm
      id={id}
      initialData={{
        title: campaign.title,
        description: campaign.description,
        starts_at: campaign.starts_at,
        ends_at: campaign.ends_at,
        ticket_purchase_url: campaign.ticket_purchase_url,
        venue_name: campaign.venue_name,
        one_line_intro: campaign.one_line_intro,
        poster_image: campaign.poster_image,
      }}
    />
  );
}
