import { AuthGuard } from "@/components/auth-guard";

export default function SetupPage() {
  return (
    <AuthGuard>
      <div className="space-y-3 rounded-2xl border border-[var(--border)] bg-[var(--panel-elevated)] p-4 shadow-lg shadow-black/20">
        <h1 className="text-section-title text-[var(--text)]">LAN HTTPS setup</h1>
        <p className="text-body text-[var(--text-muted)]">1. Set DNS `filament.home` to your Docker host IP (example: `192.168.1.10`).</p>
        <p className="text-body text-[var(--text-muted)]">2. Run this app container on port mapping `3005:3000`.</p>
        <p className="text-body text-[var(--text-muted)]">3. Configure standalone Caddy:</p>
        <pre className="overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--bg)] p-3 text-caption text-[var(--text-muted)]">
{`filament.home {
  tls internal
  reverse_proxy 192.168.1.10:3005
}`}
        </pre>
        <p className="text-body text-[var(--text-muted)]">4. Install Caddy local CA on Android and trust it for VPN/apps + websites.</p>
      </div>
    </AuthGuard>
  );
}
