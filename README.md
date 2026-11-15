# pos-core

A dependency-free, headless core engine for Point-of-Sale (POS) systems, decoupled from UI.

## Features
- Shopping cart logic
- Discount engine (percentage, fixed amount, item and cart level)
- Tax calculation engine (inclusive and exclusive rates, item and cart discount apportioning, fiscal breakdown)
- Payment session engine (split tenders, change calculation, and cash rounding)
- Robust monetary math using minor units (cents/qəpik)
- Zero dependencies
- Fully typed (TypeScript)

## Installation
```bash
npm install @mister-robot-cat/pos-core
```

## Quick start
All amounts are integers in minor units (1520 = 15.20).

```ts
import { Cart } from '@mister-robot-cat/pos-core';

const cart = new Cart();
cart.addItem({ id: 'latte', name: 'Latte', priceMinor: 450, quantity: 2 });
cart.addItem({ id: 'cake', name: 'Cheesecake', priceMinor: 620 });
cart.getTotalMinor(); // 1520

// Payment session with 5-minor-unit cash rounding and a 10% tip
const session = cart.createPaymentSession({ cashRounding: { intervalMinor: 5 } });
session.setTipPercent(10); // tip = 152, total due = 1672

session.addTender({ method: 'card', amountMinor: 1000 });
session.addCashTender(1000); // applies the remaining 672, change 328

session.getSummary().status; // 'paid'
```

### Payment sessions
- Split tenders across `cash`, `card`, `gift_card`, `voucher` and `other`.
- Cash tenders compute change; non-cash tenders cannot exceed the balance unless `allowNonCashOverpayment` is set.
- `cashRounding` rounds the bill to the given interval (`nearest`, `up` or `down`); the adjustment is reported in `cashRoundingAdjustmentMinor`.
- Tips (`setTipMinor` / `setTipPercent`) are added on top of the rounded bill and are never rounded.
