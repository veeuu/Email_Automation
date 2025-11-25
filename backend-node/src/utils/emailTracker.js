import dotenv from 'dotenv';

dotenv.config();

/**
 * Injects tracking pixels and click tracking into email HTML
 */

export function injectTracking(html, subscriberId, campaignId, baseUrl = process.env.API_BASE_URL || 'http://localhost:8000') {
  if (!html) return html;

  // Inject tracking pixel at the end of the email
  const trackingPixel = `<img src="${baseUrl}/tracking/pixel?subscriber_id=${subscriberId}&campaign_id=${campaignId}" width="1" height="1" alt="" style="display:none;" />`;
  
  // Add pixel before closing body tag
  if (html.includes('</body>')) {
    html = html.replace('</body>', trackingPixel + '</body>');
  } else {
    html += trackingPixel;
  }

  // Replace all links with tracking links (except unsubscribe)
  html = html.replace(
    /href="((?!.*unsubscribe)(?!.*#)(?!.*mailto:)[^"]+)"/g,
    (_, url) => {
      const trackingUrl = `${baseUrl}/tracking/click?subscriber_id=${subscriberId}&campaign_id=${campaignId}&url=${encodeURIComponent(url)}`;
      return `href="${trackingUrl}"`;
    }
  );

  return html;
}

/**
 * Generates an unsubscribe link
 */
export function generateUnsubscribeLink(subscriberId, campaignId, baseUrl = process.env.API_BASE_URL || 'http://localhost:8000') {
  return `${baseUrl}/tracking/unsubscribe?subscriber_id=${subscriberId}&campaign_id=${campaignId}`;
}
