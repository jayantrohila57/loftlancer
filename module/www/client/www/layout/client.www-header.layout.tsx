import { ModeToggle } from "@features/patterns/core/client/patterns.mode-toggle";
import { Button } from "@loftlancer/ui/button";
import { SharedHeader } from "@modules/shared/layout/header/client.header.layout";
import { wwwPrimaryLinks } from "../../../utils/utils.www-layout.constants";
import { WwwBrand } from "../components/client.www-brand.component";

export function WwwHeader() {
  return (
    <SharedHeader
      brand={<WwwBrand />}
      brandLabel="Loftlancer home"
      links={wwwPrimaryLinks}
      actions={
        <>
          <ModeToggle />
          <Button size="sm" render={<a href="/sign-in" />}>
            Sign in
          </Button>
        </>
      }
    />
  );
}
