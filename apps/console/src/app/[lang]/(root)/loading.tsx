import { Spinner } from "@packages/ui/components/spinner"

export default function Loading() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center">
      <Spinner />
    </div>
  )
}
