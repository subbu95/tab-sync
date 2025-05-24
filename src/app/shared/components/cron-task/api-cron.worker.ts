/// <reference lib="webworker" />
const INTERVAL = 5 * 60 * 1000; // 5 minutes 
setInterval(() => {
  postMessage('trigger-api'); // Send message to the main thread
}, INTERVAL);
