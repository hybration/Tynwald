// Tynwald service worker — handles incoming push notifications and what
// happens when someone taps one. Registered from script.js with scope
// covering the whole site (this file needs to live at the site root for
// that to work — don't move it into a subfolder).

self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (err) {
    data = { title: 'Tynwald', body: event.data ? event.data.text() : 'You have a new notification.' };
  }

  const title = data.title || 'Tynwald';
  const options = {
    body: data.body || '',
    icon: 'Images/favicon.png',
    badge: 'Images/favicon.png',
    data: { url: data.url || '/index.html' },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/index.html';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If a Tynwald tab is already open, focus and navigate it instead
      // of opening a duplicate tab.
      for (const client of clientList) {
        if ('focus' in client) {
          client.focus();
          if ('navigate' in client) client.navigate(targetUrl);
          return;
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});