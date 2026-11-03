import { redirect } from "next/navigation";

/** Create-organization entry removed with organizations domain. */
export default function NewPage() {
  redirect("/overview");
}
