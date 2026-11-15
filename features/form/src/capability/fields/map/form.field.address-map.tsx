"use client"

import { Field, FieldError } from "@packages/ui/components/field"
import { MapCanvas, useMap } from "@packages/ui/components/map"
import { useTranslations } from "next-intl"
import { useCallback, useEffect, useId } from "react"
import type {
  ControllerFieldState,
  ControllerRenderProps,
  FieldValues,
  Path,
} from "react-hook-form"
import { Controller, useFormContext } from "react-hook-form"
import type { AddressMapFieldProps } from "../../../types/form.field.types"
import { FieldShell } from "../../form.field-shell"

type GeoValue = { lat: number; lng: number } | null | undefined

function MapClickPin({
  onPick,
}: {
  onPick: (lat: number, lng: number) => void
}) {
  const { map, isLoaded } = useMap()
  useEffect(() => {
    if (!map || !isLoaded) return
    const handler = (event: { lngLat: { lat: number; lng: number } }) => {
      onPick(event.lngLat.lat, event.lngLat.lng)
    }
    map.on("click", handler)
    return () => {
      map.off("click", handler)
    }
  }, [map, isLoaded, onPick])
  return null
}

function MapPinLayer({ point }: { point: GeoValue }) {
  const { map, isLoaded } = useMap()
  useEffect(() => {
    if (!map || !isLoaded || !point) return
    const sourceId = "org-address-pin"
    const layerId = "org-address-pin-layer"
    const data = {
      type: "Feature" as const,
      properties: {},
      geometry: {
        type: "Point" as const,
        coordinates: [point.lng, point.lat],
      },
    }
    if (map.getSource(sourceId)) {
      const source = map.getSource(sourceId) as unknown as {
        setData: (data: unknown) => void
      }
      source.setData(data)
    } else {
      map.addSource(sourceId, { type: "geojson", data })
      map.addLayer({
        id: layerId,
        type: "circle",
        source: sourceId,
        paint: {
          "circle-radius": 8,
          "circle-color": "#2563eb",
          "circle-stroke-width": 2,
          "circle-stroke-color": "#ffffff",
        },
      })
    }
    map.easeTo({ center: [point.lng, point.lat], duration: 300 })
    return () => {
      if (map.getLayer(layerId)) map.removeLayer(layerId)
      if (map.getSource(sourceId)) map.removeSource(sourceId)
    }
  }, [map, isLoaded, point])
  return null
}

type AddressMapFieldBodyProps<TValues extends FieldValues> = {
  readonly field: ControllerRenderProps<TValues, Path<TValues>>
  readonly fieldState: ControllerFieldState
  readonly id: string
  readonly label: AddressMapFieldProps<TValues, Path<TValues>>["label"]
  readonly description: AddressMapFieldProps<
    TValues,
    Path<TValues>
  >["description"]
  readonly disabled: boolean | undefined
  readonly required: boolean | undefined
  readonly defaultCenter: [number, number]
  readonly defaultZoom: number
  readonly workerUrl: string
}

function AddressMapFieldBody<TValues extends FieldValues>({
  field,
  fieldState,
  id,
  label,
  description,
  disabled,
  required,
  defaultCenter,
  defaultZoom,
  workerUrl,
}: AddressMapFieldBodyProps<TValues>) {
  const t = useTranslations("ui")
  const value = field.value as GeoValue
  const center = value
    ? ([value.lng, value.lat] as [number, number])
    : defaultCenter

  const onPick = useCallback(
    (lat: number, lng: number) => {
      if (disabled) return
      field.onChange({ lat, lng })
    },
    [disabled, field]
  )

  return (
    <FieldShell
      id={id}
      label={label}
      description={description ?? t("organizationAddressMapFieldDescription")}
      required={required}
      error={fieldState.error?.message}
    >
      <Field invalid={Boolean(fieldState.error)} disabled={disabled}>
        <div
          className="h-56 overflow-hidden rounded-lg border"
          role="img"
          aria-label={t("organizationAddressMapAriaLabel")}
        >
          <MapCanvas
            center={center}
            zoom={value ? Math.max(defaultZoom, 12) : defaultZoom}
            workerUrl={workerUrl}
          >
            <MapClickPin onPick={onPick} />
            <MapPinLayer point={value} />
          </MapCanvas>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">{t("mapPrivacy")}</p>
        {fieldState.error?.message ? (
          <FieldError>{fieldState.error.message}</FieldError>
        ) : null}
      </Field>
    </FieldShell>
  )
}

export function FieldAddressMap<
  TValues extends FieldValues,
  TName extends Path<TValues>,
>({
  name,
  label,
  description,
  disabled,
  required,
  defaultCenter = [77.5946, 12.9716],
  defaultZoom = 10,
  workerUrl,
}: AddressMapFieldProps<TValues, TName>) {
  const id = useId()
  const { control } = useFormContext<TValues>()

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <AddressMapFieldBody
          field={field}
          fieldState={fieldState}
          id={id}
          label={label}
          description={description}
          disabled={disabled}
          required={required}
          defaultCenter={defaultCenter}
          defaultZoom={defaultZoom}
          workerUrl={workerUrl}
        />
      )}
    />
  )
}
