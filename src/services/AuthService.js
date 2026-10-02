import { LocalAuthService } from './LocalAuthService.js';
// Public async contract: signUp, logIn, logOut, getCurrentUser, updateStats(updates, battleReceipt), getBattleReceipt, updateProfile.
// UI imports this facade only. Replace the adapter with ApiAuthService later.
export const AuthService = new LocalAuthService();
export default AuthService;
