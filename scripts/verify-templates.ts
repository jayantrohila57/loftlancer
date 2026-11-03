import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "../packages/drizzle/src/index";
import { user } from "../packages/drizzle/src/schema/better-auth";
import { appRouter } from "../packages/orpc/src/routers/index";

async function main() {
  console.log("🚀 Starting Template Verification...");

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("❌ DATABASE_URL is missing!");
    process.exit(1);
  }
  console.log(`🔌 DB URL: ${dbUrl.substring(0, 15)}...`);

  // 1. Setup Context
  const TEST_USER_ID = `test-user-${randomUUID().slice(0, 8)}`;
  console.log(`👤 Using Test User ID: ${TEST_USER_ID}`);

  try {
    // Create Test User in DB
    await db.insert(user).values({
      id: TEST_USER_ID,
      name: "Test User",
      email: `test-${TEST_USER_ID}@example.com`,
      emailVerified: true,
    });
    console.log("✅ Test User Created in DB");

    const ctx = {
      session: {
        user: {
          id: TEST_USER_ID,
          name: "Test User",
          email: "test@example.com",
          image: null,
        },
        session: {
          id: `test-session-${TEST_USER_ID}`,
          userId: TEST_USER_ID,
          expiresAt: new Date(Date.now() + 3600 * 1000),
          token: `token-${TEST_USER_ID}`,
          createdAt: new Date(),
          updatedAt: new Date(),
          ipAddress: null,
          userAgent: null,
        },
      },
    };

    const caller = appRouter.createCaller(ctx);

    // 2. Create Template
    console.log("📝 Creating Template...");
    const tmpl = await caller.templates.create({
      name: `Verification Template ${TEST_USER_ID}`,
      description: "Automated test template",
      variables: [
        { key: "TEST_VAR_1", value: "value1", description: "First variable" },
        { key: "TEST_VAR_2", value: "value2" },
      ],
    });
    console.log("✅ Template Created:", tmpl.data.id);

    // 3. Verify List
    console.log("📋 Listing Templates...");
    const list = await caller.templates.list();
    const found = list.data.find((t) => t.id === tmpl.data.id);
    if (!found) throw new Error("Template not found in list");
    console.log("✅ Template found in list");

    // 4. Create Project & Environment
    console.log("🏗️ Creating Project & Environment...");
    const proj = await caller.projects.create({
      name: `Test Project ${TEST_USER_ID}`,
    });
    console.log("✅ Project Created:", proj.data.id);

    const env = await caller.environments.create({
      projectId: proj.data.id,
      name: "Test Env",
    });
    console.log("✅ Environment Created:", env.data.id);

    // 5. Apply Template
    console.log("🔧 Applying Template...");
    const applyResult = await caller.templates.applyTemplate({
      templateId: tmpl.data.id,
      environmentId: env.data.id,
    });
    console.log("✅ Apply Result:", applyResult.data);

    if (applyResult.data.created !== 2) {
      throw new Error(
        `Expected 2 created variables, got ${applyResult.data.created}`,
      );
    }

    // 6. Verify Variables
    console.log("🔍 Verifying Variables...");
    const vars = await caller.environmentVariables.list({
      environmentId: env.data.id,
    });

    if (vars.data.length !== 2) {
      throw new Error(
        `Expected 2 variables in environment, got ${vars.data.length}`,
      );
    }
    console.log("✅ Variables verified in environment");

    // 7. Cleanup
    console.log("🧹 Cleaning up...");
    await caller.projects.delete({ id: proj.data.id });
    await caller.templates.delete({ id: tmpl.data.id });
    await db.delete(user).where(eq(user.id, TEST_USER_ID));
    console.log("✅ Cleanup complete");

    console.log("🎉 Verification Successful!");
  } catch (error) {
    console.error("❌ Verification Failed:", error);
    // Cleanup attempt
    try {
      await db.delete(user).where(eq(user.id, TEST_USER_ID));
    } catch (_e) {}
    process.exit(1);
  }
}

main();
