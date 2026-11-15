import { describe, expect, it } from 'vitest';
import { PaymentSession } from '../src/payment';

describe('PaymentSession tips', () => {
  it('defaults to no tip', () => {
    const session = new PaymentSession(1000);
    expect(session.getTipMinor()).toBe(0);
    expect(session.getSummary().tipMinor).toBe(0);
    expect(session.getTotalDueMinor()).toBe(1000);
  });

  it('adds an absolute tip to the total due', () => {
    const session = new PaymentSession(1000);
    session.setTipMinor(150);
    expect(session.getTotalDueMinor()).toBe(1150);
    expect(session.getOriginalDueMinor()).toBe(1000);
    expect(session.getSummary().tipMinor).toBe(150);
  });

  it('replaces the previous tip instead of accumulating', () => {
    const session = new PaymentSession(1000);
    session.setTipMinor(100);
    session.setTipMinor(50);
    expect(session.getTotalDueMinor()).toBe(1050);
  });

  it('computes a percentage tip from the original bill and rounds to a minor unit', () => {
    const session = new PaymentSession(1999);
    expect(session.setTipPercent(10)).toBe(200);
    expect(session.getTotalDueMinor()).toBe(2199);
  });

  it('does not round the tip with cash rounding and keeps the adjustment bill-only', () => {
    const session = new PaymentSession(1003, { cashRounding: { intervalMinor: 5 } });
    session.setTipMinor(101);
    expect(session.getCashRoundingAdjustmentMinor()).toBe(2);
    expect(session.getTotalDueMinor()).toBe(1005 + 101);
  });

  it('requires the tip to be paid before the session is settled', () => {
    const session = new PaymentSession(1000);
    session.setTipMinor(200);
    session.addTender({ method: 'card', amountMinor: 1000 });
    expect(session.isSettled()).toBe(false);
    expect(session.getRemainingDueMinor()).toBe(200);
    expect(session.getSummary().status).toBe('partially_paid');

    session.addCashTender(500);
    const summary = session.getSummary();
    expect(summary.status).toBe('paid');
    expect(summary.changeDueMinor).toBe(300);
  });

  it('allows a tip on a zero bill', () => {
    const session = new PaymentSession(0);
    session.setTipMinor(300);
    expect(session.getSummary().status).toBe('unpaid');
    session.addCashTender(300);
    expect(session.isSettled()).toBe(true);
  });

  it('rejects invalid tips', () => {
    const session = new PaymentSession(1000);
    expect(() => session.setTipMinor(-1)).toThrow();
    expect(() => session.setTipMinor(1.5)).toThrow();
    expect(() => session.setTipPercent(-5)).toThrow();
    expect(() => session.setTipPercent(Number.NaN)).toThrow();
    expect(session.getTipMinor()).toBe(0);
  });
});
