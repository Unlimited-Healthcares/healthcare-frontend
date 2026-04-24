
const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');

const conn = new Client();

const config = {
    host: '217.21.78.192',
    port: 22,
    username: 'root',
    password: 'Hostinga@404'
};

const localFilePath = 'c:\\Users\\user\\Documents\\healthcare-f\\healthcare-frontend\\dist.zip';
const remoteFilePath = '/var/www/healthcare-frontend/dist/dist.zip';
const remoteDir = '/var/www/healthcare-frontend/dist';

console.log('Connecting to server...');

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
                sftp.fastPut(localFilePath, remoteFilePath, (err) => {
                    if (err) {
                        console.error('Upload error:', err);
                        conn.end();
                        return;
                    }
                    console.log('File uploaded.');

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
}).connect(config);

conn.on('error', (err) => {
    console.error('Connection error:', err);
});
