if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = "test";
}
process.env.SKIP_ENV_VALIDATION ??= "1";
process.env.DATABASE_URL ??=
  "postgresql://postgres:postgres@127.0.0.1:5432/postgres";
process.env.BETTER_AUTH_SECRET ??= "test-secret-test-secret-test-secret!!";
process.env.BETTER_AUTH_URL ??= "http://localhost:3000";
process.env.GITHUB_CLIENT_ID ??= "test-github-client-id";
process.env.GITHUB_CLIENT_SECRET ??= "test-github-client-secret";
process.env.CORS_ORIGIN ??= "http://localhost:3000";
process.env.ENCRYPTION_KEY ??= "01234567890123456789012345678901";
