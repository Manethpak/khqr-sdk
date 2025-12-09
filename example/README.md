# KHQR SDK Example App

A comprehensive demonstration of all KHQR SDK functions using Hono.js with an interactive web interface.

## Features

This example app demonstrates:

### QR Code Generation

- **Static QR Code** - Generate QR codes without fixed amounts
- **Dynamic QR Code** - Generate QR codes with fixed amounts and metadata
- **Merchant QR Code** - Generate QR codes for registered merchants

### QR Code Processing

- **Decode QR** - Extract all information from a KHQR string
- **Verify QR** - Validate structural integrity and CRC checksum

### Bakong API Integration

- **Check Account** - Verify if a Bakong account exists
- **Check Transactions** - Query transactions by MD5, hash, or other identifiers
- **Generate Deeplinks** - Create mobile app deeplinks for QR codes
- **Renew Token** - Refresh API authentication tokens

## Prerequisites

- Node.js >= 20
- pnpm (or npm/yarn)
- Bakong API Token (optional, for API features)

## Installation

```bash
# Install dependencies
pnpm install

# Or using npm
npm install

# Or using yarn
yarn install
```

## Configuration

Set your Bakong API credentials (optional):

```bash
# Create a .env file
echo "BAKONG_API_TOKEN=your_token_here" > .env
echo "BAKONG_API_URL=https://api-bakong.nbc.gov.kh" >> .env
```

If you don't have a token, you can still use the QR generation, decoding, and verification features.

## Running the App

### Development Mode

```bash
pnpm dev
```

The server will start at `http://localhost:3000` with hot-reload enabled.

### Production Mode

```bash
# Build the app
pnpm build

# Start the server
pnpm start
```

## Usage

Open your browser and navigate to `http://localhost:3000`. You'll see an interactive interface with 8 sections:

### 1. Generate Static QR Code

Create a QR code without a fixed amount. Users scan and enter the amount manually.

**Example:**

```json
{
  "bakongAccountID": "user@aclb",
  "merchantName": "My Coffee Shop",
  "merchantCity": "Phnom Penh",
  "currency": "KHR"
}
```

**Response:**

```json
{
  "data": {
    "qr": "00020101021229370014user@aclb520459995802KH5913My Coffee Shop6011Phnom Penh6304ABCD",
    "md5": "abc123def456..."
  }
}
```

### 2. Generate Dynamic QR Code

Create a QR code with a fixed amount and optional metadata.

**Example:**

```json
{
  "bakongAccountID": "merchant@aclb",
  "merchantName": "Royal Restaurant",
  "merchantCity": "Phnom Penh",
  "amount": 50000,
  "currency": "KHR",
  "billNumber": "INV-12345",
  "mobileNumber": "+85512345678"
}
```

### 3. Generate Merchant QR Code

Create a QR code for registered merchants with merchant ID.

**Example:**

```json
{
  "bakongAccountID": "bigstore@aclb",
  "merchantID": "MERCH001",
  "merchantName": "Super Market",
  "merchantCity": "Phnom Penh",
  "currency": "KHR",
  "acquiringBank": "ACLB",
  "merchantCategoryCode": "5411"
}
```

### 4. Decode QR Code

Extract all information from a KHQR string.

**Example Input:**

```
00020101021229370014user@aclb520459995802KH5913My Coffee Shop6011Phnom Penh6304ABCD
```

**Response:**

```json
{
  "data": {
    "payloadFormatIndicator": "01",
    "pointOfInitiationMethod": "11",
    "merchantAccountInfo": {
      "bakongAccountID": "user@aclb"
    },
    "merchantName": "My Coffee Shop",
    "merchantCity": "Phnom Penh",
    "countryCode": "KH",
    "transactionCurrency": "116",
    "crc": "ABCD"
  }
}
```

### 5. Verify QR Code

Validate structural integrity and CRC checksum.

**Response:**

```json
{
  "data": {
    "isValid": true,
    "expectedCRC": "ABCD",
    "actualCRC": "ABCD",
    "errors": []
  }
}
```

### 6. Check Bakong Account

Verify if a Bakong account ID exists.

**Example:**

```json
{
  "bakongAccountID": "user@aclb"
}
```

**Response:**

```json
{
  "data": {
    "responseCode": 0,
    "responseMessage": "Success",
    "errorCode": null
  }
}
```

Response codes:

- `0` - Account exists
- `1` - Account not found

### 7. Check Transaction by MD5

Check transaction status using the MD5 hash from QR generation.

**Example:**

```json
{
  "md5": "abc123def456..."
}
```

**Response:**

```json
{
  "data": {
    "responseCode": 0,
    "data": {
      "hash": "tx_hash_here",
      "fromAccountId": "payer@bank",
      "toAccountId": "merchant@bank",
      "amount": 50000,
      "currency": "KHR",
      "description": "Payment",
      "createDateMs": 1234567890000,
      "acknowledgeDateMs": 1234567890000
    }
  }
}
```

### 8. Generate Deeplink

Create a mobile app deeplink for a KHQR code.

**Example:**

```json
{
  "qr": "00020101021229370014user@aclb...",
  "sourceInfo": {
    "appIconUrl": "https://example.com/icon.png",
    "appName": "My Payment App",
    "appDeepLinkCallback": "myapp://payment/callback"
  }
}
```

**Response:**

```json
{
  "data": {
    "responseCode": 0,
    "data": {
      "shortLink": "https://bakong.page.link/abc123"
    }
  }
}
```

## API Endpoints

All endpoints accept JSON and return JSON responses.

### QR Generation

- `POST /api/qr/generate-static` - Generate static QR
- `POST /api/qr/generate-dynamic` - Generate dynamic QR
- `POST /api/qr/generate-merchant` - Generate merchant QR

### QR Processing

- `POST /api/qr/decode` - Decode QR string
- `POST /api/qr/verify` - Verify QR string

### Bakong API

- `POST /api/bakong/check-account` - Check account existence
- `POST /api/bakong/check-transaction-md5` - Check transaction by MD5
- `POST /api/bakong/check-transaction-hash` - Check transaction by hash
- `POST /api/bakong/check-transaction-short-hash` - Check by short hash
- `POST /api/bakong/check-transaction-instruction-ref` - Check by instruction ref
- `POST /api/bakong/check-transaction-external-ref` - Check by external ref
- `POST /api/bakong/check-transaction-md5-list` - Batch check by MD5 list
- `POST /api/bakong/check-transaction-hash-list` - Batch check by hash list
- `POST /api/bakong/generate-deeplink` - Generate mobile deeplink
- `POST /api/bakong/renew-token` - Renew API token

## Currency Support

### KHR (Khmer Riel)

- Must be whole numbers only
- No decimal places allowed

```json
{
  "amount": 10000,
  "currency": "KHR"
}
```

### USD (US Dollar)

- Supports up to 2 decimal places

```json
{
  "amount": 25.99,
  "currency": "USD"
}
```

## QR Code Types

The SDK automatically detects QR code types:

### Static QR

- No amount specified or amount = 0
- Point of Initiation Method = "11"
- User enters amount manually when scanning

### Dynamic QR

- Amount > 0
- Point of Initiation Method = "12"
- Fixed amount in QR code

### Individual vs Merchant

- **Individual**: Has `bakongAccountID` only
- **Merchant**: Has both `bakongAccountID` and `merchantID`

## Error Handling

All endpoints return errors in this format:

```json
{
  "error": {
    "code": "INVALID_AMOUNT",
    "message": "Invalid amount for currency",
    "details": {}
  }
}
```

Common error codes:

- `INVALID_QR` - Invalid QR code format
- `INVALID_AMOUNT` - Invalid amount for currency
- `INVALID_ACCOUNT` - Invalid account information
- `REQUIRED_FIELD` - Required field missing
- `INVALID_FORMAT` - Invalid format
- `CRC_INVALID` - CRC checksum is invalid

## Project Structure

```
example/
├── src/
│   └── index.ts          # Main server with all endpoints
├── package.json          # Dependencies
├── tsconfig.json         # TypeScript config
└── README.md            # This file
```

## Technologies Used

- **Hono.js** - Fast web framework
- **KHQR SDK** - KHQR generation and validation
- **Zod** - Schema validation
- **TypeScript** - Type safety
- **Vanilla JavaScript** - Interactive frontend

## License

ISC

## Support

For issues or questions about the KHQR SDK, visit:

- [GitHub Repository](https://github.com/manethpak/khqr-sdk)
- [NPM Package](https://www.npmjs.com/package/@manethpak/khqr-sdk)

## Contributing

This is an example application. For SDK contributions, please visit the main repository.
