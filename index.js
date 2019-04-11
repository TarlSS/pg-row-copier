/**
 * Copies the first ten rows from one Db to another
 * Used for making test/sandbox databases
 */

const { Pool } = require('pg')
const dotenv = require('dotenv');
const { transfer, listTables, countRows } = require('./tools');
dotenv.config();

const senderDb = new Pool({
    user: process.env.SENDER_USER,
    host: process.env.SENDER_HOST,
    database: process.env.SENDER_DB,
    password: process.env.SENDER_PW,
    port: 5432
})

const receiverDb = new Pool({
    user: process.env.RECEIVER_USER,
    host: process.env.RECEIVER_HOST,
    database: process.env.RECEIVER_DB,
    password: process.env.RECEIVER_PW,
    port: 5432
})

async function go() {
    try {
        const receiver = await receiverDb.connect();
        console.log("ReceiverDb connected");
        const sender = await senderDb.connect();
        console.log("SenderDb connected");
        const tables = await listTables(receiver);
        for (var i = 0; i < tables.rows.length; i++) {
            var tableName = tables.rows[i].table_name;
            await transferTable(sender, receiver, tableName)
        }
        receiver.release((err) => { console.log(err) });
        sender.release((err) => { console.log(err) });
        console.log("Done");
    } catch (e) {
        console.log(e);
    }
}

async function transferTable(sender, receiver, tableName) {
    try {
        var numRows = await countRows(receiver, tableName);
        if (numRows <= 0) {
            await transfer(tableName, receiver, sender);
            console.log(`performing transfer:${tableName}`)
        } else {
            console.log(`${tableName} has ${numRows}`)
        }
    } catch (e) {
        console.log(e)
    }
}

go();


