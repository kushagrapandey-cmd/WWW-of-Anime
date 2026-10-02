// Set VITE_REQUIRE_LOGIN=false in .env.local to allow guest Battle entry.
export const REQUIRE_LOGIN = import.meta.env?.VITE_REQUIRE_LOGIN !== 'false';
