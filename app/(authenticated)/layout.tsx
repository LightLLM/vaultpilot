import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getSessionUser, isAuth0Enabled } from "@/lib/auth";

/**
 * Dashboard, connect, policies, approvals, activity, security — require a real
 * Auth0 session when tenant env is configured; otherwise demo mode uses sandbox user.
 */
export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (isAuth0Enabled()) {
    const user = await getSessionUser();
    if (!user) {
      const path = (await headers()).get("x-pathname") ?? "";
      const returnTo =
        path && path !== "/auth/login" && !path.startsWith("/auth/")
          ? `?returnTo=${encodeURIComponent(path)}`
          : "";
      redirect(`/auth/login${returnTo}`);
    }
  }
  return <>{children}</>;
}
