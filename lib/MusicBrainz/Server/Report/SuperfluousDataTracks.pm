package MusicBrainz::Server::Report::SuperfluousDataTracks;
use Moose;
use namespace::autoclean;

extends 'MusicBrainz::Server::Report';

sub gather_data {
    my ($self, $writer) = @_;

    $self->gather_data_from_query($writer, <<'EOSQL');
SELECT DISTINCT
  release.id, release.gid, release_name.name AS name,
  release.artist_credit AS artist_credit_id,
  musicbrainz_collate(release_name.name)
FROM release
JOIN release_name ON release_name.id = release.name
JOIN medium ON medium.release = release.id
LEFT JOIN medium_format ON medium.format = medium_format.id
JOIN tracklist ON medium.tracklist = tracklist.id
JOIN track ON tracklist.id = track.tracklist
JOIN track_name ON track_name.id = track.name
WHERE (medium_format.has_discids = TRUE OR medium_format.has_discids IS NULL)
AND track.position = tracklist.track_count
AND track_name.name ~* '([[:<:]](dat(a|en)|cccd|gegevens|video)[[:>:]]|\\u30C7\\u30FC\\u30BF)'
AND NOT EXISTS (
   SELECT TRUE FROM medium_cdtoc WHERE medium_cdtoc.medium = medium.id
   LIMIT 1
)
ORDER BY musicbrainz_collate(release_name.name)
EOSQL
}

sub template { 'report/superfluous_data_tracks.tt' }

sub post_load {
    my ($self, $items) = @_;
    for my $item (@$items) {
        $item->{release} = MusicBrainz::Server::Data::Release->_new_from_row($item)
    }

    $self->c->model('ArtistCredit')->load(map { $_->{release} } @$items);
}

1;
