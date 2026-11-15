"use client"
import { useDeleteLocation } from "./location.hook.delete"
import { useLocationPreference } from "./location.hook.preference"
import { useSaveLocation } from "./location.hook.save"
export function useLocationMutations() {
  const preference = useLocationPreference()
  const save = useSaveLocation()
  const remove = useDeleteLocation()
  return {
    setPreference: preference.mutateAsync,
    saveLocation: save.mutateAsync,
    deleteHistory: remove.mutateAsync,
  }
}
