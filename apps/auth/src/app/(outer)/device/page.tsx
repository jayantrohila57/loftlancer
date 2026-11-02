import type { Metadata } from "next";
import { DeviceCodeForm } from "@/module/authorization/authorization.device.form";

export const metadata: Metadata = { title: "Connect a device" };

export default async function DevicePage({
  searchParams,
}: {
  searchParams: Promise<{ user_code?: string | string[] }>;
}) {
  const { user_code } = await searchParams;
  const initialCode = Array.isArray(user_code)
    ? (user_code[0] ?? "")
    : (user_code ?? "");
  return <DeviceCodeForm initialCode={initialCode} />;
}
