# Google native sign-in

Google is shown on the existing welcome hero after selecting sign-in. iOS also retains Apple; email retains biometric access. No Firebase, additional website, client secret, or server-side Google refresh token is used.

Public OAuth IDs are in src/constants/google.ts. The iOS reversed client ID is configured through the Google config plugin. Android package and iOS bundle are com.insightthecity.app. The Google Cloud Android client must use the Play app-signing SHA-1 for Play installs; a directly installed APK or development binary may require another client with its own signing certificate. Do not change signing keys to solve an OAuth mismatch.

The backend accepts ID tokens for GOOGLE_WEB_CLIENT_ID only, uses Google's official verifier, and keeps identities in google_auth_identities. Existing email accounts require the ITC password before linking; Google never overwrites membership or profile data. An existing Apple-only account without a password must use its existing method or the password-recovery flow before linking. New accounts require explicit legal acceptance. No extra Google scopes or offline access.

A new native build is required on both platforms. Older binaries safely omit Google. Both new runtimes use fingerprint policies so native changes cannot be shipped to incompatible binaries via OTA. Do not claim end-to-end authentication is verified until a real Google account has signed in on an installed build.

Validation: TypeScript, ESLint on modified files, Expo native configuration introspection and platform exports passed. Existing full-project lint has pre-existing errors in unrelated components. Backend 129 unit/HTTP tests and isolated local PostgreSQL linking/inactive-account/deletion integration passed. No real memberships or Google accounts were changed in these tests.

Device checks: cancel Google (no error); register with terms; sign out and sign in; link an existing paid member using password and verify unchanged member ID/access; wrong password rejected; try Apple and email/Face ID; test Play internal Android build to use the registered Play certificate.
