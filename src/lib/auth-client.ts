import { createAuthClient } from "better-auth/react";
import { jwtClient } from "better-auth/client/plugins";

// No hard-coded baseURL on purpose: Better Auth then uses the origin the page
// was opened from. A fixed `http://localhost:3000` broke sign-up/sign-in when
// the app was opened via `http://127.0.0.1:3000` or a LAN IP (the request was
// treated as cross-origin and rejected with "Invalid origin").
export const authClient = createAuthClient({
  plugins: [
    jwtClient(),
  ],
});

export const { signIn, signUp, signOut, useSession } = authClient;

