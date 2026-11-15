import Shell from "@packages/ui/components/shell"

export type AdminUsersListItem = {
  id: string
  name: string
  email: string
  emailVerified: boolean
  role: string | null
  banned?: boolean
  createdAt: Date
}

export type AdminUsersLabels = {
  name: string
  email: string
  verified: string
  role: string
  status: string
  empty: string
  yes: string
  no: string
  active: string
  banned: string
}

export function AdminUsersView(props: {
  users: AdminUsersListItem[]
  labels: AdminUsersLabels
}) {
  return (
    <Shell.Section variant="dashboard" className="p-2">
      <div className="overflow-x-auto rounded-md border">
        <table className="w-full min-w-[32rem] text-left text-sm">
          <thead className="border-b bg-muted/40">
            <tr>
              <th className="px-3 py-2 font-medium">{props.labels.name}</th>
              <th className="px-3 py-2 font-medium">{props.labels.email}</th>
              <th className="px-3 py-2 font-medium">{props.labels.verified}</th>
              <th className="px-3 py-2 font-medium">{props.labels.role}</th>
              <th className="px-3 py-2 font-medium">{props.labels.status}</th>
            </tr>
          </thead>
          <tbody>
            {props.users.length === 0 ? (
              <tr>
                <td className="px-3 py-4 text-muted-foreground" colSpan={5}>
                  {props.labels.empty}
                </td>
              </tr>
            ) : (
              props.users.map((item) => (
                <tr className="border-b last:border-b-0" key={item.id}>
                  <td className="px-3 py-2">{item.name}</td>
                  <td className="px-3 py-2">{item.email}</td>
                  <td className="px-3 py-2">
                    {item.emailVerified ? props.labels.yes : props.labels.no}
                  </td>
                  <td className="px-3 py-2">{item.role ?? "user"}</td>
                  <td className="px-3 py-2">
                    {item.banned ? props.labels.banned : props.labels.active}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Shell.Section>
  )
}

export function AdminUsersScreen(props: {
  title: string
  users: AdminUsersListItem[]
  labels: AdminUsersLabels
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 p-4">
      <h1 className="text-2xl font-semibold">{props.title}</h1>
      <AdminUsersView labels={props.labels} users={props.users} />
    </div>
  )
}
