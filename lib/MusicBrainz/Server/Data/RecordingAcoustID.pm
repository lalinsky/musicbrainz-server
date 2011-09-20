package MusicBrainz::Server::Data::RecordingAcoustID;
use Moose;

use List::MoreUtils qw( uniq );
use MusicBrainz::Server::Data::Utils qw(
    object_to_ids
    placeholders
    query_to_list
);

extends 'MusicBrainz::Server::Data::Entity';

sub _table
{
    return 'recording_acoustid';
}

sub _columns
{
    return 'id, acoustid, recording, disabled';
}

sub _column_mapping
{
    return {
        id            => 'id',
        acoustid      => 'acoustid',
        recording_id  => 'recording',
        disabled      => 'disabled',
    };
}

sub _entity_class
{
    return 'MusicBrainz::Server::Entity::RecordingAcoustID';
}

sub find_by_recording
{
    my $self = shift;

    my @ids = ref $_[0] ? @{$_[0]} : @_;
    return () unless @ids;

    my $query = "SELECT " . $self->_columns . "
                 FROM " . $self->_table . "
                 WHERE recording IN (" . placeholders(@ids) . ")
                 ORDER BY id";
    return query_to_list(
        $self->c->sql, sub { $self->_new_from_row(@_) },
        $query, @ids);
}

__PACKAGE__->meta->make_immutable;
no Moose;
1;

=head1 COPYRIGHT

Copyright (C) 2011 Lukas Lalinsky

This program is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation; either version 2 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program; if not, write to the Free Software
Foundation, Inc., 675 Mass Ave, Cambridge, MA 02139, USA.

=cut
