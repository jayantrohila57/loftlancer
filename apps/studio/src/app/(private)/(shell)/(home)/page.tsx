import { redirect } from "next/navigation";
import { routes } from "@/utils/navigation";

export default function StudioHomePage() {
  redirect(routes.overview());
}
