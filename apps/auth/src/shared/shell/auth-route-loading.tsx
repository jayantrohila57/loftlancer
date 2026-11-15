import { Spinner } from "@packages/ui/components/spinner"

type AuthRouteLoadingProps = {
  fullScreen?: boolean
}

/** Centers the route loading indicator in the viewport or the current shell. */
export function AuthRouteLoading({
  fullScreen = false,
}: AuthRouteLoadingProps) {
  return (
    <div
      className={
        fullScreen
          ? "flex min-h-svh w-full items-center justify-center"
          : "flex min-h-0 w-full flex-1 items-center justify-center"
      }
    >
      <Spinner />
    </div>
  )
}
