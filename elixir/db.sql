
create table auth (id text unique not null, password text not null);

create table backup (school_id text unique not null, db jsonb);

create table tokens (id text not null, token text not null, client_id text not null);