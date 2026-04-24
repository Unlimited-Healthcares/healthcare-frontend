
const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');

const conn = new Client();

const config = {
    host: '217.21.78.192',
    port: 22,
    username: 'root',
    password: 'Hostinga@404',
    readyTimeout: 60000 // 60 seconds
};

const localFilePath = '/home/user/Documents/healthcare-f/healthcare-frontend/dist.zip';
const remoteFilePath = '/var/www/healthcare-frontend/dist.zip';
const remoteDir = '/var/www/healthcare-frontend';

console.log('Connecting to server ' + config.host + '...');

conn.on('ready', () => {
    console.log('Client :: ready');

    console.log('Starting deployment process...');

    // Step 1: Create directory
    conn.exec(`mkdir -p ${remoteDir}`, (err, stream) => {
        if (err) {
            console.error('Exec error:', err);
            conn.end();
            return;
        }
        stream.on('close', (code, signal) => {
            console.log('Directory ensured. (code: ' + code + ')');

            // Step 2: Upload file via SFTP
            conn.sftp((err, sftp) => {
                if (err) {
                    console.error('SFTP error:', err);
                    conn.end();
                    return;
                }

                console.log('Uploading dist.zip...');

                // Add validation before upload
                if (!fs.existsSync(localFilePath)) {
                    console.error(`Error: Local file not found at ${localFilePath}`);
                    conn.end();
                    return;
                }

                const stats = fs.statSync(localFilePath);
                if (stats.size === 0) {
                    console.error(`Error: Local file ${localFilePath} is empty (0 bytes). Check your build process.`);
                    conn.end();
                    return;
                }

                console.log(`File size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);

                sftp.fastPut(localFilePath, remoteFilePath, (err) => {
                    if (err) {
                        console.error('Upload error:', err);
                        conn.end();
                        return;
                    }
                    console.log('File uploaded successfully.');


                    // Step 3: Unzip and Cleanup
                    console.log('Unzipping...');
                    conn.exec(`cd ${remoteDir} && unzip -o dist.zip && rm dist.zip`, (err, stream) => {
                        if (err) {
                            console.error('Unzip exec error:', err);
                            conn.end();
                            return;
                        }
                        stream.on('close', (code, signal) => {
                            console.log('Deployment finish. (code: ' + code + ')');
                            conn.end();
                        }).on('data', (data) => {
                            process.stdout.write(data);
                        }).stderr.on('data', (data) => {
                            process.stderr.write(data);
                        });
                    });
                });
            });
        }).on('data', (data) => {
            process.stdout.write(data);
        }).stderr.on('data', (data) => {
            process.stderr.write(data);
        });
    });
});

conn.on('error', (err) => {
    console.error('Connection error:', err);
});

conn.on('end', () => {
    console.log('Connection ended');
});

conn.connect(config);
