import { studioHomeUrl } from "@features/authentication/utils/auth-links";
import type { Route } from "next";
import { redirect } from "next/navigation";

/** Auth root has no page of its own (#302): go to the studio org list. */
export default function HomePage() {
  redirect(studioHomeUrl() as Route);
}
