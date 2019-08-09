class EndpassRequester {
  /**
   * @param {EndpassClient} options.client EndpassClient instance
   * @param {string} options.accessToken OAuth2 access token
   */
  constructor({ client, accessToken }) {
    this.accessToken = accessToken;
    this.client = client;
  }

  /**
   * Allows to makes many requests with one memoized access token
   * Makes request by given path with proxifying EndpassClient
   * @param {string} path Public API endpoint
   * @param {string} [origin] The Host. Optionally needs for working in
   *  some special environments, like localhost
   * @returns {Promise<object>}
   */
  request(path, origin = null) {
    return this.client.request.call(this.client, {
      accessToken: this.accessToken,
      origin,
      path,
    });
  }
}

module.exports = EndpassRequester;
