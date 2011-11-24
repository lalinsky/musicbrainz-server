package MusicBrainz::Server::Edit::Artist::EditArtistCredit;
use Moose;

use MooseX::Types::Moose qw( Int Str );
use MooseX::Types::Structured qw( Dict );

use aliased 'MusicBrainz::Server::Entity::Artist';
use Data::Compare;
use MusicBrainz::Server::Constants qw( $EDIT_ARTIST_EDITCREDIT );
use MusicBrainz::Server::Constants qw( :expire_action :quality );
use MusicBrainz::Server::Data::Utils qw(
    artist_credit_to_ref
);
use MusicBrainz::Server::Edit::Exceptions;
use MusicBrainz::Server::Edit::Types qw( ArtistCreditDefinition );
use MusicBrainz::Server::Edit::Utils qw(
    artist_credit_from_loaded_definition
    clean_submitted_artist_credits
    load_artist_credit_definitions
    verify_artist_credits
);
use MusicBrainz::Server::Translation qw( l );

extends 'MusicBrainz::Server::Edit';
with 'MusicBrainz::Server::Edit::Artist';

sub edit_name { l('Edit artist credit') }
sub edit_type { $EDIT_ARTIST_EDITCREDIT }

sub new_artist_ids {
    my $self = shift;
    return map {
        $_->{artist}{id}
    } @{ $self->data->{new}{artist_credit}{names} };
}

sub alter_edit_pending {
    my ($self) = @_;
    my %old = load_artist_credit_definitions($self->data->{old}{artist_credit});
    return {
        Artist => [ keys(%old) ]
    }
}

sub _build_related_entities {
    my ($self) = @_;
    my $related = { };

    my %new = load_artist_credit_definitions($self->data->{new}{artist_credit});
    my %old = load_artist_credit_definitions($self->data->{old}{artist_credit});
    push @{ $related->{artist} }, keys(%new), keys(%old);

    return $related;
};

has '+data' => (
    isa => Dict[
        old => Dict[
            artist_credit => ArtistCreditDefinition
        ],
        new => Dict[
            artist_credit => ArtistCreditDefinition
        ]
    ]
);

sub foreign_keys
{
    my $self = shift;
    my $relations = {};

    $relations->{Artist} = {
        map {
            load_artist_credit_definitions($self->data->{$_}{artist_credit})
        } qw( new old )
    };

    return $relations;
}

sub build_display_data
{
    my ($self, $loaded) = @_;

    my $data = {};
    $data->{artist_credit} = {
        new => artist_credit_from_loaded_definition($loaded, $self->data->{new}{artist_credit}),
        old => artist_credit_from_loaded_definition($loaded, $self->data->{old}{artist_credit})
    };

    return $data;
}

sub initialize {
    my ($self, %opts) = @_;
    my $old_ac = delete $opts{to_edit} or die 'Missing old artist credit object';

    my $data = {
        new => {
            artist_credit => clean_submitted_artist_credits($opts{artist_credit})
        },
        old => {
            artist_credit => clean_submitted_artist_credits(artist_credit_to_ref($old_ac))
        }
    };

    MusicBrainz::Server::Edit::Exceptions::NoChanges->throw
          if Compare($data->{new}{artist_credit},
                     $data->{old}{artist_credit});

    $self->data($data);
}

sub accept {
    my $self = shift;

    verify_artist_credits($self->c, $self->data->{artist_credit});

    $self->c->model('ArtistCredit')->replace(
        $self->data->{old}{artist_credit},
        $self->data->{new}{artist_credit}
    );
}

sub edit_conditions
{
    return {
        $QUALITY_LOW => {
            duration      => 4,
            votes         => 1,
            expire_action => $EXPIRE_ACCEPT,
            auto_edit     => 0,
        },
        $QUALITY_NORMAL => {
            duration      => 14,
            votes         => 3,
            expire_action => $EXPIRE_ACCEPT,
            auto_edit     => 0,
        },
        $QUALITY_HIGH => {
            duration      => 14,
            votes         => 4,
            expire_action => $EXPIRE_REJECT,
            auto_edit     => 0,
        },
    };
}

1;
