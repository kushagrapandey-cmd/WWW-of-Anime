import { LocalAuthService } from './LocalAuthService.js';
import { ApiAuthService } from './ApiAuthService.js';
import { ONLINE } from '../config/online.js';
export const AuthService = ONLINE ? new ApiAuthService() : new LocalAuthService();
export default AuthService;
