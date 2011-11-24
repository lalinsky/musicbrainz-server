BEGIN;

CREATE TRIGGER "reptg_acoustid_mb_replication_control"
AFTER INSERT OR DELETE OR UPDATE ON "acoustid_mb_replication_control"
FOR EACH ROW EXECUTE PROCEDURE "recordchange" ('verbose');

CREATE TRIGGER "reptg_recording_acoustid"
AFTER INSERT OR DELETE OR UPDATE ON "recording_acoustid"
FOR EACH ROW EXECUTE PROCEDURE "recordchange" ('verbose');

COMMIT;

