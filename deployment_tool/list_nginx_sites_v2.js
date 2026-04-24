
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
    conn.exec('ls -1 /etc/nginx/sites-enabled/ ; ls -1 /etc/nginx/sites-available/', (err, stream) => {
        if (err) throw err;
        let output = '';
        stream.on('close', (code, signal) => {
            console.log('--- OUTPUT ---');
            console.log(output);
            console.log('--- END ---');
            conn.end();
        }).on('data', (data) => {
            output += data;
        }).stderr.on('data', (data) => {
            process.stderr.write(data);
        });
    });
}).on('error', (err) => {
    console.error('Connection error:', err);
}).connect(config);
