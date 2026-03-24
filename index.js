const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const LOG_PATH = path.join(__dirname, '..', 'ai-debugging-agent', 'backend', 'logs', 'app.log');

function writeLog(message) {
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] ${message}\n`;
  fs.appendFileSync(LOG_PATH, line);
  console.log(line.trim());
}

// BUG: getUserName() receives undefined user object — causes TypeError crash
function getUserName(user) {
  return user.profile.name; // TypeError: Cannot read properties of undefined (reading 'profile')
}

const server = http.createServer((req, res) => {
  if (req.url === '/user') {
    try {
      const user = undefined; // simulating missing user data from DB
      const name = getUserName(user);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ name }));
    } catch (err) {
      const errorMsg = `TypeError: ${err.message}\n    at getUserName (index.js:17:15)\n    at Server.<anonymous> (index.js:23:20)`;
      writeLog(`ERROR ${errorMsg}`);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
  } else {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Hello from test-repo! Visit /user to trigger the bug.\n');
  }
});

server.listen(PORT, () => {
  writeLog(`INFO Server started on http://localhost:${PORT}`);
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Visit http://localhost:${PORT}/user to trigger the bug`);
});
