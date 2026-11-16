"use client"

import { Button } from "@packages/ui/components/button"
import { Group, GroupSeparator } from "@packages/ui/components/group"
import { Input } from "@packages/ui/components/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@packages/ui/components/input-group"
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@packages/ui/components/select"
import {
  Tooltip,
  TooltipPopup,
  TooltipProvider,
  TooltipTrigger,
} from "@packages/ui/components/tooltip"
import {
  CheckCircle2Icon,
  EyeIcon,
  EyeOffIcon,
  LoaderCircleIcon,
  SearchIcon,
  XCircleIcon,
  XIcon,
} from "lucide-react"
import { useTranslations } from "next-intl"
import { useEffect, useId, useState } from "react"
import type { FieldValues, Path } from "react-hook-form"
import { Controller, useFormContext, useWatch } from "react-hook-form"
import { PHONE_CALLING_CODES } from "../../../constants/form.constants"
import type {
  FieldAsyncStatus,
  TextFieldProps,
} from "../../../types/form.field.types"
import {
  getFieldDescribedBy,
  getPasswordStrength,
} from "../../../utils/form.field"
import { FieldShell } from "../../form.field-shell"

/** Shared text control for the supported native input variants. */
export function FieldText<
  TValues extends FieldValues,
  TName extends Path<TValues>,
>({
  type,
  name,
  label,
  description,
  placeholder,
  required = false,
  disabled = false,
  hidden = false,
  readOnly = false,
  loading = false,
  inputType = "text",
  showStrength = false,
  defaultCallingCode,
  asyncStatus = "idle",
  asyncStatusLabels,
}: TextFieldProps<TValues, TName>) {
  const t = useTranslations("ui")

  const {
    control,
    setFocus,
    formState: { isSubmitting },
  } = useFormContext<TValues>()
  const id = useId()
  const [visible, setVisible] = useState(false)
  const [emptyCallingCode, setEmptyCallingCode] = useState(
    defaultCallingCode ?? "+1"
  )
  useEffect(() => {
    if (defaultCallingCode !== undefined) {
      setEmptyCallingCode(defaultCallingCode)
    }
  }, [defaultCallingCode])
  const nativeType =
    type === "text" ? inputType : type === "avatar-url" ? "url" : type
  const isPassword = nativeType === "password"
  const isSearch = nativeType === "search"
  const isTel = nativeType === "tel"
  const isUrl = nativeType === "url"
  const isAvatarUrl = type === "avatar-url"
  const showAsyncStatus = asyncStatus !== "idle"
  const watchedValue = useWatch({
    control,
    name,
    disabled: !isPassword && !isAvatarUrl,
  })
  const [imageStatus, setImageStatus] = useState<
    "idle" | "checking" | "valid" | "invalid"
  >("idle")
  useEffect(() => {
    if (!isAvatarUrl || typeof watchedValue !== "string" || !watchedValue) {
      setImageStatus("idle")
      return
    }
    let active = true
    let image: HTMLImageElement | undefined
    setImageStatus("checking")
    const timer = window.setTimeout(() => {
      try {
        if (new URL(watchedValue).protocol !== "https:") throw new Error()
      } catch {
        if (active) setImageStatus("invalid")
        return
      }
      image = new Image()
      image.onload = () => {
        if (active) setImageStatus("valid")
      }
      image.onerror = () => {
        if (active) setImageStatus("invalid")
      }
      image.src = watchedValue
    }, 500)
    return () => {
      active = false
      window.clearTimeout(timer)
      if (image) {
        image.onload = null
        image.onerror = null
        image.src = ""
      }
    }
  }, [isAvatarUrl, watchedValue])
  useEffect(() => {
    if (isPassword && !watchedValue) setVisible(false)
  }, [isPassword, watchedValue])
  if (hidden) return null
  const inactive = disabled || isSubmitting

  function renderAsyncStatusIcon(status: FieldAsyncStatus) {
    const statusLabel =
      status === "checking"
        ? asyncStatusLabels?.checking
        : status === "valid"
          ? asyncStatusLabels?.valid
          : asyncStatusLabels?.invalid
    return (
      <span
        role="status"
        aria-label={statusLabel}
        aria-hidden={statusLabel ? undefined : true}
      >
      {status === "checking" ? (
        <LoaderCircleIcon className="size-4 animate-spin" />
      ) : status === "valid" ? (
        <CheckCircle2Icon className="size-4 text-success" />
      ) : (
        <XCircleIcon className="size-4 text-destructive" />
      )}
    </span>
  )
  }

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const value: string = typeof field.value === "string" ? field.value : ""
        const callingCodes = PHONE_CALLING_CODES
        const matchedCode = [...callingCodes]
          .sort((a, b) => b.length - a.length)
          .find((code) => value.startsWith(code))
        const callingCode = value ? (matchedCode ?? "") : emptyCallingCode
        const phoneValue = matchedCode
          ? value.slice(matchedCode.length).trimStart()
          : value
        const hasHttpsPrefix =
          !value ||
          value.startsWith("https://") ||
          !/^[a-z][a-z0-9+.-]*:\/\//i.test(value)
        const urlValue = value.startsWith("https://") ? value.slice(8) : value
        const describedBy = getFieldDescribedBy(
          id,
          description,
          fieldState.error?.message,
          isPassword && showStrength ? `${id}-strength` : undefined
        )
        const controlProps = {
          ...field,
          id,
          value,
          type: isPassword && visible ? "text" : nativeType,
          placeholder,
          disabled: inactive,
          readOnly,
          "aria-required": required,
          "aria-invalid": fieldState.invalid,
          "aria-describedby": describedBy,
        }
        const strength = getPasswordStrength(value)
        return (
          <FieldShell
            id={id}
            label={label}
            description={description}
            required={required}
            disabled={inactive}
            loading={loading}
            error={fieldState.error?.message}
          >
            {isTel ? (
              <Group aria-label={t("telephoneNumber")} className="w-full">
                <span id={`${id}-calling-code`} className="sr-only">
                  {t("countryCallingCode")}
                </span>
                <Select
                  value={callingCode}
                  items={[
                    { value: "", label: t("other") },
                    ...callingCodes.map((code) => ({
                      value: code,
                      label: code,
                    })),
                  ]}
                  disabled={inactive || readOnly}
                  onValueChange={(code) => {
                    if (code === null) return
                    setEmptyCallingCode(code)
                    if (phoneValue)
                      field.onChange(`${code}${code ? " " : ""}${phoneValue}`)
                  }}
                >
                  <SelectTrigger
                    aria-label={t("countryCallingCode")}
                    aria-labelledby={`${id}-calling-code`}
                    className="w-auto shrink-0 min-w-16 px-2.5"
                  >
                    <SelectValue className="flex-none whitespace-nowrap" />
                  </SelectTrigger>
                  <SelectPopup>
                    <SelectItem value="">{t("other")}</SelectItem>
                    {callingCodes.map((code) => (
                      <SelectItem key={code} value={code}>
                        {code}
                      </SelectItem>
                    ))}
                  </SelectPopup>
                </Select>
                <GroupSeparator />
                <Input
                  {...controlProps}
                  value={phoneValue}
                  className="w-full min-w-0"
                  onChange={(event) => {
                    const next = event.target.value
                    field.onChange(
                      next
                        ? `${callingCode}${callingCode ? " " : ""}${next}`
                        : ""
                    )
                  }}
                />
              </Group>
            ) : isPassword || isSearch || isUrl ? (
              <InputGroup>
                <InputGroupInput
                  {...controlProps}
                  type={isUrl ? "text" : controlProps.type}
                  value={isUrl ? urlValue : value}
                  onChange={(event) => {
                    const next = event.target.value
                    if (isUrl) {
                      field.onChange(
                        next && !/^[a-z][a-z0-9+.-]*:\/\//i.test(next)
                          ? `https://${next}`
                          : next
                      )
                    } else {
                      field.onChange(event)
                    }
                  }}
                />
                {isUrl && hasHttpsPrefix ? (
                  <InputGroupAddon className="border-e pe-2">
                    <InputGroupText>{"https://"}</InputGroupText>
                  </InputGroupAddon>
                ) : null}
                {isAvatarUrl && imageStatus !== "idle" ? (
                  <InputGroupAddon align="inline-end">
                    <span
                      role="status"
                      aria-label={
                        imageStatus === "checking"
                          ? t("checkingImageURL")
                          : imageStatus === "valid"
                            ? t("imageURLVerified")
                            : t("imageURLCouldNotBeLoaded")
                      }
                    >
                      {imageStatus === "checking" ? (
                        <LoaderCircleIcon className="size-4 animate-spin" />
                      ) : imageStatus === "valid" ? (
                        <CheckCircle2Icon className="size-4 text-success" />
                      ) : (
                        <XCircleIcon className="size-4 text-destructive" />
                      )}
                    </span>
                  </InputGroupAddon>
                ) : null}
                {isSearch ? (
                  <InputGroupAddon>
                    <SearchIcon aria-hidden="true" />
                  </InputGroupAddon>
                ) : null}
                {isPassword ? (
                  <InputGroupAddon align="inline-end">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger
                          render={
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-xs"
                              disabled={inactive}
                              aria-label={
                                visible ? t("hidePassword") : t("showPassword")
                              }
                              onClick={() => setVisible((current) => !current)}
                            />
                          }
                        >
                          {visible ? <EyeOffIcon /> : <EyeIcon />}
                        </TooltipTrigger>
                        <TooltipPopup>
                          {visible ? t("hidePassword") : t("showPassword")}
                        </TooltipPopup>
                      </Tooltip>
                    </TooltipProvider>
                  </InputGroupAddon>
                ) : isSearch && value && !readOnly ? (
                  <InputGroupAddon align="inline-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      disabled={inactive}
                      aria-label={t("clearSearch")}
                      onClick={() => {
                        field.onChange("")
                        setFocus(name)
                      }}
                    >
                      <XIcon aria-hidden="true" />
                    </Button>
                  </InputGroupAddon>
                ) : null}
              </InputGroup>
            ) : showAsyncStatus ? (
              <InputGroup>
                <InputGroupInput {...controlProps} />
                <InputGroupAddon align="inline-end">
                  {renderAsyncStatusIcon(asyncStatus)}
                </InputGroupAddon>
              </InputGroup>
            ) : (
              <Input {...controlProps} className="w-full" />
            )}
            {isPassword && showStrength ? (
              <p
                id={`${id}-strength`}
                aria-live="polite"
                className="text-xs text-muted-foreground"
              >
                {strength}
              </p>
            ) : null}
          </FieldShell>
        )
      }}
    />
  )
}
