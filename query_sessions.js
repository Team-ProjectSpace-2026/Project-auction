const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('C:\\Users\\USER\\.local\\share\\mimocode\\mimocode.db', sqlite3.OPEN_READONLY);
db.all("SELECT id, project_id, title, time_created FROM session WHERE project_id = 'f43c4e37-3e33-43bb-90bc-65f01309653d' ORDER BY time_created DESC LIMIT 20", (err, rows) => {
    if (err) { console.error(err); return; }
    rows.forEach(row => console.log(row));
    db.close();
});