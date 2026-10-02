import { ONLINE } from './online';
export const REQUIRE_LOGIN = ONLINE || import.meta.env?.VITE_REQUIRE_LOGIN !== 'false';
