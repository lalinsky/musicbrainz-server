package MusicBrainz::Server::Edit::Relationship::Edit;
use Moose;

use Moose::Util::TypeConstraints qw( as subtype find_type_constraint );
use MusicBrainz::Server::Constants qw( $EDIT_RELATIONSHIP_EDIT );
use MusicBrainz::Server::Entity::Types;
use MusicBrainz::Server::Edit::Types qw( PartialDateHash Nullable );
use MusicBrainz::Server::Edit::Utils qw( date_closure );
use MooseX::Types::Moose qw( ArrayRef Int Str );
use MooseX::Types::Structured qw( Dict );

extends 'MusicBrainz::Server::Edit';

sub edit_type { $EDIT_RELATIONSHIP_EDIT }
sub edit_name { "Edit Relationship" }

sub _xml_arguments { ForceArray => ['attributes'] }

subtype 'LinkHash'
    => as Dict[
        link_type_id => Nullable[Int],
        attributes => Nullable[ArrayRef[Int]],
        begin_date => Nullable[PartialDateHash],
        end_date => Nullable[PartialDateHash],
    ];

has '+data' => (
    isa => Dict[
        relationship_id => Int,
        type0 => Str,
        type1 => Str,
        new => find_type_constraint('LinkHash'),
        old => find_type_constraint('LinkHash'),
    ]
);

has 'relationship' => (
    isa => 'Relationship',
    is => 'rw'
);

sub related_entities
{
    my ($self) = @_;

    my $result;
    if ($self->data->{type0} eq $self->data->{type1}) {
        $result = {
            $self->data->{type0} => [ $self->relationship->entity0_id,
                                      $self->relationship->entity1_id ]
        };
    }
    else {
        $result = {
            $self->data->{type0} => [ $self->relationship->entity0_id ],
            $self->data->{type1} => [ $self->relationship->entity1_id ]
        };
    }
    delete $result->{url} if exists $result->{url};
    return $result;
}

sub adjust_edit_pending
{
    my ($self, $adjust) = @_;

    $self->c->model('Relationship')->adjust_edit_pending(
        $self->data->{type0}, $self->data->{type1},
        $adjust, $self->data->{relationship_id});
}

sub _mapping
{
    return (
        begin_date => date_closure('begin_date'),
        end_date => date_closure('end_date'),
        attributes => sub {
            my $link = shift;
            return [ map { $_->id } $link->all_attributes ];
        },
        link_type_id => 'type_id',
    );
}

sub initialize
{
    my ($self, %opts) = @_;

    my $relationship = delete $opts{relationship};
    my $type0 = delete $opts{type0};
    my $type1 = delete $opts{type1};

    $self->relationship($relationship);
    $self->data({
        type0 => $type0,
        type1 => $type1,
        relationship_id => $relationship->id,
        old => $self->_change_hash($relationship->link, keys %opts),
        new => { %opts },
    });
}

sub accept
{
    my $self = shift;

    $self->c->model('Relationship')->update(
        $self->data->{type0}, $self->data->{type1},
        $self->data->{relationship_id},
        $self->data->{new});
}

__PACKAGE__->meta->make_immutable;

no Moose;
1;

=head1 COPYRIGHT

Copyright (C) 2009 Lukas Lalinsky

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