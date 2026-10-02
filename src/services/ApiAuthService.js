import { api } from './ApiClient.js';
export class ApiAuthService {
  getCurrentUser(){return api('auth/me',{},'GET');}
  signUp(data){return api('auth/signup',data);}
  logIn(data){return api('auth/login',data);}
  logOut(){return api('auth/logout');}
  updateProfile(data){return api('profile/avatar',data);}
  async updateStats(){throw new Error('Online rank is awarded by the match server.');}
  async getBattleReceipt(){return null;}
  async getQuizReceipt(){return null;}
  async getGameReceipt(){return null;}
  get recordQuizResult(){return ()=>this.getCurrentUser();}
  get recordGameResult(){return ()=>this.getCurrentUser();}
}
