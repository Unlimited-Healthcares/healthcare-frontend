import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const distPath = path.resolve('dist');
const zipPath = path.resolve('dist.zip');
const nestedZipPath = path.join(distPath, 'dist.zip');

// Clean up existing zips
if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);
if (fs.existsSync(nestedZipPath)) fs.unlinkSync(nestedZipPath);

console.log('📦 Creating dist.zip...');

try {
  // Use powershell on windows or zip on unix
  if (process.platform === 'win32') {
    execSync(`powershell -Command "Compress-Archive -Path '${distPath}\\*' -DestinationPath '${zipPath}' -Force"`);
  } else {
    execSync(`cd dist && zip -r ../dist.zip . -x "*.zip"`);
  }
  
  // Copy to dist/dist.zip for some deployment workflows
  fs.copyFileSync(zipPath, nestedZipPath);
  console.log('✅ Build artifacts zipped successfully!');
} catch (error) {
  console.error('❌ Failed to create zip archive:', error.message);
  process.exit(1);
}
