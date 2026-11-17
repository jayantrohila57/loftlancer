"use client"

import { Button } from "@packages/ui/components/button"
import { Input } from "@packages/ui/components/input"
import { useRouter } from "@/shared/i18n/web.i18n"

export interface WebHelpSearchFormProps {
  readonly label: string
  readonly placeholder: string
}

export function WebHelpSearchForm({
  label,
  placeholder,
}: WebHelpSearchFormProps) {
  const router = useRouter()

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const query = String(formData.get("q") ?? "").trim()
  const params = new URLSearchParams()
    if (query) {
      params.set("q", query)
    }
    const suffix = params.toString()
    router.push(suffix ? `/search?${suffix}` : "/search")
  }

  return (
    <form
      className="flex flex-col gap-2 sm:flex-row sm:items-end"
      onSubmit={onSubmit}
    >
      <div className="flex flex-1 flex-col gap-1.5">
        <label className="text-sm font-medium" htmlFor="help-search">
          {label}
        </label>
        <Input
          id="help-search"
          name="q"
          placeholder={placeholder}
          type="search"
        />
      </div>
      <Button type="submit" variant="secondary">
        {label}
      </Button>
    </form>
  )
}