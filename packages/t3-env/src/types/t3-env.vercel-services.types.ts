import type { SERVICE_BASE_PATHS } from "../constants/t3-env.service-base-paths.constants";

export type VercelServiceName = keyof typeof SERVICE_BASE_PATHS;
