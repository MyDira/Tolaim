import Link from "next/link";
import { LoginForm } from "@/components/admin/LoginForm";
import { SectionCard } from "@/components/admin/ui";
import { getAdminSession } from "@/lib/admin/auth";
import { listAlerts, listAuthorities, listProduce, listRabbis, recentApprovals } from "@/lib/admin/queries";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default async function AdminHome() {
  if (!isSupabaseConfigured) return <NotConfigured />;

  const session = await getAdminSession();
  if (!session) return <SignIn />;

  const [produce, alerts, authorities, rabbis, history] = await Promise.all([
    listProduce(),
    listAlerts(),
    listAuthorities(),
    listRabbis(),
    recentApprovals(12),
  ]);

  const draftProduce = produce.filter((p) => p.status === "draft");
  const draftRulings = produce.flatMap((p) => p.rulings.filter((r) => r.status === "draft"));
  const draftAlerts = alerts.filter((a) => a.status === "draft");
  const now = Date.now();
  const activeAlerts = alerts.filter(
    (a) => a.status === "approved" && new Date(a.published_at).getTime() <= now && (!a.expires_at || new Date(a.expires_at).getTime() > now),
  );
  const expiringSoon = activeAlerts.filter(
    (a) => a.expires_at && new Date(a.expires_at).getTime() - now < 7 * 86_400_000,
  );

  const pending = draftProduce.length + draftRulings.length + draftAlerts.length;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">Overview</h1>
          <p className="mt-1 text-[0.9375rem] text-muted">Signed in as {session.email}.</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/alerts/new"
            className="rounded-md px-3.5 py-2 text-[0.875rem] font-semibold text-panel no-underline"
            style={{ backgroundColor: "var(--color-accent)" }}
          >
            New alert
          </Link>
          <Link
            href="/admin/produce/new"
            className="rounded-md border border-edge bg-panel px-3.5 py-2 text-[0.875rem] font-semibold no-underline transition-colors hover:border-accent hover:text-accent"
          >
            New produce item
          </Link>
        </div>
      </div>

      {/* ---- awaiting review ---- */}
      <SectionCard
        title={pending > 0 ? `${pending} awaiting review` : "Nothing awaiting review"}
        description="Draft content is invisible to the public — the database will not return it to an anonymous visitor. Approving is the rabbinic review step and is recorded."
      >
        {pending === 0 ? (
          <p className="text-[0.9375rem] text-muted">Everything on the site has been reviewed and approved.</p>
        ) : (
          <div className="space-y-5">
            {draftProduce.length > 0 && (
              <PendingGroup title="Produce items" href="/admin/produce">
                {draftProduce.slice(0, 8).map((item) => (
                  <li key={item.id}>
                    <Link href={`/admin/produce/${item.id}`} className="link">
                      {item.name}
                    </Link>
                  </li>
                ))}
              </PendingGroup>
            )}

            {draftRulings.length > 0 && (
              <PendingGroup title="Positions" href="/admin/produce">
                {draftRulings.slice(0, 8).map((ruling) => {
                  const parent = produce.find((p) => p.rulings.some((r) => r.id === ruling.id));
                  return (
                    <li key={ruling.id}>
                      <Link href={`/admin/produce/${parent?.id ?? ""}`} className="link">
                        {ruling.authority?.short_name || ruling.authority?.name} on {parent?.name}
                      </Link>
                    </li>
                  );
                })}
              </PendingGroup>
            )}

            {draftAlerts.length > 0 && (
              <PendingGroup title="Alerts" href="/admin/alerts">
                {draftAlerts.slice(0, 8).map((alert) => (
                  <li key={alert.id}>
                    <Link href={`/admin/alerts/${alert.id}`} className="link">
                      {alert.title}
                    </Link>
                  </li>
                ))}
              </PendingGroup>
            )}
          </div>
        )}
      </SectionCard>

      {/* ---- counts ---- */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Produce items" value={produce.length} sub={`${produce.length - draftProduce.length} published`} href="/admin/produce" />
        <Stat label="Active alerts" value={activeAlerts.length} sub={expiringSoon.length > 0 ? `${expiringSoon.length} expiring within a week` : "None expiring soon"} href="/admin/alerts" />
        <Stat label="Authorities" value={authorities.length} sub="cited on the site" href="/admin/authorities" />
        <Stat label="Rabbis" value={rabbis.length} sub="mapped to authorities" href="/admin/rabbis" />
      </div>

      {/* ---- recent history ---- */}
      <SectionCard
        title="Recent review activity"
        description="Who approved what, and when. This log is append-only — it cannot be edited or deleted through the panel."
        action={
          <Link href="/admin/review" className="link text-[0.875rem]">
            Full log
          </Link>
        }
      >
        {history.length === 0 ? (
          <p className="text-[0.9375rem] text-muted">Nothing recorded yet.</p>
        ) : (
          <ul className="divide-y divide-edge text-[0.875rem]">
            {history.map((event) => (
              <li key={event.id} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-2">
                <span>
                  <span className="font-medium">{event.actor_email}</span> {event.action} {event.entity_label}
                </span>
                <span className="citation">{new Date(event.created_at).toLocaleString("en-GB")}</span>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
    </div>
  );
}

function PendingGroup({ title, href, children }: { title: string; href: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="label">{title}</h3>
        <Link href={href} className="link text-[0.8125rem]">
          Manage
        </Link>
      </div>
      <ul className="mt-1.5 space-y-1 text-[0.9375rem]">{children}</ul>
    </div>
  );
}

function Stat({ label, value, sub, href }: { label: string; value: number; sub: string; href: string }) {
  return (
    <Link href={href} className="panel p-4 no-underline transition-colors hover:border-accent">
      <p className="label">{label}</p>
      <p className="mt-1 font-display text-[2rem] leading-none">{value}</p>
      <p className="citation mt-1.5">{sub}</p>
    </Link>
  );
}

function SignIn() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="font-display text-2xl">Sign in</h1>
        <p className="mt-1.5 text-[0.875rem] text-muted">
          This panel is for the people who prepare and review this site&rsquo;s content.
        </p>
        <div className="panel panel-lift mt-6 p-5">
          <LoginForm />
        </div>
        <p className="mt-4 text-[0.75rem] leading-relaxed text-muted">
          There is no signup. Accounts are created in the Supabase dashboard and added to the admin list by hand.
        </p>
      </div>
    </div>
  );
}

function NotConfigured() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="panel w-full max-w-lg p-6">
        <h1 className="font-display text-2xl">Supabase is not configured</h1>
        <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted">
          The public site is running on the bundled sample dataset. The admin panel needs a real project.
        </p>
        <ol className="rich mt-4 text-[0.9375rem]">
          <li>Copy <code className="font-mono text-[0.875rem]">.env.example</code> to <code className="font-mono text-[0.875rem]">.env.local</code>.</li>
          <li>Fill in <code className="font-mono text-[0.875rem]">NEXT_PUBLIC_SUPABASE_URL</code> and <code className="font-mono text-[0.875rem]">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>.</li>
          <li>Run the migrations in <code className="font-mono text-[0.875rem]">supabase/migrations</code>.</li>
          <li>Restart the dev server.</li>
        </ol>
        <p className="mt-4 text-[0.8125rem] text-muted">The README covers all of this in order.</p>
      </div>
    </div>
  );
}
