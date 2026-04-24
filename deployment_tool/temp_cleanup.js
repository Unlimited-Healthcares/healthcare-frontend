
const { Client } = require('ssh2');
const conn = new Client();

const config = {
    host: '217.21.78.192',
    port: 22,
    username: 'root',
    password: 'Hostinga@404'
};

conn.on('ready', () => {
    console.log('Cleaning up root folder...');
    conn.exec('rm -rf /var/www/healthcare-frontend/assets /var/www/healthcare-frontend/images /var/www/healthcare-frontend/videos /var/www/healthcare-frontend/index.html /var/www/healthcare-frontend/robots.txt /var/www/healthcare-frontend/favicon.ico /var/www/healthcare-frontend/dist.zip', (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
            console.log('Cleanup done (code: ' + code + ')');
            conn.end();
        }).on('data', (data) => {
            process.stdout.write(data);
        }).stderr.on('data', (data) => {
            process.stderr.write(data);
        });
    });
}).connect(config);
