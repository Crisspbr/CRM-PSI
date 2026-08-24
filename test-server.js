const { spawn } = require('child_process');
const http = require('http');

let serverProcess = null;

// Function to check if the server is ready
function isServerReady() {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:3000', (res) => {
      // We don't care about the response, just that we can connect
      resolve(true);
    }).on('error', () => {
      resolve(false);
    });
    req.setTimeout(1000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

// Function to make a request to the API
function fetchApi() {
  return new Promise((resolve, reject) => {
    http.get('http://localhost:3000/api/dashboard', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed);
        } catch (e) {
          resolve({ raw: data });
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// Start the Next.js dev server
function startServer() {
  return new Promise((resolve, reject) => {
    serverProcess = spawn('next', ['dev'], { stdio: ['ignore', 'pipe', 'pipe'] });

    serverProcess.stdout.on('data', (data) => {
      process.stdout.write(`[SERVER STDOUT]: ${data}`);
    });

    serverProcess.stderr.on('data', (data) => {
      process.stderr.write(`[SERVER STDERR]: ${data}`);
    });

    serverProcess.on('close', (code) => {
      console.log(`Server process exited with code ${code}`);
      resolve(code);
    });

    serverProcess.on('error', (err) => {
      reject(err);
    });
  });
}

// Main function
(async () => {
  try {
    console.log('Starting Next.js dev server...');
    await startServer();

    console.log('Waiting for server to be ready...');
    let ready = false;
    for (let i = 0; i < 30; i++) {
      ready = await isServerReady();
      if (ready) {
        console.log('Server is ready!');
        break;
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    if (!ready) {
      console.error('Server did not become ready in time.');
      process.exit(1);
    }

    console.log('Fetching /api/dashboard...');
    const result = await fetchApi();
    console.log('API Response:', JSON.stringify(result, null, 2));

  } catch (err) {
    console.error('Error:', err);
  } finally {
    if (serverProcess) {
      console.log('Killing server process...');
      serverProcess.kill();
    }
  }
})();