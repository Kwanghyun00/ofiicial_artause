const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 3000;
const DBSOURCE = 'database.db';

app.use(express.json({ limit: '15mb' }));
app.use(express.static(path.join(__dirname)));

const db = new sqlite3.Database(DBSOURCE, (err) => {
    if (err) {
        console.error('Failed to connect to SQLite database:', err.message);
        throw err;
    }
    console.log('Connected to the SQLite database.');
});

const mapRow = (row) => {
    const safeParse = (value) => {
        if (!value) return null;
        try {
            return JSON.parse(value);
        } catch (err) {
            console.warn('Failed to parse JSON column', err.message);
            return null;
        }
    };

    return {
        id: row.id,
        status: row.status,
        paymentStatus: row.payment_status,
        submittedAt: row.submitted_at,
        updatedAt: row.updated_at,
        organization: safeParse(row.organization_json),
        performance: safeParse(row.performance_json),
        marketing: safeParse(row.marketing_json),
        assets: safeParse(row.assets_json),
        agreements: safeParse(row.agreements_json),
        proposal: safeParse(row.proposal_json)
    };
};

app.get('/api/requests', (req, res) => {
    const sql = `SELECT * FROM promotion_requests ORDER BY submitted_at DESC`;
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ data: rows.map(mapRow) });
    });
});

app.get('/api/requests/:id', (req, res) => {
    const sql = `SELECT * FROM promotion_requests WHERE id = ?`;
    db.get(sql, [req.params.id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ error: 'Request not found' });
        }
        res.json({ data: mapRow(row) });
    });
});

app.post('/api/requests', (req, res) => {
    const { organization, performance, marketing, assets, agreements, status } = req.body || {};

    if (!organization || !performance || !marketing || !agreements) {
        return res.status(400).json({ error: '유효하지 않은 요청입니다. 필수 항목이 누락되었습니다.' });
    }

    const requiredFields = [
        organization.organizationName,
        organization.contactName,
        organization.contactEmail,
        organization.contactPhone,
        organization.billingType,
        performance.title,
        performance.genre,
        performance.dates,
        performance.venue,
        performance.synopsis,
        marketing.goal,
        Array.isArray(marketing.channels) && marketing.channels.length > 0,
        agreements.terms,
        agreements.privacy,
        agreements.refund,
        agreements.rightsConfirmed
    ];

    if (requiredFields.some(value => !value)) {
        return res.status(400).json({ error: '필수 입력 항목이 누락되었습니다.' });
    }

    const insertSql = `
        INSERT INTO promotion_requests (
            status,
            organization_json,
            performance_json,
            marketing_json,
            assets_json,
            agreements_json
        ) VALUES (?, ?, ?, ?, ?, ?);
    `;

    const insertParams = [
        status || 'pending',
        JSON.stringify(organization),
        JSON.stringify(performance),
        JSON.stringify(marketing),
        JSON.stringify(assets || {}),
        JSON.stringify(agreements)
    ];

    db.run(insertSql, insertParams, function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ message: 'success', data: { id: this.lastID } });
    });
});

app.patch('/api/requests/:id/status', (req, res) => {
    const { status, paymentStatus, proposal } = req.body || {};
    const updates = [];
    const params = [];

    if (status) {
        updates.push('status = ?');
        params.push(status);
    }
    if (paymentStatus) {
        updates.push('payment_status = ?');
        params.push(paymentStatus);
    }
    if (proposal) {
        updates.push('proposal_json = ?');
        params.push(JSON.stringify(proposal));
    }
    if (!updates.length) {
        return res.status(400).json({ error: '업데이트할 항목이 없습니다.' });
    }

    updates.push("updated_at = datetime('now')");
    params.push(req.params.id);

    const sql = `UPDATE promotion_requests SET ${updates.join(', ')} WHERE id = ?`;

    db.run(sql, params, function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Request not found' });
        }
        res.json({ message: 'success' });
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});


