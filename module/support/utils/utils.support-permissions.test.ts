import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  assertUserStatusTransition,
  canAddInternalNote,
  canAssignTicket,
  canChangeTicketPriority,
  canChangeTicketStatus,
  canCreateTicket,
  canListAllTickets,
  canManageFaq,
  canReadTicket,
  canReopenTicket,
  canReplyToTicket,
  canSoftDeleteTicket,
  canViewInternalMessages,
  type SupportAccessContext,
} from "./utils.support-permissions";

const manager: SupportAccessContext = {
  userId: "mgr-1",
  isSupportManager: true,
};

const user: SupportAccessContext = {
  userId: "user-1",
  isSupportManager: false,
};

const otherUser: SupportAccessContext = {
  userId: "user-2",
  isSupportManager: false,
};

const ownOpen = { requesterUserId: "user-1", status: "open" };
const ownClosed = { requesterUserId: "user-1", status: "closed" };
const foreign = { requesterUserId: "user-2", status: "open" };

describe("support ticket permissions", () => {
  it("managers list all tickets; users do not", () => {
    assert.equal(canListAllTickets(manager), true);
    assert.equal(canListAllTickets(user), false);
  });

  it("read access is owner or manager", () => {
    assert.equal(canReadTicket(user, ownOpen), true);
    assert.equal(canReadTicket(manager, foreign), true);
    assert.equal(canReadTicket(otherUser, ownOpen), false);
  });

  it("any signed-in user can create tickets", () => {
    assert.equal(canCreateTicket(user), true);
  });

  it("reply requires read access", () => {
    assert.equal(canReplyToTicket(user, ownOpen), true);
    assert.equal(canReplyToTicket(otherUser, ownOpen), false);
    assert.equal(canReplyToTicket(manager, foreign), true);
  });

  it("internal notes and assignment are manager-only", () => {
    assert.equal(canAddInternalNote(manager), true);
    assert.equal(canAddInternalNote(user), false);
    assert.equal(canAssignTicket(manager), true);
    assert.equal(canAssignTicket(user), false);
    assert.equal(canViewInternalMessages(manager), true);
    assert.equal(canViewInternalMessages(user), false);
  });

  it("priority and delete are manager-only", () => {
    assert.equal(canChangeTicketPriority(manager), true);
    assert.equal(canChangeTicketPriority(user), false);
    assert.equal(canSoftDeleteTicket(manager), true);
    assert.equal(canSoftDeleteTicket(user), false);
    assert.equal(canManageFaq(manager), true);
    assert.equal(canManageFaq(user), false);
  });

  it("status changes: managers always; users on own tickets", () => {
    assert.equal(canChangeTicketStatus(manager, foreign), true);
    assert.equal(canChangeTicketStatus(user, ownOpen), true);
    assert.equal(canChangeTicketStatus(otherUser, ownOpen), false);
  });

  it("reopen only when closed/resolved and actor has access", () => {
    assert.equal(canReopenTicket(user, ownClosed), true);
    assert.equal(canReopenTicket(user, ownOpen), false);
    assert.equal(canReopenTicket(otherUser, ownClosed), false);
    assert.equal(canReopenTicket(manager, ownClosed), true);
  });

  it("user status transition only allows reopen to open", () => {
    assert.equal(assertUserStatusTransition(false, "closed", "open"), true);
    assert.equal(assertUserStatusTransition(false, "resolved", "open"), true);
    assert.equal(assertUserStatusTransition(false, "open", "pending"), false);
    assert.equal(assertUserStatusTransition(true, "open", "pending"), true);
  });
});
