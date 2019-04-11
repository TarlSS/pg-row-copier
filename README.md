# pg-row-copier
Uses NodeJS+pg+pg-copy-stream to easily copy rows from one DB to another.

Usage

Create .env file with the credentials of your sender and receiver db

Modify tools.js/transfer(table, writeClient, readClient) to change what you want to transfer for each table.
Currently it copies the first 10 rows of the sender to the receiver.
