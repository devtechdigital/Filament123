import { AuthGuard } from "@/components/auth-guard";

export default function SetupPage() {
  return (
    <AuthGuard>
      <div className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-4 text-sm">
        <h1 className="text-xl font-bold">LAN HTTPS setup</h1>
        <p>1. Set DNS `filament.home` to your Docker host IP (example: `192.168.1.10`).</p>
        <p>2. Run this app container on port mapping `3005:3000`.</p>
        <p>3. Configure standalone Caddy:</p>
        <pre className="overflow-x-auto rounded bg-zinc-900 p-3 text-xs text-zinc-100">
{`filament.home {
  tls internal
  reverse_proxy 192.168.1.10:3005
}`}
        </pre>
        <p>4. Install Caddy local CA on Android and trust it for VPN/apps + websites.</p>
      </div>
    </AuthGuard>
  );
}
