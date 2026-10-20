import type { ReactNode } from "react";
import { SupportFrame } from "@/domain/support/components/support-frame";

export default function SupportLayout({ children }: { children: ReactNode }) {
  return <SupportFrame>{children}</SupportFrame>;
}
