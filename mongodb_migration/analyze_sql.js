const fs = require('fs');
const path = require('path');

const SQL_FILE = path.join(__dirname, '..', 'shoe_store_dump.sql');
const content = fs.readFileSync(SQL_FILE, 'utf8');

const tables = content.split('-- Table structure for table');
tables.forEach(t => {
    const matchName = t.match(/`(\w+)`/);
    if (!matchName) return;
    const name = matchName[1];
    const hasInsert = t.toUpperCase().includes('INSERT INTO');
    console.log(`${name}: ${hasInsert ? '★ HAS DATA ★' : 'empty'}`);
});
