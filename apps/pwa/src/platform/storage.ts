export enum Key {
  SERVER_ADDRESS = 'server_address',

  TOKEN = 'token',
  TOKEN_EXPIRED_AT = 'token_expired_at',

  USER = 'user',

  LAST_SIGNIN_EMAIL = 'last_signin_email_v1',
}

export default {
  getItem(key: Key) {
    return window.localStorage.getItem(key);
  },
  setItem({ key, value }: { key: Key; value: string }) {
    return window.localStorage.setItem(key, value);
  },
  removeItem(key: Key) {
    return window.localStorage.removeItem(key);
  },
};