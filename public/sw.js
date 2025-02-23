const CACHE_NAME = 'mybus-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/favicon.ico',
  '/src/assets/logo.svg',
  '/src/assets/main.css'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached response if found
      if (response) {
        return response;
      }

      // Clone the request because it can only be used once
      const fetchRequest = event.request.clone();

      // Make network request and cache the response
      return fetch(fetchRequest).then((response) => {
        // Check if response is valid
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        // Clone the response because it can only be used once
        const responseToCache = response.clone();

        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return response;
      });
    })
  );
});

// Background sync for offline incident reports
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-incident-reports') {
    event.waitUntil(syncIncidentReports());
  }
});

// Function to sync incident reports when back online
async function syncIncidentReports() {
  try {
    const offlineReports = await getOfflineReports();
    for (const report of offlineReports) {
      await sendIncidentReport(report);
      await removeOfflineReport(report.id);
    }
  } catch (error) {
    console.error('Error syncing incident reports:', error);
  }
}

// Helper functions for offline storage
async function getOfflineReports() {
  const db = await openDB();
  return db.getAll('incidentReports');
}

async function removeOfflineReport(id) {
  const db = await openDB();
  return db.delete('incidentReports', id);
}

async function sendIncidentReport(report) {
  // Implement API call to send report to server
  return fetch('/api/incident-reports', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(report),
  });
}

// IndexedDB setup
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('MyBusDB', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('incidentReports')) {
        db.createObjectStore('incidentReports', { keyPath: 'id' });
      }
    };
  });
}