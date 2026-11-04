import type { ReactNode } from "react";
import { WwwFooter } from "./client.www-footer.layout";
import { WwwHeader } from "./client.www-header.layout";

export default function WwwLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-background flex min-h-svh flex-col">
      <WwwHeader />
      <main className="flex-1">{children}</main>
      <WwwFooter />
    </div>
  );
}
