import { test } from "node:test"
import assert from "node:assert/strict"
import { computeClaim } from "../app/src/domain/claim.js"
import { invoice } from "./fixtures.js"

test("a B2B invoice overdue accrues interest from the due date plus the 40 € compensation", () => {
  const claim = computeClaim(invoice(), "2025-07-10")
  assert.equal(claim.status, "overdue")
  assert.equal(claim.daysLate, 20)
  assert.equal(claim.interest.total, 5.84)
  assert.equal(claim.compensation, 40)
  assert.equal(claim.claimable, 1045.84)
})

test("an invoice not yet due has nothing extra to claim", () => {
  const claim = computeClaim(invoice(), "2025-06-15")
  assert.equal(claim.status, "upcoming")
  assert.equal(claim.daysToDue, 5)
  assert.equal(claim.claimable, 1000)
})

test("paid late keeps the interest and compensation still claimable", () => {
  const claim = computeClaim(invoice({ payments: [{ date: "2025-07-10", amount: 1000 }] }), "2025-12-01")
  assert.equal(claim.status, "paid_late")
  assert.equal(claim.outstanding, 0)
  assert.equal(claim.daysLate, 20)
  assert.equal(claim.claimable, 45.84)
})

test("partial payments report outstanding balance and partial status", () => {
  const claim = computeClaim(invoice({ payments: [{ date: "2025-06-25", amount: 400 }] }), "2025-07-10")
  assert.equal(claim.status, "partial")
  assert.equal(claim.outstanding, 600)
})

test("consumers get no compensation and legal interest only from the formal demand", () => {
  const consumer = { client: { name: "Juan Pérez", type: "particular" } }
  const before = computeClaim(invoice(consumer), "2025-07-10")
  assert.equal(before.compensation, 0)
  assert.equal(before.interest.total, 0)
  assert.ok(before.warnings.some((w) => w.includes("Ley 3/2004")))

  const after = computeClaim(invoice({ ...consumer, events: [{ date: "2025-07-01", type: "message", stage: "firm" }] }), "2025-07-31")
  assert.equal(after.interestStart, "2025-07-01")
  // 1000 × 3,25 % × 30/365
  assert.equal(after.interest.total, 2.67)
})

test("warns when the agreed B2B term exceeds 60 days", () => {
  const claim = computeClaim(invoice({ issueDate: "2025-01-01", dueDate: "2025-04-01" }), "2025-04-10")
  assert.ok(claim.warnings.some((w) => w.includes("60 días")))
})

test("written-off invoices keep their figures but change status", () => {
  assert.equal(computeClaim(invoice({ status: "written_off" }), "2025-07-10").status, "written_off")
})
