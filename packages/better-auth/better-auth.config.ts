import "../drizzle/config/drizzle.load-auth-env.ts"

import { getAuth } from "./src/integration/better-auth.server"

export default getAuth()
