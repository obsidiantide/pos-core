# Roadmap

## Core Features
- [ ] Refund / return engine (negative tenders and restocking)
- [ ] Tip support in `PaymentSession`
- [ ] Buy-X-get-Y discount type
- [ ] Per-item price override with reason code

## Test Coverage
- [x] Cart discount cleanup, tax rates, payment session and quantity validation
- [x] Invariant tests for `roundCashAmount` (multiples, idempotence, symmetry)
- [x] Tests for mixed inclusive/exclusive tax combined with item discounts

## Architecture & Refactoring
- [x] Extract shared minor-unit validation helpers (`assertPositiveInteger`)
- [ ] Split `Cart.getTaxSummary` into smaller pure functions
- [ ] Export a serializable cart snapshot (`toJSON` / `fromJSON`)

## Performance & Polish
- [ ] Ship ESM and CJS builds with type declarations
- [ ] Document the public API with examples in the README
