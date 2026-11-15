import "@/shared/auth/auth.bootstrap"

import {
  deleteAccountLocationHistoryResponse,
  getAccountLocationResponse,
  mutateAccountLocationResponse,
} from "@modules/location/server"

export async function GET(request: Request) {
  return getAccountLocationResponse(request)
}

export async function POST(request: Request) {
  return mutateAccountLocationResponse(request)
}

export async function DELETE(request: Request) {
  return deleteAccountLocationHistoryResponse(request)
}
