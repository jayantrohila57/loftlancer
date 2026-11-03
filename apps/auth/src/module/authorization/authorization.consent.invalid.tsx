import { Auth5Panel } from "@features/authentication/core/client";
import { Button } from "@loftlancer/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@loftlancer/ui/card";
import Link from "next/link";

export function InvalidConsentRequest() {
  return (
    <Auth5Panel layout="centered" showTerms={false}>
      <Card className="w-full border-0 bg-transparent shadow-none before:hidden">
        <CardHeader>
          <CardTitle>Authorization request invalid</CardTitle>
          <CardDescription>
            This link is missing, expired, or was modified. Start again from the
            application that sent you here.
          </CardDescription>
        </CardHeader>
        <CardPanel>
          <Button render={<Link href="/settings" />}>Back to account</Button>
        </CardPanel>
      </Card>
    </Auth5Panel>
  );
}
