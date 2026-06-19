import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import LoginForm from "@/components/LoginForm";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const session = getSession();
  if (session) redirect("/event");

  return (
    <>
      <div className="slash-pattern fixed inset-0 z-0" />
      <div className="glow-overlay fixed inset-0 z-0" />
      <div className="fixed right-[-10%] top-[-10%] z-0 h-64 w-64 animate-pulse-soft rounded-full bg-primary-container/10 blur-[100px]" />
      <LoginForm />
    </>
  );
}
