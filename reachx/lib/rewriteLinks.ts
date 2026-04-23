/**
 * rewriteLinks — rewrites all <a href="..."> links in HTML to go through /api/track
 * for click tracking. Preserves the original URL as a query param.
 */

export function rewriteLinksForTracking(
  html: string,
  recipientId: string,
  campaignId: string,
  appUrl: string
): string {
  // Match all <a href="..."> tags
  return html.replace(
    /<a\s+([^>]*?)href=["']([^"']+)["']([^>]*?)>/gi,
    (match, before, url, after) => {
      // Skip if already a tracking link or unsubscribe link
      if (url.includes("/api/track") || url.includes("/api/unsubscribe")) {
        return match;
      }
      // Skip mailto: and tel: links
      if (url.startsWith("mailto:") || url.startsWith("tel:")) {
        return match;
      }
      // Build tracking URL
      const trackUrl = `${appUrl}/api/track?rid=${recipientId}&cid=${campaignId}&type=click&url=${encodeURIComponent(url)}`;
      return `<a ${before}href="${trackUrl}"${after}>`;
    }
  );
}
