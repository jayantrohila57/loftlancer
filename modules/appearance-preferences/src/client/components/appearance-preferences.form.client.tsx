"use client"

import { AppearanceThemedPreview, FormKit } from "@features/form"
import { useShellNavigation } from "@features/shell"
import { isThemeMode, useTheme } from "@features/theme"
import {
  applyAccountZoom,
  applyInterfaceDensity,
  applySidebarBehavior,
} from "@modules/appearance-preferences/client"
import { appearanceZoomLevels } from "@modules/appearance-preferences/utils"
import { RegionalLoadError } from "@modules/regional-preferences/client"
import { securityRpc } from "@modules/security/client"
import { authClient } from "@packages/better-auth/client"
import { createRuntimeLogger } from "@packages/logger"
import { useQuery, useQueryClient } from "@packages/react-query"
import { Button } from "@packages/ui/components/button"
import { toastManager } from "@packages/ui/components/toast"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { z } from "zod"
import { appearancePreviewAssets } from "./appearance-preferences.assets"
import { resolveAppearanceFormSectionCopy } from "./appearance-preferences.form.copy"
import { appearanceFormControlValue } from "./appearance-preferences.form.defaults"
import { persistAppearanceFormUpdate } from "./appearance-preferences.form.save"
import { AuthAccountAppearanceFormSkeleton } from "./appearance-preferences.form.skeleton"
import { AppearancePreferencesFrame } from "./appearance-preferences.frame"
import type { AppearanceFormSection } from "./appearance-preferences.layout"
import { appearanceFormBodyMinHeightClass } from "./appearance-preferences.layout"

const formSchema = z.object({
  value: z.string(),
})

type AppearanceFieldKey =
  | "theme"
  | "interfaceDensity"
  | "sidebarBehavior"
  | "zoomLevel"

export function AuthAccountAppearanceForm({
  section,
}: {
  readonly section: AppearanceFormSection
}) {
  const t = useTranslations("appearancePreferences")
  const { setTheme } = useTheme()
  const { useRouter } = useShellNavigation()
  const router = useRouter()
  const { data: session, isPending } = authClient.useSession()
  const [clearing, setClearing] = useState(false)
  const queryClient = useQueryClient()
  const userId = session?.user.id
  const queryKey = ["appearancePreferences", userId]
  const query = useQuery({
    queryKey,
    enabled: Boolean(userId),
    queryFn: async () => {
      const result = await securityRpc.security.appearancePreferences.get()
      if (result.status !== "success") throw new Error(t("loadError"))
      return result.data
    },
  })

  const fieldBySection = {
    theme: "theme",
    density: "interfaceDensity",
    sidebar: "sidebarBehavior",
    zoom: "zoomLevel",
  } as const satisfies Record<AppearanceFormSection, AppearanceFieldKey>

  const copy = resolveAppearanceFormSectionCopy(section, t)
  const field = fieldBySection[section]

  if (isPending || (userId && query.isPending && !query.data)) {
    return (
      <AuthAccountAppearanceFormSkeleton
        frameDescription={copy.frameDescription}
        section={section}
        frameTitle={copy.frameTitle}
        sectionDescription={copy.sectionDescription}
        sectionTitle={copy.sectionTitle}
      />
    )
  }
  if (!userId) {
    return (
      <AppearancePreferencesFrame
        description={copy.frameDescription}
        title={copy.frameTitle}
      >
        <div className={appearanceFormBodyMinHeightClass}>
          <p className="text-sm text-muted-foreground">{t("loadError")}</p>
        </div>
      </AppearancePreferencesFrame>
    )
  }
  if (query.isError || !query.data) {
    return (
      <AppearancePreferencesFrame
        description={copy.frameDescription}
        title={copy.frameTitle}
      >
        <RegionalLoadError
          className={`flex flex-col items-start justify-center gap-3 rounded-lg border border-border bg-muted/20 p-4 ${appearanceFormBodyMinHeightClass}`}
          message={t("loadError")}
          onRetry={() => {
            void query.refetch()
          }}
        />
      </AppearancePreferencesFrame>
    )
  }

  const prefs = query.data
  const currentValue = appearanceFormControlValue(section, prefs)

  const zoomSteps = appearanceZoomLevels.map((level) => ({
    label: `${level}%`,
    value: level,
  }))
  const zoomBuckets = [
    {
      id: "dense" as const,
      imageAlt: t("zoomDense"),
      imageSrc: appearancePreviewAssets.zoom.dense,
      label: t("zoomDense"),
      values: ["70", "80"],
    },
    {
      id: "default" as const,
      imageAlt: t("zoomDefault"),
      imageSrc: appearancePreviewAssets.zoom.default,
      label: t("zoomDefault"),
      values: ["90", "100"],
    },
    {
      id: "spacious" as const,
      imageAlt: t("zoomSpacious"),
      imageSrc: appearancePreviewAssets.zoom.spacious,
      label: t("zoomSpacious"),
      values: ["110", "120", "130"],
    },
  ]
  async function save(values: z.infer<typeof formSchema>) {
    await toastManager.promise(
      (async () => {
        const data = await persistAppearanceFormUpdate(
          section,
          values.value,
          securityRpc.security.appearancePreferences.update,
          { invalid: t("invalid"), saveError: t("saveError") }
        )
        queryClient.setQueryData(queryKey, data)
        void queryClient.invalidateQueries({
          queryKey: ["appearancePreferences"],
        })
        const nextValue = values.value ? values.value : null
        try {
          if (section === "theme" && nextValue && isThemeMode(nextValue)) {
            setTheme(nextValue)
          }
          if (section === "density") {
            applyInterfaceDensity(nextValue as "compact" | "comfortable" | null)
          }
          if (section === "sidebar") {
            applySidebarBehavior(
              nextValue as "expanded" | "collapsed" | "remember" | null
            )
          }
          if (section === "zoom") {
            applyAccountZoom(nextValue)
          }
        } catch {
          createRuntimeLogger({
            app: "auth",
            module: "appearance-preferences",
          }).error("browser.appearance_preview.failed", { outcome: "error" })
        }
        router.refresh()
      })(),
      { loading: t("saving"), success: t("saved"), error: t("saveError") }
    )
  }

  function renderField() {
    const fieldLabel = copy.sectionTitle
    const fieldDescription = copy.sectionDescription
    if (section === "theme") {
      return (
        <FormKit.Field
          type="theme"
          name="value"
          panel
          previewAssets={appearancePreviewAssets.theme}
          label={fieldLabel}
          description={fieldDescription}
        />
      )
    }
    if (section === "zoom") {
      return (
        <FormKit.Field
          type="appearance-scale"
          control="slider"
          name="value"
          previewBuckets={zoomBuckets}
          sliderMax={130}
          sliderMin={70}
          sliderStep={10}
          steps={zoomSteps}
          label={fieldLabel}
          description={fieldDescription}
        />
      )
    }
    if (section === "density") {
      return (
        <FormKit.Field
          type="visual-radio"
          name="value"
          label={fieldLabel}
          description={fieldDescription}
          options={[
            {
              label: t("densityDefault"),
              value: "",
              preview: (
                <AppearanceThemedPreview
                  alt={t("densityDefault")}
                  src={appearancePreviewAssets.density.default}
                />
              ),
            },
            {
              label: t("compact"),
              value: "compact",
              preview: (
                <AppearanceThemedPreview
                  alt={t("compact")}
                  src={appearancePreviewAssets.density.compact}
                />
              ),
            },
            {
              label: t("comfortable"),
              value: "comfortable",
              preview: (
                <AppearanceThemedPreview
                  alt={t("comfortable")}
                  src={appearancePreviewAssets.density.comfortable}
                />
              ),
            },
          ]}
        />
      )
    }
    return (
      <FormKit.Field
        type="visual-radio"
        name="value"
        label={fieldLabel}
        description={fieldDescription}
        options={[
          {
            label: t("sidebarExpanded"),
            value: "expanded",
            preview: (
              <AppearanceThemedPreview
                alt={t("sidebarExpanded")}
                src={appearancePreviewAssets.sidebar.expanded}
              />
            ),
          },
          {
            label: t("sidebarCollapsed"),
            value: "collapsed",
            preview: (
              <AppearanceThemedPreview
                alt={t("sidebarCollapsed")}
                src={appearancePreviewAssets.sidebar.collapsed}
              />
            ),
          },
          {
            label: t("sidebarRemember"),
            value: "remember",
            preview: (
              <AppearanceThemedPreview
                alt={t("sidebarRemember")}
                src={appearancePreviewAssets.sidebar.remember}
              />
            ),
          },
        ]}
      />
    )
  }

  return (
    <AppearancePreferencesFrame
      description={copy.frameDescription}
      title={copy.frameTitle}
    >
      <div className={appearanceFormBodyMinHeightClass}>
        <FormKit
          key={`${section}:${JSON.stringify(prefs)}`}
          variant="embedded"
          schema={formSchema}
          defaultValues={{ value: currentValue }}
          onSubmit={save}
        >
          <FormKit.Section
            description={copy.sectionDescription}
            title={copy.sectionTitle}
          >
            <div className="flex w-full min-w-0 flex-col items-start overflow-x-clip text-left">
              {renderField()}
            </div>
          </FormKit.Section>
          <FormKit.Actions>
            {section === "sidebar" || section === "zoom" ? (
              <Button
                type="button"
                variant="outline"
                loading={clearing}
                disabled={prefs[field] === null}
                onClick={async () => {
                  setClearing(true)
                  try {
                    await save({ value: "" })
                  } catch {
                    // The promise toast reports the error.
                  } finally {
                    setClearing(false)
                  }
                }}
              >
                {t("useDefault")}
              </Button>
            ) : null}
            <FormKit.Reset />
            <FormKit.Submit />
          </FormKit.Actions>
        </FormKit>
      </div>
    </AppearancePreferencesFrame>
  )
}
