const api = {
  baseURL: 'http://localhost:8000/api',
  getHeaders: function () {
    const accessToken = localStorage.getItem('accessToken');
    return {
      'Content-Type': 'application/json',
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    };
  },
  post: async function (url: string, body: any = {}, stream: boolean = false) {
    return this._fetch(url, body, 'POST', true, stream);
  },
  get: async function (url: string) {
    return this._fetch(url, null, 'GET');
  },
  put: async function (url: string, data: any) {
    return this._fetch(url, data, 'PUT');
  },
  delete: async function (url: string) {
    return this._fetch(url, null, 'DELETE');
  },
  _fetch: async function (url: string, options: any, method: string, _retry: boolean = true, stream: boolean = false): Promise<any> {
    const fetchUrl = this.baseURL + url;
    const response = await fetch(fetchUrl, {
      method,
      headers: this.getHeaders(),
      body: options ? JSON.stringify(options) : undefined,
    });
    if (response.status === 401 && _retry) {

      const errorData = await response.json();
      if (errorData.code === 'token_not_valid') {
        console.info('Token not valid, refreshing token');
        const canRetry = await this._refreshToken();
        if (canRetry) {
          return this._fetch(url, options, method, false, stream);
        }
        this._clearTokensAndRedirect();
        throw new Error('Authentication failed');
      }
    }
    if (!response.ok) {
      const errorData = await response.json();
      throw errorData || new Error(`HTTP error! status: ${response.status}`);
    }
    if (stream) {
      return response.body;
    }
    // prevent errors on api.delete request, which contains no response data
    // as 204 responses doesn't have a body
    if (response.status == 204) {
      return;
    }
    return response.json();
  },
  _refreshToken: async function () {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return false;

    try {
      const refreshResponse = await this.post('/auth/login/refresh/', { refresh: refreshToken });
      localStorage.setItem('accessToken', refreshResponse.access);
      localStorage.setItem('refreshToken', refreshResponse.refresh);
      return true;
    } catch (error) {
      return false;
    }
  },
  _clearTokensAndRedirect: function () {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    window.location.href = '/login';
  },
};

export default api;