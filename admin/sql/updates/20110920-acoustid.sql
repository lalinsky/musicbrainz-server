CREATE TABLE recording_acoustid
(
    id                  INTEGER NOT NULL, -- PK
    acoustid            UUID NOT NULL,
    recording           INTEGER NOT NULL,
    disabled            BOOLEAN NOT NULL DEFAULT false,
    created             TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE recording_acoustid ADD CONSTRAINT recording_acoustid_pkey PRIMARY KEY (id);

CREATE UNIQUE INDEX recording_acoustid_idx_uniq ON recording_acoustid (recording, acoustid);
CREATE INDEX recording_acoustid_idx_acoustid ON recording_acoustid (acoustid);

-- CREATE TRIGGER "reptg_recording_acoustid"
-- AFTER INSERT OR DELETE OR UPDATE ON "recording_acoustid"
-- FOR EACH ROW EXECUTE PROCEDURE "recordchange" ('verbose');

