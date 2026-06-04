// HTTP Basic Auth gate for the Sand admin dashboard.
// Runs on Netlify's edge so the browser shows its native login dialog.
//
// Triggers on:
//   - the admin.* subdomain (any path) — primary entry
//   - /admin and /sand-admin* paths on any host (alias entries)
//   - /api/admin-conversations and /.netlify/functions/admin-conversations
//
// On the admin subdomain, requests to "/" are rewritten to /sand-admin.html
// so users who type admin.thailandboatfestival.com land directly on the dashboard.
//
// Credentials come from env vars set in Netlify dashboard:
//   ADMIN_USER     — required, default fallback "admin"
//   ADMIN_PASSWORD — required (no default; missing → 500)

export default async (req, ctx) => {
  const url  = new URL(req.url);
  const host = url.hostname.toLowerCase();
  const path = url.pathname;

  const isAdminHost = host.startsWith('admin.');
  const isAdminPath =
    path === '/admin' ||
    path.startsWith('/admin/') ||
    path === '/sand-admin' ||
    path.startsWith('/sand-admin') ||
    path === '/api/admin-conversations' ||
    path.startsWith('/.netlify/functions/admin-conversations');

  // Not an admin route — pass through to normal site routing
  if (!isAdminHost && !isAdminPath) return;

  const expectedUser = Deno.env.get('ADMIN_USER')     || 'admin';
  const expectedPass = Deno.env.get('ADMIN_PASSWORD') || '';

  if (!expectedPass) {
    return new Response(
      'Admin not configured: ADMIN_PASSWORD env var missing on the server.',
      { status: 500, headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
    );
  }

  const auth     = req.headers.get('authorization') || '';
  const expected = 'Basic ' + btoa(`${expectedUser}:${expectedPass}`);

  if (auth !== expected) {
    return new Response('Authentication required', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Sand Admin", charset="UTF-8"',
        'Content-Type'    : 'text/plain; charset=utf-8',
        'Cache-Control'   : 'no-store'
      }
    });
  }

  // Authorized. If hitting the admin subdomain at root → rewrite to dashboard.
  if (isAdminHost && (path === '/' || path === '')) {
    const dest = new URL(req.url);
    dest.pathname = '/sand-admin.html';
    return ctx.rewrite(dest.toString());
  }

  // Otherwise just continue down the normal routing chain.
  return;
};

export const config = { path: '/*' };
