import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { overallFromMonitors } from "@loftlancer/ui/platform-status";
import {
  getPlatformStatus,
  isPublicMonitorUrl,
  monitorName,
  toMonitorState,
} from "./betterstack";

describe("status helpers", () => {
  it("keeps only loftlancer.com monitors", () => {
    assert.equal(isPublicMonitorUrl("https://loftlancer.com/docs"), true);
    assert.equal(isPublicMonitorUrl("https://www.google.com"), false);
    assert.equal(isPublicMonitorUrl("https://evil-loftlancer.com"), false);
    assert.equal(isPublicMonitorUrl(null), false);
  });

  it("names the four public surfaces", () => {
    assert.equal(monitorName("https://loftlancer.com", null), "Landing");
    assert.equal(monitorName("https://loftlancer.com/", null), "Landing");
    assert.equal(
      monitorName("https://loftlancer.com/studio", null),
      "Dashboard",
    );
    assert.equal(monitorName("https://loftlancer.com/x", "X"), "X");
  });

  it("maps states and the overall status", () => {
    assert.equal(toMonitorState("validating"), "pending");
    assert.equal(overallFromMonitors([]), "unknown");
    assert.equal(
      overallFromMonitors([{ status: "up" }, { status: "up" }]),
      "operational",
    );
    assert.equal(
      overallFromMonitors([{ status: "up" }, { status: "down" }]),
      "degraded",
    );
    assert.equal(overallFromMonitors([{ status: "down" }]), "outage");
  });

  it("reports not-configured without a token", async () => {
    const status = await getPlatformStatus(undefined);
    assert.equal(status.available, false);
    if (!status.available) assert.equal(status.reason, "not-configured");
  });
});
