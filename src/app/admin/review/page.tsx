import { recentApprovals } from "@/lib/admin/queries";

export const metadata = { title: "Review log" };

const ENTITY_LABEL: Record<string, string> = {
  produce_item: "Produce item",
  ruling: "Position",
  authority: "Authority",
  rabbi: "Rabbi",
  alert: "Alert",
};

/**
 * The review log.
 *
 * Append-only in the database — there is no update or delete policy on
 * `approval_events`, so even an admin cannot rewrite it through the API. This
 * page is the record of who approved what and when.
 */
export default async function ReviewLogPage() {
  const events = await recentApprovals(200);

  return (
    <div>
      <h1 className="font-display text-3xl">Review log</h1>
      <p className="mt-1 max-w-2xl text-[0.9375rem] text-muted">
        Every approval and change, most recent first. This log cannot be edited or deleted from the panel.
      </p>

      {events.length === 0 ? (
        <div className="panel mt-6 px-6 py-12 text-center">
          <p className="font-display text-xl">Nothing recorded yet</p>
          <p className="mx-auto mt-2 max-w-md text-[0.9375rem] text-muted">
            Entries appear here as content is created, edited and approved.
          </p>
        </div>
      ) : (
        <div className="panel mt-6 overflow-x-auto">
          <table className="w-full min-w-[40rem] text-left text-[0.875rem]">
            <thead>
              <tr className="border-b border-edge">
                <th scope="col" className="px-4 py-2.5 font-semibold">
                  When
                </th>
                <th scope="col" className="px-4 py-2.5 font-semibold">
                  Who
                </th>
                <th scope="col" className="px-4 py-2.5 font-semibold">
                  Action
                </th>
                <th scope="col" className="px-4 py-2.5 font-semibold">
                  What
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-edge">
              {events.map((event) => (
                <tr key={event.id}>
                  <td className="whitespace-nowrap px-4 py-2.5 font-mono text-[0.75rem] text-muted">
                    {new Date(event.created_at).toLocaleString("en-GB")}
                  </td>
                  <td className="px-4 py-2.5">{event.actor_email}</td>
                  <td className="px-4 py-2.5">{event.action}</td>
                  <td className="px-4 py-2.5">
                    <span className="citation">{ENTITY_LABEL[event.entity_type] ?? event.entity_type}</span>{" "}
                    {event.entity_label}
                    {event.note && <span className="block text-muted">{event.note}</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
