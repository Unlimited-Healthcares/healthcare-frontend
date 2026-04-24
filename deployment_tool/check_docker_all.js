
const { Client } = require('ssh2');
const conn = new Client();

const config = {
    host: '217.21.78.192',
    port: 22,
    username: 'root',
    password: 'Hostinga@404',
    readyTimeout: 60000
};

conn.on('ready', () => {
    conn.exec('docker ps -a', (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
            conn.end();
        }).on('data', (data) => {
            process.stdout.write(data);
        }).stderr.on('data', (data) => {
            process.stderr.write(data);
        });
    });
}).on('error', (err) => {
    console.error('Connection error:', err);
}).connect(config);
