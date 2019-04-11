var copyTo = require('pg-copy-streams').to;
var copyFrom = require('pg-copy-streams').from;

function listTables(client) {
    return new Promise((resolve, reject) => {
        var q = "SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE';"
        client.query(q, function (err, result) {
            if (err) {
                reject(err)
            } else {
                resolve(result)
            }
        });
    })
}

//Transfers the first 10 rows only
function transfer(table, writeClient, readClient) {
    return new Promise((resolve, reject) => {
        var rejected = false;
        var readStream = readClient.query(copyTo(`COPY (SELECT * FROM ${table} limit 10) TO STDOUT`));
        var writeStream = writeClient.query(copyFrom(`COPY ${table} FROM STDIN`));
        console.log(`Streams for ${table} started`)
        readStream.on('error', (err) => {
            if (!rejected) {
                rejected = true;
                reject(err);
            }
        });
        writeStream.on('error', (err) => {
            if (!rejected) {
                rejected = true;
                reject(err);
            }
        });
        readStream.on('end', () => { console.log("Read Complete") });
        writeStream.on('end', () => {
            console.log(`${table} Transfer Complete`);
            resolve();
        });
        readStream.pipe(writeStream);
    })
}

function countRows(client, table) {
    return new Promise((resolve, reject) => {
        var q = `SELECT COUNT(*) FROM ${table};`
        client.query(q, function (err, result) {
            if (err) {
                reject(err)
            } else {
                if (result.rows.length > 0)
                    resolve(result.rows[0].count)
                else
                    resolve(0);
            }
        });
    })

}

module.exports = {
    transfer,
    listTables,
    countRows
}