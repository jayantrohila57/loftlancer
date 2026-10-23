"use client";

import { LayersIcon } from "lucide-react";
import type React from "react";
import { createContext, type ReactNode, useContext } from "react";

import { cn } from "../lib/utils";

/**
 * Full-page layout from the shadcn registry block `@efferd/auth-5`
 * (https://efferd.com/blocks/auth#auth-5, https://efferd.com/r/auth-5.json).
 * Markup and Tailwind classes follow the block. Differences:
 * - Loftlancer wordmark + quote instead of the Efferd logo/testimonial.
 * - Only real auth actions are rendered: GitHub, Google (when configured)
 *   and an email magic link (#373). No password fields.
 * - `FloatingPaths` is not published in the registry (r/floating-paths.json
 *   404s), so a CSS-animated SVG equivalent is inlined below.
 */

export function AuthDivider({
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className="relative flex w-full items-center" {...props}>
      <div className="w-full border-border/60 border-t" />
      <div className="flex w-max justify-center text-nowrap px-2 text-muted-foreground text-xs">
        {children}
      </div>
      <div className="w-full border-border/60 border-t" />
    </div>
  );
}

/** Landing page; every app is served under the same origin. */
const LOGO_HOME_HREF = "/";

/** The Loftlancer wordmark. A real link home when `href` is set (#330). */
export function Logo({
  className,
  href,
}: {
  className?: string;
  href?: string;
}) {
  const content = (
    <>
      <LayersIcon aria-hidden className="size-4.5" />
      Loftlancer
    </>
  );
  const classes = cn(
    "inline-flex items-center gap-2 font-semibold text-base leading-none tracking-tight",
    className,
  );
  if (href) {
    return (
      <a
        href={href}
        aria-label="Loftlancer home"
        className={cn(
          classes,
          // 24px hit area (WCAG 2.5.8, #390) without moving the 18px wordmark.
          "-my-0.75 min-h-6 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        )}
      >
        {content}
      </a>
    );
  }
  return <span className={classes}>{content}</span>;
}

export function FloatingPaths({ position }: { position: number }) {
  const paths = Array.from({ length: 36 }, (_, i) => ({
    id: i,
    d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${380 - i * 5 * position} -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${152 - i * 5 * position} ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${684 - i * 5 * position} ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
    width: 0.5 + i * 0.03,
  }));
  return (
    <div className="pointer-events-none absolute inset-0">
      <svg
        className="h-full w-full text-foreground"
        fill="none"
        viewBox="0 0 696 316"
      >
        <title>Background Paths</title>
        {paths.map((path) => (
          <path
            key={path.id}
            d={path.d}
            stroke="currentColor"
            strokeOpacity={0.1 + path.id * 0.03}
            strokeWidth={path.width}
            pathLength={1}
            strokeDasharray="0.3 0.7"
            className="motion-safe:animate-[auth5-path_20s_linear_infinite]"
            style={{ animationDelay: `${-path.id * 0.6}s` }}
          />
        ))}
      </svg>
      <style>{"@keyframes auth5-path{to{stroke-dashoffset:-1}}"}</style>
    </div>
  );
}

export type Auth5PanelProps = {
  title?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  /** Rendered under the actions (e.g. AuthDivider + secondary links). */
  footer?: ReactNode;
  /** Top-left ghost button slot (the block's "Home" link). */
  topLeft?: ReactNode;
  /** Top-right slot (theme toggle). */
  topRight?: ReactNode;
  showTerms?: boolean;
  termsHref?: string;
  privacyHref?: string;
};

export function Auth5Panel({
  title,
  description,
  children,
  footer,
  topLeft,
  topRight,
  showTerms = true,
  termsHref = "https://loftlancer.com/terms",
  privacyHref = "https://loftlancer.com/privacy",
}: Auth5PanelProps) {
  const body = (
    <>
      {topLeft ? <div className="absolute top-7 left-5">{topLeft}</div> : null}
      {topRight ? (
        <div className="absolute top-7 right-5">{topRight}</div>
      ) : null}

      <div className="mx-auto space-y-4 sm:w-sm">
        <Logo href={LOGO_HOME_HREF} className="h-4.5 lg:hidden" />
        {title || description ? (
          <div className="flex flex-col space-y-1">
            {title ? (
              <h1 className="font-bold font-heading text-2xl tracking-wide">
                {title}
              </h1>
            ) : null}
            {description ? (
              <p className="text-muted-foreground text-sm">{description}</p>
            ) : null}
          </div>
        ) : null}
        <div className="space-y-2">{children}</div>
        {footer}
        {showTerms ? (
          <p className="mt-8 text-muted-foreground text-xs">
            By clicking continue, you agree to our{" "}
            <a
              className="underline underline-offset-4 hover:text-primary"
              href={termsHref}
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              className="underline underline-offset-4 hover:text-primary"
              href={privacyHref}
            >
              Privacy Policy
            </a>
            .
          </p>
        ) : null}
      </div>
    </>
  );
  if (useContext(Auth5FrameContext)) return body;
  return <Auth5Frame>{body}</Auth5Frame>;
}

const Auth5FrameContext = createContext(false);

/**
 * The auth-5 split frame (brand panel + right column) for use in a layout.
 * `Auth5Panel`s rendered inside it fill the right column only; use
 * `Auth5Content` for wider marketing/onboarding content. The right
 * column scrolls for long content.
 */
export function Auth5Frame({
  children,
  brandContent,
  brandFooter,
}: {
  children: ReactNode;
  /** Optional homepage feature content in the center of the brand panel. */
  brandContent?: ReactNode;
  /** Public navigation at the brand-panel bottom, or the page bottom on mobile. */
  brandFooter?: ReactNode;
}) {
  return (
    <main
      data-testid="auth-5"
      className={cn(
        "relative lg:grid lg:grid-cols-2",
        brandFooter
          ? "min-h-svh lg:h-svh lg:overflow-hidden"
          : "md:h-screen md:overflow-hidden",
      )}
    >
      <div className="relative hidden h-full min-h-0 flex-col overflow-y-auto border-r bg-secondary p-10 lg:flex dark:bg-secondary/20">
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-background" />
        <Logo href={LOGO_HOME_HREF} className="relative z-10 mr-auto h-4.5" />

        {brandContent ? (
          <div className="relative z-10 flex flex-1 items-center py-6">
            {brandContent}
          </div>
        ) : (
          <div className="relative z-10 mt-auto max-w-xl rounded-xl bg-background/95 p-4 shadow-lg ring-1 ring-border/60 backdrop-blur-sm">
            <blockquote className="space-y-2">
              <p className="text-xl">
                &ldquo;Loftlancer keeps our organizations, projects and
                encrypted environment variables in one place, for our team and
                our agents.&rdquo;
              </p>
              <footer className="font-mono font-semibold text-sm">
                ~ The Loftlancer team
              </footer>
            </blockquote>
          </div>
        )}
        {brandFooter ? (
          <div className="relative z-10 shrink-0">{brandFooter}</div>
        ) : null}
        {!brandContent ? (
          <div className="absolute inset-0" aria-hidden="true">
            <FloatingPaths position={1} />
            <FloatingPaths position={-1} />
          </div>
        ) : null}
      </div>
      <div
        className={cn(
          "relative flex flex-col px-8",
          brandFooter
            ? "min-h-svh lg:h-svh lg:overflow-y-auto"
            : "justify-center-safe min-h-screen md:h-screen md:overflow-y-auto",
        )}
      >
        {/* Top Shades */}
        <div
          aria-hidden
          className="absolute inset-0 isolate -z-10 opacity-60 contain-strict"
        >
          <div className="absolute top-0 right-0 h-320 w-140 -translate-y-87.5 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,--theme(--color-foreground/.06)_0,hsla(0,0%,55%,.02)_50%,--theme(--color-foreground/.01)_80%)]" />
          <div className="absolute top-0 right-0 h-320 w-60 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,--theme(--color-foreground/.04)_0,--theme(--color-foreground/.01)_80%,transparent_100%)] [translate:5%_-50%]" />
          <div className="absolute top-0 right-0 h-320 w-60 -translate-y-87.5 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,--theme(--color-foreground/.04)_0,--theme(--color-foreground/.01)_80%,transparent_100%)]" />
        </div>
        <Auth5FrameContext.Provider value={true}>
          {brandFooter ? (
            <>
              <div className="justify-center-safe flex flex-1 flex-col py-20">
                {children}
              </div>
              <div className="shrink-0 pb-8 lg:hidden">{brandFooter}</div>
            </>
          ) : (
            children
          )}
        </Auth5FrameContext.Provider>
      </div>
    </main>
  );
}

/** Wide content column inside `Auth5Frame` (marketing, onboarding, route states). */
export function Auth5Content({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-2xl space-y-4 py-12", className)}>
      <Logo href={LOGO_HOME_HREF} className="h-4.5 lg:hidden" />
      {children}
    </div>
  );
}

/** GitHub mark from the block's `@efferd/github-icon` registry item. */
export function GithubMark(props: React.ComponentProps<"svg">) {
  return (
    <svg viewBox="0 0 438.549 438.549" {...props}>
      <title>GitHub</title>
      <path
        d="M409.132 114.573c-19.608-33.596-46.205-60.194-79.798-79.8-33.598-19.607-70.277-29.408-110.063-29.408-39.781 0-76.472 9.804-110.063 29.408-33.596 19.605-60.192 46.204-79.8 79.8C9.803 148.168 0 184.854 0 224.63c0 47.78 13.94 90.745 41.827 128.906 27.884 38.164 63.906 64.572 108.063 79.227 5.14.954 8.945.283 11.419-1.996 2.475-2.282 3.711-5.14 3.711-8.562 0-.571-.049-5.708-.144-15.417a2549.81 2549.81 0 01-.144-25.406l-6.567 1.136c-4.187.767-9.469 1.092-15.846 1-6.374-.089-12.991-.757-19.842-1.999-6.854-1.231-13.229-4.086-19.13-8.559-5.898-4.473-10.085-10.328-12.56-17.556l-2.855-6.57c-1.903-4.374-4.899-9.233-8.992-14.559-4.093-5.331-8.232-8.945-12.419-10.848l-1.999-1.431c-1.332-.951-2.568-2.098-3.711-3.429-1.142-1.331-1.997-2.663-2.568-3.997-.572-1.335-.098-2.43 1.427-3.289 1.525-.859 4.281-1.276 8.28-1.276l5.708.853c3.807.763 8.516 3.042 14.133 6.851 5.614 3.806 10.229 8.754 13.846 14.842 4.38 7.806 9.657 13.754 15.846 17.847 6.184 4.093 12.419 6.136 18.699 6.136 6.28 0 11.704-.476 16.274-1.423 4.565-.952 8.848-2.383 12.847-4.285 1.713-12.758 6.377-22.559 13.988-29.41-10.848-1.14-20.601-2.857-29.264-5.14-8.658-2.286-17.605-5.996-26.835-11.14-9.235-5.137-16.896-11.516-22.985-19.126-6.09-7.614-11.088-17.61-14.987-29.979-3.901-12.374-5.852-26.648-5.852-42.826 0-23.035 7.52-42.637 22.557-58.817-7.044-17.318-6.379-36.732 1.997-58.24 5.52-1.715 13.706-.428 24.554 3.853 10.85 4.283 18.794 7.952 23.84 10.994 5.046 3.041 9.089 5.618 12.135 7.708 17.705-4.947 35.976-7.421 54.818-7.421s37.117 2.474 54.823 7.421l10.849-6.849c7.419-4.57 16.18-8.758 26.262-12.565 10.088-3.805 17.802-4.853 23.134-3.138 8.562 21.509 9.325 40.922 2.279 58.24 15.036 16.18 22.559 35.787 22.559 58.817 0 16.178-1.958 30.497-5.853 42.966-3.9 12.471-8.941 22.457-15.125 29.979-6.191 7.521-13.901 13.85-23.131 18.986-9.232 5.14-18.182 8.85-26.84 11.136-8.662 2.286-18.415 4.004-29.263 5.146 9.894 8.562 14.842 22.077 14.842 40.539v60.237c0 3.422 1.19 6.279 3.572 8.562 2.379 2.279 6.136 2.95 11.276 1.995 44.163-14.653 80.185-41.062 108.068-79.226 27.88-38.161 41.825-81.126 41.825-128.906-.01-39.771-9.818-76.454-29.414-110.049z"
        fill="currentColor"
      />
    </svg>
  );
}

/** Google "G" mark (brand colors are part of the logo). */
export function GoogleMark(props: React.ComponentProps<"svg">) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <title>Google</title>
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.1A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.1V7.06H2.18A11 11 0 0 0 1 12c0 1.78.43 3.45 1.18 4.94l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
        fill="#EA4335"
      />
    </svg>
  );
}
