import Image from "next/image";

export function WwwBrand({ inverse = false }: { inverse?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <span
        aria-hidden
        className={`grid size-8 place-items-center rounded-md ${inverse ? "bg-neutral-50 text-neutral-950 dark:bg-neutral-100 dark:text-neutral-950" : "bg-foreground text-background"}`}
      >
        <Image
          src="/favicon/favicon-96x96.png"
          alt=""
          width={32}
          height={32}
          className="size-8 rounded-md"
        />
      </span>
      <span
        className={`truncate text-[15px] font-semibold tracking-[-0.035em] ${inverse ? "text-neutral-50 dark:text-neutral-100" : "text-foreground"}`}
      >
        Loftlancer
      </span>
    </span>
  );
}
