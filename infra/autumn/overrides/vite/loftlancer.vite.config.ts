import { mergeConfig } from "vite"
import upstreamConfig from "./vite.config"

export default mergeConfig(upstreamConfig, {
  server: {
    hmr: { clientPort: Number(process.env.LOFTLANCER_VITE_PUBLIC_PORT || 4001) },
  },
})
