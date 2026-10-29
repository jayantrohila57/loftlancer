import { notFound } from "next/navigation";

/** Route unknown settings URLs through the settings not-found boundary. */
export default function MissingSettingsPage(): never {
  notFound();
}
