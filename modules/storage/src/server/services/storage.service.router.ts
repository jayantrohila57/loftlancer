import { listStorageActivityService } from "./storage.service.activity"
import { storageDownloadUrlService } from "./storage.service.download"
import {
  createStorageGrantService,
  listStorageGrantsService,
  revokeStorageGrantService,
} from "./storage.service.grants"
import { initStorageUploadService } from "./storage.service.init-upload"
import { listStorageContentsService } from "./storage.service.list"
import { getStorageOverviewService } from "./storage.service.overview"
import { purgeExpiredOrgStorageTrash } from "./storage.service.purge"
import { purgeStorageItemService } from "./storage.service.purge-item"
import {
  listStorageTrashService,
  restoreStorageItemService,
  trashStorageItemService,
} from "./storage.service.trash"

export const storageService = {
  overview: getStorageOverviewService,
  list: listStorageContentsService,
  initUpload: initStorageUploadService,
  downloadUrl: storageDownloadUrlService,
  listGrants: listStorageGrantsService,
  createGrant: createStorageGrantService,
  revokeGrant: revokeStorageGrantService,
  listTrash: listStorageTrashService,
  trashItem: trashStorageItemService,
  restoreItem: restoreStorageItemService,
  purgeItem: purgeStorageItemService,
  listActivity: listStorageActivityService,
  purgeExpiredTrash: purgeExpiredOrgStorageTrash,
}
