"use client"

import { useClearActivity } from "./activity.hook.activity.clear"
import { useDeleteActivity } from "./activity.hook.activity.delete"
import { useListActivity } from "./activity.hook.activity.list"

export const useActivityApi = {
  useList: useListActivity,
  useDelete: useDeleteActivity,
  useClear: useClearActivity,
}
export const securityActivityApi = {
  useActivity: useListActivity,
  useDeleteActivity,
}
