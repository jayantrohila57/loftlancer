"use client"

import { useUploadAvatar } from "./profile.hook.avatar-upload"
import { useUpdateProfile } from "./profile.hook.update"

export const useProfileApi = { useUpdate: useUpdateProfile, useUploadAvatar }
export const api = { profile: { useUpdateProfile, useUploadAvatar } }
