drop table if EXISTS sites;
create table if NOT EXISTS sites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    check_url TEXT NOT NULL,
    displayname TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

drop table if EXISTS check_history;
create table if NOT EXISTS check_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    site_id INTEGER NOT NULL,
    status_code INTEGER NOT NULL,
    response_time_ms INTEGER NOT NULL,
    checked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE CASCADE
);