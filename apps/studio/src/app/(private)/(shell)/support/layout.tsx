import type { ReactNode } from "react";
import { SupportFrame } from "@/module/support/support.frame";

export default function SupportLayout({ children }: { children: ReactNode }) {
  return <SupportFrame>{children}</SupportFrame>;
}
