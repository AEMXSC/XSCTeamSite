// Rewrites Content-Type for .mov files to video/mp4 so Chrome on Windows plays H.264 content.
// The AEM EDS CDN serves .mov as video/quicktime which Chrome/Windows rejects.
self.addEventListener('fetch', (event) => {
  if (!/\.mov(\?.*)?$/i.test(event.request.url)) return;
  event.respondWith(
    fetch(event.request).then((response) => {
      if (!response.ok) return response;
      const headers = new Headers(response.headers);
      headers.set('Content-Type', 'video/mp4');
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    }),
  );
});
