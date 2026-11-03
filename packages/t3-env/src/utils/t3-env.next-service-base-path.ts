import {
  readServiceBasePath,
  type VercelServiceName,
} from "./t3-env.vercel-services";

type NextConfigLike = Record<string, unknown> & {
  basePath?: string;
  env?: Record<string, string | undefined>;
};

/**
 * Apply Services `basePath` when `VERCEL_SERVICES=1` or `NEXT_BASE_PATH_*` is set,
 * and expose it to app code as `NEXT_PUBLIC_BASE_PATH` (empty locally).
 */
export function withServiceBasePath<T extends NextConfigLike>(
  service: VercelServiceName,
  config: T,
): T {
  const basePath = readServiceBasePath(service);
  return {
    ...config,
    env: { ...(config.env ?? {}), NEXT_PUBLIC_BASE_PATH: basePath },
    ...(basePath ? { basePath } : {}),
  };
}
