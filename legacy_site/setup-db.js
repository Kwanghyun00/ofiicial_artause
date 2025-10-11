const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

const DBSOURCE = "database.db";

if (fs.existsSync(DBSOURCE)) {
    fs.unlinkSync(DBSOURCE);
    console.log('Old database file deleted.');
}

const db = new sqlite3.Database(DBSOURCE, (err) => {
    if (err) {
        console.error(err.message);
        throw err;
    }
    console.log('Connected to the SQLite database.');

    const createTableSql = `
        CREATE TABLE IF NOT EXISTS promotion_requests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            status TEXT NOT NULL DEFAULT 'pending',
            payment_status TEXT NOT NULL DEFAULT 'unpaid',
            organization_json TEXT NOT NULL,
            performance_json TEXT NOT NULL,
            marketing_json TEXT NOT NULL,
            assets_json TEXT NOT NULL,
            agreements_json TEXT NOT NULL,
            proposal_json TEXT,
            submitted_at TEXT NOT NULL DEFAULT (datetime('now')),
            updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
    `;

    db.exec(createTableSql, (execErr) => {
        if (execErr) {
            console.error('Error creating promotion_requests table:', execErr.message);
        } else {
            console.log('promotion_requests table created successfully.');
        }
        db.close(() => console.log('Database connection closed.'));
    });
});
