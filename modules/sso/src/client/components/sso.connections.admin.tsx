import Shell from "@packages/ui/components/shell"

import type { z } from "zod"

import type { ssoConnectionListItemSchema } from "../../utils/validation/sso.connections.list.schema"

export type SsoConnectionListItem = z.infer<typeof ssoConnectionListItemSchema>

export type SsoConnectionsAdminLabels = {
  description: string
  domain: string
  providerId: string
  issuer: string
  protocol: string
  empty: string
}

export function SsoConnectionsAdminView(props: {
  connections: SsoConnectionListItem[]
  labels: SsoConnectionsAdminLabels
}) {
  return (
    <Shell.Section variant="dashboard" className="p-2">
      <p className="mb-4 text-sm text-muted-foreground">
        {props.labels.description}
      </p>
      <div className="overflow-x-auto rounded-md border">
        <table className="w-full min-w-[36rem] text-left text-sm">
          <thead className="border-b bg-muted/40">
            <tr>
              <th className="px-3 py-2 font-medium">{props.labels.domain}</th>
              <th className="px-3 py-2 font-medium">
                {props.labels.providerId}
              </th>
              <th className="px-3 py-2 font-medium">{props.labels.issuer}</th>
              <th className="px-3 py-2 font-medium">{props.labels.protocol}</th>
            </tr>
          </thead>
          <tbody>
            {props.connections.length === 0 ? (
              <tr>
                <td className="px-3 py-4 text-muted-foreground" colSpan={4}>
                  {props.labels.empty}
                </td>
              </tr>
            ) : (
              props.connections.map((item) => (
                <tr className="border-b last:border-b-0" key={item.id}>
                  <td className="px-3 py-2">{item.domain}</td>
                  <td className="px-3 py-2 font-mono text-xs">
                    {item.providerId}
                  </td>
                  <td className="max-w-xs truncate px-3 py-2">{item.issuer}</td>
                  <td className="px-3 py-2 uppercase">{item.protocol}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Shell.Section>
  )
}

export function SsoConnectionsAdminScreen(props: {
  title: string
  connections: SsoConnectionListItem[]
  labels: SsoConnectionsAdminLabels
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 p-4">
      <h1 className="text-2xl font-semibold">{props.title}</h1>
      <SsoConnectionsAdminView
        connections={props.connections}
        labels={props.labels}
      />
    </div>
  )
}
