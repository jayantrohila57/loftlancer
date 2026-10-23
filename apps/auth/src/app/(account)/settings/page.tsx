import type { Route } from "next";
import { redirect } from "next/navigation";

export default function SettingsIndexPage() {
  redirect("/settings/profile" as Route);
}
