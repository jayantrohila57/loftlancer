import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { DeviceApprovalScreen } from "@/module/authorization/authorization.device.approval";
import { formatDeviceUserCode } from "@/module/authorization/authorization.device.utils";

export const metadata: Metadata = { title: "Approve device" };

export default async function DeviceApprovePage({
  searchParams,
}: {
  searchParams: Promise<{ user_code?: string }>;
}) {
  const { user_code } = await searchParams;
  if (!user_code?.trim()) {
    redirect("/device");
  }

  const formatted = formatDeviceUserCode(user_code);
  if (!formatted) {
    redirect("/device");
  }

  return <DeviceApprovalScreen userCode={formatted} />;
}
