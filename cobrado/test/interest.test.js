import { test } from "node:test"
import assert from "node:assert/strict"
import { accrueInterest } from "../app/src/domain/interest.js"
import { LATE_PAYMENT_RATES, rateFor } from "../app/src/domain/rates.js"

test("splits accrual at the semester boundary and applies each semester's rate", () => {
  const result = accrueInterest({ amount: 1000, payments: [], start: "2025-06-20", end: "2025-07-10", rates: LATE_PAYMENT_RATES })
  assert.deepEqual(
    result.segments.map((s) => [s.from, s.to, s.days, s.rate]),
    [
      ["2025-06-21", "2025-06-30", 10, 11.15],
      ["2025-07-01", "2025-07-10", 10, 10.15],
    ],
  )
  // 1000 × 11,15 % × 10/365 + 1000 × 10,15 % × 10/365
  assert.equal(result.total, 5.84)
})

test("a partial payment keeps accruing on its own day and reduces the balance afterwards", () => {
  const result = accrueInterest({
    amount: 1000,
    payments: [{ date: "2025-02-10", amount: 500 }],
    start: "2025-01-31",
    end: "2025-02-20",
    rates: LATE_PAYMENT_RATES,
  })
  assert.deepEqual(
    result.segments.map((s) => [s.from, s.to, s.balance]),
    [
      ["2025-02-01", "2025-02-10", 1000],
      ["2025-02-11", "2025-02-20", 500],
    ],
  )
  assert.equal(result.total, 4.58)
})

test("no interest before or on the due date", () => {
  assert.equal(accrueInterest({ amount: 1000, payments: [], start: "2025-06-20", end: "2025-06-20", rates: LATE_PAYMENT_RATES }).total, 0)
  assert.equal(accrueInterest({ amount: 1000, payments: [], start: "2025-06-20", end: "2025-06-01", rates: LATE_PAYMENT_RATES }).total, 0)
})

test("stops accruing once the balance is fully paid", () => {
  const result = accrueInterest({
    amount: 1000,
    payments: [{ date: "2025-02-05", amount: 1000 }],
    start: "2025-01-31",
    end: "2025-03-31",
    rates: LATE_PAYMENT_RATES,
  })
  assert.equal(result.segments.length, 1)
  assert.equal(result.segments[0].days, 5)
})

test("rates beyond the table are flagged as estimated", () => {
  assert.deepEqual(rateFor("2026-08-01", LATE_PAYMENT_RATES), { rate: 10.4, estimated: false, verified: true })
  assert.equal(rateFor("2027-02-01", LATE_PAYMENT_RATES).estimated, true)
  assert.equal(rateFor("2019-02-01", LATE_PAYMENT_RATES).estimated, true)
})
