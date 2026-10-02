// Production fails closed into server accounts; local demos require an explicit build flag.
export const ONLINE = import.meta.env.VITE_AUTH_MODE === 'online' || (import.meta.env.PROD && import.meta.env.VITE_AUTH_MODE !== 'demo');
