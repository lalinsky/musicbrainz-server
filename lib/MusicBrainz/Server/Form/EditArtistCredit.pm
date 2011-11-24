package MusicBrainz::Server::Form::EditArtistCredit;
use HTML::FormHandler::Moose;

extends 'MusicBrainz::Server::Form';
with 'MusicBrainz::Server::Form::Role::Edit';

has '+name' => ( default => 'split-artist' );

has_field 'artist_credit' => (
    type => '+MusicBrainz::Server::Form::Field::ArtistCredit',
    required => 1,
    allow_unlinked => 0
);

sub edit_field_names { qw( artist_credit )}

1;
