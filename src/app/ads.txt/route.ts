import { ADSENSE_CLIENT, ADS_ENABLED } from "@/lib/ads";

// AdSense authorises sellers via /ads.txt: "google.com, pub-XXXX, DIRECT, f08c47fec0942fa0"
export function GET() {
  const body = ADS_ENABLED
    ? `google.com, ${ADSENSE_CLIENT.replace("ca-", "")}, DIRECT, f08c47fec0942fa0\n`
    : "# No ad networks configured\n";
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
