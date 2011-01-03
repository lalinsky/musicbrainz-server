package MusicBrainz::Server::Form::ReleaseEditor::MissingEntities;
use HTML::FormHandler::Moose;

extends 'MusicBrainz::Server::Form::Step';
has_field 'missing' => ( type => 'Compound' );

for my $type (qw( artists labels )) {
    has_field "missing.$type" => (
        type => 'Repeatable',
        num_when_empty => 0
    );

    has_field "missing.$type.name" => (
        type => 'Text',
        required => 1
    );

    has_field "missing.$type.sort_name" => (
        type => 'Text',
        required => 1
    );

    has_field "missing.$type.comment" => (
        type => 'Text',
        required => 1
    );

    has_field "missing.$type.for" => (
        type => 'Text',
        required => 1
    );
}

1;