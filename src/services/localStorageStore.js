export const USERS_KEY = 'www-of-anime:accounts:v1';
export const SESSION_KEY = 'www-of-anime:session:v1';
export function createLocalStore(getStorage) {
  function storage() {
    try { return getStorage(); } catch { throw new Error('Browser storage is unavailable. Enable storage for this site and try again.'); }
  }
  return {
    read(key, fallback) {
      let value;
      try { value = storage().getItem(key); } catch { throw new Error('Browser storage is unavailable. Enable storage for this site and try again.'); }
      if (value === null) return fallback;
      try { return JSON.parse(value); } catch { throw new Error('Saved account data could not be read. Your existing data has not been replaced.'); }
    },
    write(key, value) {
      try { storage().setItem(key, JSON.stringify(value)); } catch { throw new Error('Could not save your account. Browser storage may be blocked or full.'); }
    },
    remove(key) {
      try { storage().removeItem(key); } catch { throw new Error('Could not clear this browser session. Check site storage permissions.'); }
    },
  };
}
