/**
 * St Thomas Shore Excursions — Workers Assets entry.
 * Permanent .html → extensionless redirects; all other requests to static assets.
 */
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname.endsWith('.html')) {
      let path = url.pathname.slice(0, -5);
      if (path.endsWith('/index')) path = path.slice(0, -6);
      if (path === '' || path === '/index') path = '/';
      const dest = new URL(path + url.search, url.origin);
      return Response.redirect(dest.toString(), 308);
    }

    return env.ASSETS.fetch(request);
  },
};
