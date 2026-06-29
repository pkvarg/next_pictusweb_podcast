// Shared styled-email helpers used by the admin Release Notes newsletter and the
// custom Outreach email tool. Keeping a single source of truth here ensures both
// previews match what the Hono mailer renders.

export function formatContent(content: string): string {
  if (!content) return content
  if (content.includes('<')) return content
  return '<p>' + content.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>') + '</p>'
}

export function buildPreviewHtml(
  htmlContent: string,
  subject: string,
  templateType: 'newsletter' | 'outreach' = 'newsletter',
): string {
  const pictusLime = '#B6E036'
  const pictusWhite = '#F8F8F8'
  const pictusBlack = '#141511'
  const year = new Date().getFullYear()

  const optOutText =
    templateType === 'outreach'
      ? `Toto je jednorazové oslovenie. Ak nemáte záujem o ďalšiu komunikáciu, odpovedzte na tento e-mail a viac vás kontaktovať nebudeme.`
      : `Ak si neželáte dostávať tieto e-maily, <a href="#" style="color: ${pictusLime}; text-decoration: underline;">odhláste sa</a>.`

  return `<!DOCTYPE html>
<html lang="sk">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    @font-face {
      font-family: 'Brutal Milk';
      src: url('https://hono-api.pictusweb.com/fonts/brutalmilkNo2/WOFF2/BrutalMilkNo2-Light.woff2') format('woff2');
      font-weight: 300; font-style: normal; font-display: swap;
    }
    @font-face {
      font-family: 'Brutal Milk';
      src: url('https://hono-api.pictusweb.com/fonts/brutalmilkNo2/WOFF2/BrutalMilkNo2-Regular.woff2') format('woff2');
      font-weight: 400; font-style: normal; font-display: swap;
    }
    @font-face {
      font-family: 'Brutal Milk';
      src: url('https://hono-api.pictusweb.com/fonts/brutalmilkNo2/WOFF2/BrutalMilkNo2-Medium.woff2') format('woff2');
      font-weight: 500; font-style: normal; font-display: swap;
    }
    @font-face {
      font-family: 'Brutal Milk';
      src: url('https://hono-api.pictusweb.com/fonts/brutalmilkNo2/WOFF2/BrutalMilkNo2-Semibold.woff2') format('woff2');
      font-weight: 600; font-style: normal; font-display: swap;
    }
    @font-face {
      font-family: 'Brutal Milk';
      src: url('https://hono-api.pictusweb.com/fonts/brutalmilkNo2/WOFF2/BrutalMilkNo2-Bold.woff2') format('woff2');
      font-weight: 700; font-style: normal; font-display: swap;
    }

    body {
      margin: 0;
      padding: 0;
      background-color: ${pictusBlack};
      font-family: 'Brutal Milk', 'Arial', sans-serif;
      color: ${pictusWhite};
      font-weight: 300;
    }

    .release-content {
      color: ${pictusWhite};
      font-family: 'Brutal Milk', 'Arial', sans-serif;
      font-weight: 300;
      font-size: 16px;
      line-height: 1.7;
    }
    .release-content h1 {
      color: ${pictusLime};
      font-size: 26px;
      font-weight: 600;
      margin: 28px 0 12px;
      line-height: 1.3;
    }
    .release-content h2 {
      color: ${pictusLime};
      font-size: 22px;
      font-weight: 500;
      margin: 24px 0 10px;
      line-height: 1.3;
    }
    .release-content h3 {
      color: ${pictusWhite};
      font-size: 18px;
      font-weight: 500;
      margin: 20px 0 8px;
      line-height: 1.4;
    }
    .release-content p {
      color: ${pictusWhite};
      font-size: 16px;
      line-height: 1.7;
      margin: 0 0 14px;
    }
    .release-content ul,
    .release-content ol {
      color: ${pictusWhite};
      padding-left: 24px;
      margin: 0 0 14px;
    }
    .release-content li {
      color: ${pictusWhite};
      font-size: 16px;
      line-height: 1.7;
      margin-bottom: 6px;
    }
    .release-content a {
      color: ${pictusLime};
      text-decoration: underline;
    }
    .release-content strong,
    .release-content b {
      color: ${pictusWhite};
      font-weight: 600;
    }
    .release-content blockquote {
      border-left: 3px solid ${pictusLime};
      margin: 16px 0;
      padding: 8px 16px;
      color: ${pictusWhite};
      opacity: 0.85;
    }
    .release-content code {
      background-color: rgba(182, 224, 54, 0.1);
      color: ${pictusLime};
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 14px;
    }
    .release-content pre {
      background-color: rgba(182, 224, 54, 0.05);
      border: 1px solid rgba(182, 224, 54, 0.15);
      border-radius: 8px;
      padding: 16px;
      overflow-x: auto;
      margin: 16px 0;
    }
    .release-content pre code {
      background: none;
      padding: 0;
    }
    .release-content img {
      max-width: 100%;
      height: auto;
      border-radius: 8px;
      margin: 12px 0;
    }
    .release-content hr {
      border: none;
      height: 1px;
      background-color: rgba(248, 248, 248, 0.15);
      margin: 24px 0;
    }
    .release-content table {
      width: 100%;
      border-collapse: collapse;
      margin: 16px 0;
    }
    .release-content th,
    .release-content td {
      color: ${pictusWhite};
      border: 1px solid rgba(248, 248, 248, 0.15);
      padding: 8px 12px;
      text-align: left;
    }
    .release-content th {
      color: ${pictusLime};
      font-weight: 600;
    }
  </style>
</head>
<body>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: ${pictusBlack};">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; background-color: ${pictusBlack}; border-radius: 8px; box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.5); overflow: hidden;">
          <tr>
            <td style="padding: 40px 32px;">

              <!-- Header -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 32px; margin-top: 8px;">
                <tr>
                  <td align="center">
                    <p style="color: ${pictusWhite}; font-size: 32px; font-weight: 300; margin: 0 0 8px; font-family: 'Brutal Milk', 'Arial', sans-serif;">Pictusweb</p>
                    <p style="color: ${pictusLime}; font-size: 18px; font-weight: 300; margin: 0; font-family: 'Brutal Milk', 'Arial', sans-serif;">${subject}</p>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <table role="presentation" width="60%" align="center" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="height: 2px; background-color: ${pictusLime}; font-size: 0; line-height: 0;">&nbsp;</td>
                </tr>
              </table>

              <!-- Content -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
                <tr>
                  <td style="padding: 0 16px;">
                    <div class="release-content">
                      ${htmlContent}
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <table role="presentation" width="60%" align="center" cellpadding="0" cellspacing="0" style="margin-top: 8px;">
                <tr>
                  <td style="height: 2px; background-color: ${pictusLime}; font-size: 0; line-height: 0;">&nbsp;</td>
                </tr>
              </table>

              <!-- Unsubscribe -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top: 24px;">
                <tr>
                  <td style="text-align: center; padding: 0 16px;">
                    <p style="color: ${pictusWhite}; font-size: 13px; opacity: 0.6; margin: 0; font-family: 'Brutal Milk', 'Arial', sans-serif; font-weight: 300;">
                      ${optOutText}
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Contact Footer -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top: 32px; margin-bottom: 32px;">
                <tr>
                  <td align="center" style="padding: 0 16px;">
                    <p style="color: ${pictusWhite}; font-size: 14px; margin: 4px 0; font-family: 'Brutal Milk', 'Arial', sans-serif;">
                      <span style="color: ${pictusLime};">Email:</span> info@pictusweb.sk
                    </p>
                    <p style="color: ${pictusWhite}; font-size: 14px; margin: 4px 0; font-family: 'Brutal Milk', 'Arial', sans-serif;">
                      <span style="color: ${pictusLime};">Web:</span> www.pictusweb.sk
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Copyright -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <p style="font-size: 13px; color: ${pictusWhite}; opacity: 0.6; margin: 0; font-family: 'Brutal Milk', 'Arial', sans-serif;">
                      Copyright &copy; ${year} <a href="https://pictusweb.sk" style="color: ${pictusWhite}; text-decoration: none;">Pictusweb s.r.o.</a>, všetky práva vyhradené
                    </p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}
