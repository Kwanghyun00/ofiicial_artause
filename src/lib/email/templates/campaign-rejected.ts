export interface CampaignRejectionNotificationPayload {
  partnerName: string;
  campaignName: string;
  rejectedAt: string;
  rejectionReason: string | null;
  partnerEmail: string;
}

export async function sendCampaignRejectionNotification(
  payload: CampaignRejectionNotificationPayload
): Promise<void> {
  const { partnerName, campaignName, rejectedAt, rejectionReason, partnerEmail } = payload;

  const reasonSection = rejectionReason
    ? `\n거부 사유: ${rejectionReason}`
    : '';

  // Log for now; replace with actual email sending (e.g. Resend, Nodemailer) when ready
  console.info(
    `[Email] Campaign rejection notification → ${partnerEmail}\n` +
    `파트너: ${partnerName}\n` +
    `캠페인: ${campaignName}\n` +
    `거부일시: ${rejectedAt}` +
    reasonSection
  );

  const emailApiUrl = process.env.EMAIL_API_URL;
  const emailApiKey = process.env.EMAIL_API_KEY;
  const fromAddress = process.env.EMAIL_FROM ?? 'noreply@artause.co.kr';

  if (!emailApiUrl || !emailApiKey) {
    return;
  }

  const htmlBody = [
    `<p>안녕하세요, <strong>${partnerName}</strong>님.</p>`,
    `<p>신청하신 캠페인 <strong>${campaignName}</strong>이(가) 검토 결과 거부되었습니다.</p>`,
    `<p><strong>거부일시:</strong> ${rejectedAt}</p>`,
    rejectionReason ? `<p><strong>거부 사유:</strong> ${rejectionReason}</p>` : '',
    `<p>문의 사항이 있으시면 운영팀에 연락해 주세요.</p>`,
  ].filter(Boolean).join('\n');

  await fetch(emailApiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${emailApiKey}`,
    },
    body: JSON.stringify({
      from: fromAddress,
      to: partnerEmail,
      subject: `[Artause] 캠페인 거부 안내: ${campaignName}`,
      html: htmlBody,
    }),
  });
}
