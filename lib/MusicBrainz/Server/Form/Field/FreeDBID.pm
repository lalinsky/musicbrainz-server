package MusicBrainz::Server::Form::Field::FreeDBID;
use HTML::FormHandler::Moose;

use MusicBrainz::Server::Translation qw( l );
use MusicBrainz::Server::Validation qw( is_freedb_id );

extends 'HTML::FormHandler::Field::Text';

apply([
    {
        check => sub { is_freedb_id(shift) },
        message => l('This is not a valid FreeDB ID')
    }
]);

1;
