import { test } from "node:test"
import assert from "node:assert/strict"
import { computeClaim } from "../app/src/domain/claim.js"
import { isActionable, nextAction } from "../app/src/domain/escalation.js"
import { invoice } from "./fixtures.js"

function next(inv, asOf) {
  return nextAction(inv, computeClaim(inv, asOf), asOf)
}

test("before the due date it schedules a friendly heads-up three days ahead", () => {
  const scheduled = next(invoice(), "2025-06-01")
  assert.equal(scheduled.kind, "scheduled")
  assert.equal(scheduled.stage, "pre")
  assert.equal(scheduled.date, "2025-06-17")
  assert.equal(isActionable(scheduled, "2025-06-01"), false)
  assert.equal(next(invoice(), "2025-06-18").kind, "send")
})

test("once overdue it skips the heads-up and starts with a reminder", () => {
  const action = next(invoice(), "2025-06-22")
  assert.equal(action.stage, "reminder")
  assert.equal(action.kind, "send")
  assert.equal(isActionable(action, "2025-06-22"), true)
})

test("spaces messages: follow-up waits for both the stage offset and the gap", () => {
  const reminded = invoice({ events: [{ date: "2025-06-26", type: "message", stage: "reminder" }] })
  const action = next(reminded, "2025-06-28")
  assert.equal(action.stage, "followup")
  assert.equal(action.kind, "scheduled")
  assert.equal(action.date, "2025-07-01")
})

test("jumping ahead never re-suggests an earlier stage", () => {
  const firm = invoice({ events: [{ date: "2025-07-05", type: "message", stage: "firm" }] })
  assert.equal(next(firm, "2025-07-30").stage, "masc")
  assert.equal(next(firm, "2025-07-30").kind, "masc")
})

test("a promise pauses the ladder until the promised date, then resumes", () => {
  const promised = invoice({ events: [{ date: "2025-06-25", type: "promise", promiseDate: "2025-07-05" }] })
  assert.equal(next(promised, "2025-07-01").kind, "wait")
  const resumed = next(promised, "2025-07-06")
  assert.equal(resumed.kind, "send")
  assert.match(resumed.detail, /No cumplió/)
})

test("after the formal demand it waits 30 days from receipt before suggesting the monitorio", () => {
  const sent = invoice({ events: [{ date: "2025-08-01", type: "masc", channel: "burofax" }] })
  assert.equal(next(sent, "2025-08-02").kind, "masc_receipt")
  const received = invoice({ events: [{ date: "2025-08-01", type: "masc", channel: "burofax", receivedDate: "2025-08-04" }] })
  assert.equal(next(received, "2025-08-20").kind, "wait")
  assert.equal(next(received, "2025-08-20").date, "2025-09-03")
  assert.equal(next(received, "2025-09-03").kind, "monitorio")
})

test("a dispute stops the ladder until it is resolved", () => {
  const disputed = invoice({ events: [{ date: "2025-06-25", type: "dispute" }] })
  assert.equal(next(disputed, "2025-07-01").kind, "review")
  const resolved = invoice({ events: [{ date: "2025-06-25", type: "dispute" }, { date: "2025-06-28", type: "resolved" }] })
  assert.equal(next(resolved, "2025-07-01").kind, "send")
})

test("paid late B2B invoices mention the extras that can still be claimed", () => {
  const paid = invoice({ payments: [{ date: "2025-07-10", amount: 1000 }] })
  const action = next(paid, "2025-07-11")
  assert.equal(action.kind, "none")
  assert.match(action.detail, /40 €/)
})
