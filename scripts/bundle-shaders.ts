import * as fs from 'fs';
import * as path from 'path';

const srcDirectory = './src';

// Function to escape special characters
function escapeString(str: string): string {
  return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
}

// Function to generate JSON file for each vertex and fragment shader
function generateJSON(filePath: string) {
  const fileName = path.basename(filePath);
  const directory = path.dirname(filePath);
  const [name, extension] = fileName.split('.');

  if (extension !== 'vert' && extension !== 'frag') {
    return;
  }

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error(`Error reading file ${filePath}: ${err}`);
      return;
    }

    const content = escapeString(data);
    const jsonContent = `"${content}"`;

    const outputDirectory = path.join('src/generated', directory);
    fs.mkdirSync(outputDirectory, { recursive: true });

    const outputFile = path.join(outputDirectory, `${name}.json`);
    fs.writeFileSync(outputFile, jsonContent, 'utf8');
  });
}

function searchDir(srcDirectory) {
  // Find vertex and fragment shader files
  fs.readdir(srcDirectory, (err, files) => {
    if (err) {
      console.error(`Error reading directory ${srcDirectory}: ${err}`);
      return;
    }

    files.forEach(file => {
      const filePath = path.join(srcDirectory, file);
      fs.stat(filePath, (err, stats) => {
        if (err) {
          console.error(`Error getting stats for file ${filePath}: ${err}`);
          return;
        }

        if (stats.isFile()) {
          generateJSON(filePath);
        } else {
          searchDir(filePath);
        }
      });
    });
  });
}

searchDir(srcDirectory);
