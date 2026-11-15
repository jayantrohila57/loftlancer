import { checkDatabaseHealth } from "./health.service.db"

export const healthService = { database: checkDatabaseHealth }
