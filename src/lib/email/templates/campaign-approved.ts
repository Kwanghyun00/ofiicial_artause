import { sendEmail } from '@/lib/email/send';

interface CampaignApprovalParams {
  partnerName: string;
  campaignName: string;
  approvedAt: string;
  campaignUrl: string;
  partnerEmail: string;
  startsAt?: string | null;
}

export async function sendCampaignApprovalNotification(params: CampaignApprovalParams): Promise<void> {
  const { partnerName, campaignName, approvedAt, campaignUrl, partnerEmail, startsAt } = params;

  const startsAtLine = startsAt
    ? `<p><strong>캠페인 시작일:</strong> ${startsAt}</p>`
    : '';

  const html = `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>캠페인 승인 완료</title>
</head>
<body style="font-family: 'Noto Sans KR', sans-serif; background-color: #f9f9f9; margin: 0; padding: 0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9f9f9; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
          <tr>
            <td style="background-color: #1a1a2e; padding: 32px 40px;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Artause</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <h2 style="color: #1a1a2e; margin-top: 0;">캠페인이 승인되었습니다 🎉</h2>
              <p>안녕하세요, <strong>${partnerName}</strong>님.</p>
              <p>제출하신 캠페인이 검토 완료되어 승인되었습니다.</p>
              <table style="background-color: #f4f4f8; border-radius: 8px; padding: 20px 24px; width: 100%; margin: 24px 0;">
                <tr><td><strong>캠페인명:</strong> ${campaignName}</td></tr>
                ${startsAt ? `<tr><td style="padding-top: 8px;"><strong>캠페인 시작일:</strong> ${startsAt}</td></tr>` : ''}
                <tr><td style="padding-top: 8px;"><strong>승인 일시:</strong> ${approvedAt}</td></tr>
              </table>
              <p>파트너 대시보드에서 캠페인 상태를 확인하고 응모 현황을 관리할 수 있습니다.</p>
              <p style="text-align: center; margin: 32px 0;">
                <a href="${campaignUrl}" style="background-color: #1a1a2e; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-size: 16px; display: inline-block;">파트너 대시보드 바로가기</a>
              </p>
              <hr style="border: none; border-top: 1px solid #eeeeee; margin: 32px 0;">
              <p style="color: #888888; font-size: 12px; margin: 0;">본 메일은 발신 전용입니다. 문의사항은 artause 고객센터를 이용해 주세요.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

  const text = [
    `[Artause] 캠페인 승인 완료`,
    ``,
    `안녕하세요, ${partnerName}님.`,
    `제출하신 캠페인 "${campaignName}"이 승인되었습니다.`,
    startsAt ? `캠페인 시작일: ${startsAt}` : '',
    `승인 일시: ${approvedAt}`,
    ``,
    `파트너 대시보드: ${campaignUrl}`,
  ]
    .filter((line) => line !== null)
    .join('\n');

  await sendEmail({
    to: partnerEmail,
    subject: `[Artause] 캠페인 승인 완료: ${campaignName}`,
    html,
    text,
  });
}
