const { OAuth2 } = require('oauth');
const { OAUTH2_IDENTITY_URL } = require('./constants');
// PUBLIC_API_BASE_URL

class Client {
  /**
   * @param {string} options.clientId
   * @param {string} options.clientSecret
   * @param {string[]} options.scopes
   * @param {string} options.redirectUrl
   * @param {string} options.state
   * @param {string} [options.publicApiUrl]
   * @param {string} [options.oauth2BaseUrl]
   */
  constructor({
    clientId,
    clientSecret,
    scopes,
    redirectUrl,
    state,
    // publicApiUrl = PUBLIC_API_BASE_URL,
    oauth2BaseUrl = OAUTH2_IDENTITY_URL,
  }) {
    this.state = state;
    this.redirectUrl = redirectUrl;
    this.scopes = scopes;

    this.oauth2 = new OAuth2(
      clientId,
      clientSecret,
      oauth2BaseUrl,
      '/api/v1.1/oauth/auth',
      '/api/v1.1/oauth/token',
    );
  }

  getAuthUrl() {
    return this.oauth2.getAuthorizeUrl({
      redirect_url: this.redirectUrl,
      scope: this.scopes,
      state: this.state,
      response_type: 'code',
    });
  }

  /**
   * @param {string} path
   * @returns {Promise<void>}
   */
  request() {
    // const normalizedPath = path.replace(/^\//, '');
    // eslint - disable - next - line;
    // const requestPath = `${this.publicApiUrl}/${normalizedPath}`;
  }

  /**
   * @param {string} code Authorization code
   * @returns {Promise}
   */
  exchange(code) {
    return new Promise((resolve, reject) => {
      this.oauth2.getOAuthAccessToken(
        code,
        {
          grant_type: 'authorization_code',
        },
        (err, accessToken, refreshToken, results) => {
          if (err) return reject(err);

          return resolve({
            accessToken,
            refreshToken,
            results,
          });
        },
      );
    });
  }

  // isValidState(state) {
  //   return state === this.state;
  // }
}

module.exports = Client;
