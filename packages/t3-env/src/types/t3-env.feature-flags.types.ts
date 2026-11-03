export type FeatureFlagPair = {
  id: string;
  label: string;
  serverKey: string;
  clientKey: string;
  docPath: string;
};

export type ServerOnlyFeatureFlag = {
  id: string;
  label: string;
  serverKey: string;
  docPath: string;
};

export type FeatureFlagSnapshotRow = {
  id: string;
  label: string;
  serverKey: string;
  clientKey: string | null;
  serverEnabled: boolean;
  docPath: string;
};
