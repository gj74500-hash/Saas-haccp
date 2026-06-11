import { redirect } from "next/navigation";

// The middleware already gates authentication; the root simply forwards to
// the app. A public marketing site can replace this later.
export default function RootPage() {
  redirect("/dashboard");
}
