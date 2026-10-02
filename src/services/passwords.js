export const PASSWORD_ITERATIONS = 600_000;
const hex = bytes => Array.from(new Uint8Array(bytes), byte => byte.toString(16).padStart(2, '0')).join('');
const unhex = value => Uint8Array.from(value.match(/.{2}/g), pair => parseInt(pair, 16));
export function createPasswordTools(cryptoProvider, iterations = PASSWORD_ITERATIONS) {
  function crypto() {
    const instance = cryptoProvider();
    if (!instance?.subtle || !instance.getRandomValues) throw new Error('Password tools need HTTPS or localhost. Open the secure Codespaces URL and try again.');
    return instance;
  }
  async function derive(password, salt, count) {
    const instance = crypto();
    const key = await instance.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
    const bits = await instance.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: count }, key, 256);
    return hex(bits);
  }
  return {
    async hash(password) {
      const salt = crypto().getRandomValues(new Uint8Array(16));
      return { algorithm: 'PBKDF2-SHA256', iterations, salt: hex(salt), hash: await derive(password, salt, iterations) };
    },
    async verify(password, credential) {
      if (credential?.algorithm !== 'PBKDF2-SHA256' || !Number.isInteger(credential.iterations) || credential.iterations < 1 || credential.iterations > 2_000_000 || !/^[a-f0-9]{32}$/.test(credential.salt) || !/^[a-f0-9]{64}$/.test(credential.hash)) {
        throw new Error('Saved password data could not be read. Your account has not been changed.');
      }
      const result = await derive(password, unhex(credential.salt), credential.iterations);
      let difference = 0;
      for (let index = 0; index < result.length; index++) difference |= result.charCodeAt(index) ^ credential.hash.charCodeAt(index);
      return difference === 0;
    },
  };
}
