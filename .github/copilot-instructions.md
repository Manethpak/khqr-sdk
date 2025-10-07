# KHQR SDK - AI Coding Agent Instructions# KHQR SDK - AI Coding Agent Instructions

TypeScript SDK for generating, decoding, and validating KHQR (Cambodia's Bakong QR payment codes) following the EMV QR Code specification.## Project Overview

## Architecture OverviewTypeScript SDK for generating and validating KHQR (Cambodia's Bakong QR payment codes) following the EMV QR Code specification. This SDK wraps the Bakong API with type-safe schemas and provides QR generation utilities.

### Dual Module System## Architecture

**API Client** (`src/index.ts`): Type-safe Bakong API wrapper using `@better-fetch/fetch` + Zod schemas ### Dual Module System

**QR Module** (`src/qr/`): Pure TypeScript EMV-compliant KHQR generation/validation engine

- **API Client Module** (`src/index.ts`): Uses `@better-fetch/fetch` with Zod schemas for type-safe Bakong API calls

### EMV Tag-Length-Value (TLV) Pattern- **QR Generation Module** (`src/qr/`): Pure TypeScript implementation for EMV-compliant KHQR generation

All QR codes are built from TLV triplets (Tag 2 chars + Length 2 chars + Value):### Key Design Patterns

```````typescript**EMV Tag Structure**: All QR codes are built from tag-length-value (TLV) triplets

'00' + '02' + '01' // Payload Format Indicator = "000201"

``````typescript

// Tag (2 chars) + Length (2 chars) + Value (n chars)

Tags are assembled in `src/qr/helper/tags.ts` using `formatTag()` utility. **Order matters** - EMV spec mandates strict tag sequencing (see `generateKHQR()`).'00' + '02' + '01' // Payload Format Indicator = "000201"

```````

### Result Type Pattern

Tags are built in `src/qr/helper/tags.ts` using the `formatTag()` utility.

All QR operations return `Result<T>` (not exceptions):

**Smart Type Detection**: `generateKHQR()` auto-detects individual vs merchant accounts:

```typescript

const result = qr.generateKHQR(info)- Individual: Has `bakongAccountID` but no `merchantID`

if (result.error) {- Merchant: Has both `bakongAccountID` AND `merchantID`

  // Handle KHQRError- Static QR: `amount` is 0 or undefined → Point of Initiation = "11"

} else {- Dynamic QR: `amount` > 0 → Point of Initiation = "12"

  // Use result.result

}**CRC16 Calculation**: Always the final step in QR generation (`src/qr/helper/crc.ts`)

```

1. Build complete QR string with `6304` placeholder

Create results with `success()` or `failed()` from `src/qr/helper/result.ts`.2. Calculate CRC16 using EMV polynomial (0x1021)

3. Append uppercase hex CRC as final tag

## Critical Conventions

## Development Workflows

### Error Handling

### Building & Testing

Use `KHQRError` factory functions - **never throw generic errors**:

````bash

```typescriptpnpm build          # Compiles TypeScript to dist/

return failed<QRResult>(error.invalidFormat('Detailed message'))pnpm run lint:fix   # Auto-fix ESLint issues

// NOT: throw new Error('message')pnpm run format     # Format with Prettier

````

# Manual testing (no formal test framework yet)

All error codes are in `src/qr/helper/errors.ts::ERROR_CODES`.npx tsx src/qr/test-generate.ts # Run QR generation tests

````

### Validation Before Processing

### Adding New Bakong API Endpoints

**Always validate input before generating QR codes**:

1. Add endpoint schema to `src/schema/index.ts` using `createSchema()`

```typescript2. Follow existing Zod validation patterns from `src/schema/constant.ts`

const validation = validators.validateIndividualInfo(info)3. All API responses extend `baseResponse` which includes `errorCode`, `responseCode`, and `responseMessage`

if (!validation.isValid) {

  return failed<QRResult>(error.invalidFormat(validation.errors.join(', ')))### Modifying QR Generation Logic

}

// ... proceed with generation1. Constants live in `src/qr/constants/emv.ts` (tags, lengths, currency codes)

```2. Tag builders in `src/qr/helper/tags.ts` follow the `createXXX()` pattern

3. Validators in `src/qr/helper/validator.ts` return `ValidationResult` objects

### Currency Rules4. Core generation logic in `src/qr/core/generate.ts` assembles tags in EMV order



- **KHR**: Whole numbers only (ISO 4217 code "116")## Project-Specific Conventions

- **USD**: Max 2 decimal places (ISO 4217 code "840")

- Validators enforce these in `validators.amount()`**Currency Handling**:



### Path Aliases- KHR (Khmer Riel): Must be whole numbers (no decimals)

- USD: Max 2 decimal places

Use `@/` for absolute imports from `src/`:- Currency codes: KHR="116", USD="840" (ISO 4217 numeric)



```typescript**Field Length Limits**: Enforced via `MAX_LENGTHS` constant - merchant names 25 chars, account IDs 32 chars, etc.

import { tag } from '@/qr/helper/tags'

import { IndividualInfo } from '@/qr/types'**Error Handling**: Use `KHQRError` class (from `src/qr/helper/errors.ts`) - never throw generic errors

````

````typescript

## Development Workflowsreturn error.invalidFormat('Detailed error message')

// Returns KHQRError instance, not exception

### Build & Test```



```bash**Validation Pattern**: All generation functions validate input BEFORE processing:

pnpm build          # tsdown compiles to dist/ with dual ESM/CJS exports

pnpm test           # vitest tests (see src/qr/core/tests/*.spec.ts)```typescript

pnpm coverage       # vitest coverage reportconst validation = validators.validateIndividualInfo(info)

pnpm lint:fix       # auto-fix ESLint issuesif (!validation.isValid) {

pnpm format         # Prettier formatting  return error.invalidFormat(validation.errors.join(', '))

```}

````

### Adding Bakong API Endpoints

## Critical Integration Points

1. Add endpoint to `src/schema/index.ts` using `createSchema()`:

- **Bakong API Base URLs**: Prod = `https://api-bakong.nbc.gov.kh`, Dev = `https://api.bakong.io`

````typescript- **MD5 Hashing**: Generated QR strings are MD5-hashed for transaction tracking

'/v1/endpoint': {- **Authentication**: Bearer token auth via `/v1/renew_token` endpoint

  method: 'post',- **Deeplink Generation**: Uses `/v1/generate_deeplink_by_qr` to create payment links for mobile apps

  input: z.object({ /* Zod schema */ }),

  output: baseResponse.extend({ /* extends base response */ })## Common Gotchas

}

```1. **Tag Ordering Matters**: EMV specification requires specific tag order (see `generateKHQR()`)

2. **UPI Merchant Account** (Tag 15): Must be inserted AFTER Point of Initiation Method (Tag 01), not at the end

2. All responses include `errorCode`, `responseCode`, `responseMessage` (see `src/schema/constant.ts::baseResponse`)3. **Timestamp Tag** (99): Only for dynamic QR codes with expiration

3. Error codes 1-12 are documented in `baseResponse` JSDoc4. **Language Template** (64): Optional, only include if alternate language fields are provided

5. **Package Manager**: This project uses `pnpm` (v10.13.1) - see `packageManager` field in package.json

### Modifying QR Generation

## Future Development Notes

**Constants**: `src/qr/constants/emv.ts` (EMV tags, field length limits)

**Tag Builders**: `src/qr/helper/tags.ts` - follow `createXXX()` pattern  TODOs documented in `src/qr/index.ts`:

**Validators**: `src/qr/helper/validator.ts` - return `ValidationResult`

**Core Logic**: `src/qr/core/generate.ts` - assembles tags in EMV order- Implement full `BakongKHQR` class wrapper

- Add decode/verify functions for QR validation

**CRC16 Finalization** (always last step):- Type definitions in `src/qr/types/core.type.ts` show planned API surface


1. Build QR string with `6304` placeholder
2. Calculate CRC16 using EMV polynomial (0x1021) via `calculateCRC16()`
3. Append uppercase hex as final tag

### Testing Pattern

Tests use Vitest with `describe`/`test` blocks. See `src/qr/core/tests/generate.spec.ts`:

```typescript
test('Individual Account - Minimal Required Fields (Static QR)', () => {
  const info: IndividualInfo = { /* ... */ }
  const result = qr.generateKHQR(info)

  expect(result.error).toBeNull()
  expect(validators.isStaticQR(result.result?.qr)).toBe(true)
})
````

Use `futureTimestamp` (Date.now() + 3600000) for dynamic QR expiration tests.

## Smart Type Detection

`generateKHQR()` auto-detects account type:

- **Individual**: `bakongAccountID` present, NO `merchantID`
- **Merchant**: BOTH `bakongAccountID` AND `merchantID`
- **Static QR**: `amount` is 0/undefined → Point of Initiation = "11"
- **Dynamic QR**: `amount` > 0 → Point of Initiation = "12"

## Critical Gotchas

1. **UPI Merchant Account (Tag 15)**: Must insert AFTER Point of Initiation (Tag 01), not at end
2. **Timestamp Tag (99)**: Only for dynamic QR with `expirationTimestamp`
3. **Language Template (64)**: Optional - only include if alternate language fields provided
4. **MD5 Hashing**: All generated QR strings are MD5-hashed for transaction tracking
5. **Package Manager**: Locked to `pnpm@10.13.1` (see `packageManager` in package.json)

## Module Exports

Package provides subpath exports (via tsdown):

```typescript
import { createKHQR } from 'khqr-sdk' // Main API
import { EMV_TAGS } from 'khqr-sdk/constants' // Constants
import { validators } from 'khqr-sdk/helper' // Helpers
import { IndividualInfo } from 'khqr-sdk/types' // Types
```

See `package.json::exports` for full mapping.

## Example Usage

```typescript
import { createKHQR } from 'khqr-sdk'

const khqr = createKHQR({
  baseURL: 'https://api-bakong.nbc.gov.kh',
  auth: { type: 'Bearer', token: process.env.BAKONG_TOKEN },
})

// Generate QR
const { result, error } = khqr.qr.generateKHQR({
  bakongAccountID: 'user@bank',
  merchantName: 'John Doe',
  merchantCity: 'Phnom Penh',
  amount: 10000,
  currency: 'KHR',
})

// Decode QR
const decoded = khqr.qr.decodeKHQR(qrString)

// Verify QR
const verified = khqr.qr.verifyKHQRString(qrString)
```

See `example/src/index.ts` for Hono server integration example.
