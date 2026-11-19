import { getCurrentUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const auth = await getCurrentUser();
  if (auth) {
    redirect("/dashboard");
  } else {
    redirect("/login");
  }
}
