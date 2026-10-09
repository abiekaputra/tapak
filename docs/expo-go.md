# Expo Go validation

## Prepare the local network

1. Connect the computer and phone to the same Wi-Fi network.
2. Run `pnpm setup:local` from the repository root.
3. Confirm `apps/mobile/.env.local` uses the computer's current LAN IPv4 address.
4. Allow inbound local connections to Node.js if macOS asks.

## Start Tapak

Terminal one:

```bash
pnpm dev
```

Terminal two:

```bash
pnpm dev:mobile
```

Open Expo Go and scan the QR code. Use the courier credentials from
`runtime/local-credentials.txt`.

## Physical-device checklist

- The route screen loads the assignment created in the web console.
- Camera permission opens the scanner and a Tapak QR label resolves.
- Location permission is requested only when recording evidence.
- Pickup remains visible after Wi-Fi is disabled.
- The route shows a pending-sync notice after returning to it.
- Re-enabling Wi-Fi removes the pending item after replay.
- Transit and delivery reach the operator timeline.
- Delivery shows the recipient name and coordinates.

The automated browser journey exercises the same React Native screen tree with a narrow viewport
and synthetic geolocation. A physical Expo Go run remains the final validation for camera and
device permission presentation.
