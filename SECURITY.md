# Security policy

## Supported release

Security fixes apply to the current `main` branch of this local portfolio product.

## Local threat model

Tapak protects local credentials, role boundaries, parcel contact details, journey integrity,
and queued mobile evidence. Passwords use scrypt with unique salts. JWT signing material and seed
passwords are required environment values and remain outside Git. The server validates roles and
parcel assignment instead of trusting hidden UI controls.

Authorization headers are redacted from request logs. Logs do not include recipient name, phone,
address, coordinates, passwords, tokens, or event payloads. Screenshot evidence uses synthetic
people and locations.

## Before internet exposure

Public deployment requires TLS at a trusted edge, account recovery, token revocation, persistent
session management, request throttling, tenant isolation, encrypted backups, retention policy,
privacy review for location data, and an external security assessment. None is implied by the
local release.

## Known upstream tooling advisories

The dependency audit on 9 October 2026 reports two high-severity advisories through Expo SDK
57 build tooling: `node-forge` 1.4.0 and `braces` 3.0.3. The registry does not yet publish the
patched versions named by those advisories (`node-forge` 1.4.1 and `braces` 3.0.4), so forcing
them would make clean installation impossible. Their paths run through Expo CLI, Metro, code
signing helpers, and file matching; Tapak does not call either package in its API or product
business logic. Re-run `pnpm audit --prod` after Expo updates and remove this exception as soon
as published compatible versions are available.

The available `uuid` advisory is mitigated with a workspace override to 11.1.1. The remaining
low-severity `esbuild` advisory applies to a Windows development server path; the local release
binds its documented web preview to the developer machine and does not expose a hosted dev
server.

Report suspected vulnerabilities privately through the contact information on the repository
owner's GitHub profile. Do not include real recipient data or active credentials in a public issue.
