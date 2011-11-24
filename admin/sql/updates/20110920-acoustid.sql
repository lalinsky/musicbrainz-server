CREATE TABLE recording_acoustid
(
    id                  INTEGER NOT NULL, -- PK
    acoustid            UUID NOT NULL,
    recording           UUID NOT NULL,
    disabled            BOOLEAN NOT NULL DEFAULT false,
    created             TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated             TIMESTAMP WITH TIME ZONE
);

ALTER TABLE recording_acoustid ADD CONSTRAINT recording_acoustid_pkey PRIMARY KEY (id);

CREATE UNIQUE INDEX recording_acoustid_idx_uniq ON recording_acoustid (recording, acoustid);
CREATE INDEX recording_acoustid_idx_acoustid ON recording_acoustid (acoustid);

CREATE TABLE replication_control
(
    id                              INTEGER NOT NULL, -- PK
    current_schema_sequence         INTEGER NOT NULL,
    current_replication_sequence    INTEGER,
    last_replication_date           TIMESTAMP WITH TIME ZONE
);

ALTER TABLE acoustid_mb_replication_control ADD CONSTRAINT acoustid_mb_replication_control_pkey PRIMARY KEY (id);

-- CREATE TRIGGER "reptg_recording_acoustid"
-- AFTER INSERT OR DELETE OR UPDATE ON "recording_acoustid"
-- FOR EACH ROW EXECUTE PROCEDURE "recordchange" ('verbose');

