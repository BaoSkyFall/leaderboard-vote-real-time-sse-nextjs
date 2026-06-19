import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import EventClient from "@/components/EventClient";

export const dynamic = "force-dynamic";

export default function EventPage() {
  const session = getSession();
  if (!session) redirect("/");

  return <EventClient userId={session.userId} role={session.role} />;
}
