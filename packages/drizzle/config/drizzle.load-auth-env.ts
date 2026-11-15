import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { config as loadDotenv } from "dotenv"

const configDir = dirname(fileURLToPath(import.meta.url))
const authServerEnvFile = resolve(configDir, "../../../apps/auth/.env")

loadDotenv({ path: authServerEnvFile, quiet: true })
