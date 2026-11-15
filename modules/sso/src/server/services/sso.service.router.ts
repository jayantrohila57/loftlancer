import { listSsoConnections } from "./sso.service.connections.list"

export const ssoService = {
  connections: {
    list: listSsoConnections,
  },
}
