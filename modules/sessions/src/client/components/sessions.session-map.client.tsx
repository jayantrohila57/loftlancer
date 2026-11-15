"use client"

import { clientEnv } from "@packages/t3-env/client"
import { MapCanvas, readThemeColor, useMap } from "@packages/ui/components/map"
import { useTranslations } from "next-intl"
import { useEffect } from "react"

type Location = {
  latitude: number
  longitude: number
  accuracyMeters: number
  capturedAt: string
}
const base = new URL(clientEnv.NEXT_PUBLIC_AUTH_APP_URL).pathname.replace(
  /\/$/,
  ""
)

function AccuracyArea({ location }: { location: Location }) {
  const { map, isLoaded } = useMap()
  useEffect(() => {
    if (!map || !isLoaded) return
    const fillColor = readThemeColor("info")
    const lineColor = readThemeColor("info-foreground")
    if (!fillColor || !lineColor) return
    const { latitude, longitude, accuracyMeters } = location
    const angular = Math.max(accuracyMeters, 10) / 6371000
    const lat = (latitude * Math.PI) / 180
    const lng = (longitude * Math.PI) / 180
    const points = Array.from({ length: 65 }, (_, i) => {
      const bearing = (i * 2 * Math.PI) / 64
      const lat2 = Math.asin(
        Math.sin(lat) * Math.cos(angular) +
          Math.cos(lat) * Math.sin(angular) * Math.cos(bearing)
      )
      const lng2 =
        lng +
        Math.atan2(
          Math.sin(bearing) * Math.sin(angular) * Math.cos(lat),
          Math.cos(angular) - Math.sin(lat) * Math.sin(lat2)
        )
      return [(lng2 * 180) / Math.PI, (lat2 * 180) / Math.PI]
    })
    map.addSource("accuracy-area", {
      type: "geojson",
      data: {
        type: "Feature",
        properties: {},
        geometry: { type: "Polygon", coordinates: [points] },
      },
    })
    map.addLayer({
      id: "accuracy-fill",
      type: "fill",
      source: "accuracy-area",
      paint: { "fill-color": fillColor, "fill-opacity": 0.2 },
    })
    map.addLayer({
      id: "accuracy-outline",
      type: "line",
      source: "accuracy-area",
      paint: { "line-color": lineColor, "line-width": 2 },
    })
    return () => {
      if (map.getLayer("accuracy-outline")) map.removeLayer("accuracy-outline")
      if (map.getLayer("accuracy-fill")) map.removeLayer("accuracy-fill")
      if (map.getSource("accuracy-area")) map.removeSource("accuracy-area")
    }
  }, [map, isLoaded, location])
  return null
}

export default function SecuritySessionMap({
  location,
}: {
  location: Location
}) {
  const t = useTranslations("ui")

  const zoom = Math.max(
    1,
    Math.min(
      15,
      Math.log2(40075000 / Math.max(location.accuracyMeters * 5, 500))
    )
  )
  return (
    <div
      className="h-64 overflow-hidden rounded-lg border"
      role="img"
      aria-label={t("mapShowingTheApproximateLocationAndItsAccuracyArea")}
    >
      <MapCanvas
        center={[location.longitude, location.latitude]}
        zoom={zoom}
        workerUrl={`${base}/maplibre-gl-worker.mjs`}
      >
        <AccuracyArea location={location} />
      </MapCanvas>
    </div>
  )
}
