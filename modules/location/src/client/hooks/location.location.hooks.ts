"use client"
import { useLocation, useReadLocation } from "./location.hook.get"
import { useLocationMutations } from "./location.hook.mutations"

function useLocationActions() {
  const readState = useReadLocation()
  const mutations = useLocationMutations()
  return { readState, ...mutations }
}
export const useLocationApi = {
  useGet: useLocation,
  useActions: useLocationActions,
}
export const securityLocationApi = { useLocation, useLocationActions }
