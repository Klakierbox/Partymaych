const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;

// Supported MIME types for static assets
const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
    // Strip query parameters (e.g. ?v=2) from request URL
    const cleanUrl = req.url.split('?')[0];
    
    // Resolve file path based on clean URL request
    let filePath = path.join(__dirname, cleanUrl === '/' ? 'index.html' : cleanUrl);
    
    // Strict path traversal security protection
    if (!filePath.startsWith(__dirname)) {
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        return res.end('403 Forbidden');
    }

    const ext = path.extname(filePath);
    let contentType = MIME_TYPES[ext] || 'application/octet-stream';

    // Read and serve request static files
    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                // If a path is not found, fallback to index.html (supports client-side SPA routing)
                fs.readFile(path.join(__dirname, 'index.html'), (errHtml, contentHtml) => {
                    if (errHtml) {
                        res.writeHead(500, { 'Content-Type': 'text/plain' });
                        res.end('500 Internal Server Error');
                    } else {
                        res.writeHead(200, { 'Content-Type': 'text/html' });
                        res.end(contentHtml, 'utf-8');
                    }
                });
            } else {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end(`500 Internal Server Error: ${err.code}`);
            }
        } else {
            // Serve the found asset with correct headers
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log(`PartyMatch server running at http://localhost:${PORT}`);
});
