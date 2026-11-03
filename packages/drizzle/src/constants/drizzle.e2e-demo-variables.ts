/** Marker in notes/values so seeded rows are obviously non-production. */
export const E2E_DEMO_SEED_MARKER = "fake-dev-only";

export const E2E_DEMO_VAR_KEY = "E2E_DEMO_KEY";

const FAKE_SECRET_SAMPLE = "sample-fake-secret-not-real";
const FAKE_CONFIG_SAMPLE = "sample-config-value";

export type E2eDemoVariableDef = {
  key: string;
  type: "secret" | "config";
  value: string;
  note: string;
};

export const E2E_DEMO_VARIABLE_DEFS: E2eDemoVariableDef[] = [
  {
    key: E2E_DEMO_VAR_KEY,
    type: "config",
    value: "playwright-local-demo-value",
    note: `${E2E_DEMO_SEED_MARKER}: E2E assertion key`,
  },
  {
    key: "APP_URL",
    type: "config",
    value: "https://e2e-demo.example.dev",
    note: `${E2E_DEMO_SEED_MARKER}: public base URL`,
  },
  {
    key: "LOG_LEVEL",
    type: "config",
    value: "debug",
    note: `${E2E_DEMO_SEED_MARKER}: local log level`,
  },
  {
    key: "DATABASE_URL",
    type: "secret",
    value: FAKE_SECRET_SAMPLE,
    note: `${E2E_DEMO_SEED_MARKER}: postgres placeholder`,
  },
  {
    key: "API_TOKEN",
    type: "secret",
    value: FAKE_CONFIG_SAMPLE,
    note: `${E2E_DEMO_SEED_MARKER}: service token placeholder`,
  },
];
