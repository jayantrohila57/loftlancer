import "@/shared/auth/auth.bootstrap"

import {
  deleteAccountActivityHistoryResponse,
  getAccountActivityResponse,
} from "@modules/activity/server"

export async function GET(request: Request) {
  return getAccountActivityResponse(request)
}

export async function DELETE(request: Request) {
  return deleteAccountActivityHistoryResponse(request)
}
