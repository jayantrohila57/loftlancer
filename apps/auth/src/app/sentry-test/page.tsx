import { sentryTestToken } from "@loftlancer/sentry/test";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SentryTestTrigger } from "@/components/sentry-test-trigger";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sentry test",
  robots: { index: false, follow: false },
};

/**
 * Browser-side Sentry test error (#354). A 404 unless SENTRY_TEST_TOKEN is
 * set on the server; the error is thrown only after the server accepts the
 * token typed here (sent in a header, never in the URL).
 */
export default function SentryTestPage() {
  if (!sentryTestToken()) notFound();
  return <SentryTestTrigger />;
}
