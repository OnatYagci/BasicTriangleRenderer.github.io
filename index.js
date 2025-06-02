// Express.js file server for downloading files
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Define the directory where your downloadable files will be stored
const FILES_DIRECTORY = path.join(__dirname, 'files');

// Create the files directory if it doesn't exist
if (!fs.existsSync(FILES_DIRECTORY)) {
  fs.mkdirSync(FILES_DIRECTORY, { recursive: true });
}

// Serve static files from the 'files' directory
app.use(express.static(FILES_DIRECTORY));

// Route to handle file downloads
app.get('/:folder/:file', (req, res) => {
  const { folder, file } = req.params;
  const filePath = path.join(FILES_DIRECTORY, folder, file);

  // Check if file exists
  if (fs.existsSync(filePath)) {
    return res.download(filePath);
  } else {
    return res.status(404).send('File not found');
  }
});

// Root route to show available files
app.get('/', (req, res) => {
  let fileList = '<h1>Available Files</h1><ul>';

  try {
    const folders = fs.readdirSync(FILES_DIRECTORY);

    folders.forEach(folder => {
      const folderPath = path.join(FILES_DIRECTORY, folder);
      if (fs.statSync(folderPath).isDirectory()) {
        const files = fs.readdirSync(folderPath);
        files.forEach(file => {
          fileList += `<li><a href="/${folder}/${file}">${folder}/${file}</a></li>`;
        });
      }
    });
  } catch (err) {
    console.error('Error listing files:', err);
  }

  fileList += '</ul>';
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>File Download Server</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          ul {
            list-style-type: none;
            padding: 0;
          }
          li {
            margin: 10px 0;
          }
          a {
            color: #0077cc;
            text-decoration: none;
          }
          a:hover {
            text-decoration: underline;
          }
        </style>
      </head>
      <body>
        ${fileList}
      </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Place your files in the '${FILES_DIRECTORY}' directory for downloading`);
});
