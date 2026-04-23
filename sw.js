// sw.js
self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(clients.claim());
});

let currentUserId = null;

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SET_USER_ID') {
    currentUserId = event.data.userId;
  }
});

self.addEventListener('push', event => {
  if (event.data) {
    const data = event.data.json();
    event.waitUntil(
      self.registration.showNotification('💜 კაიფმანია', {
        body: data.body,
        icon: '/icon-192.png',
        tag: data.tag,
        renotify: true
      })
    );
  }
});
