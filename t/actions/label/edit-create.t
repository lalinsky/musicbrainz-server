use strict;
use Test::More;

use Catalyst::Test 'MusicBrainz::Server';
use MusicBrainz::Server::Test qw( xml_ok );
use Test::WWW::Mechanize::Catalyst;

my ($res, $c) = ctx_request('/');
my $mech = Test::WWW::Mechanize::Catalyst->new(catalyst_app => 'MusicBrainz::Server');

$mech->get_ok('/login');
$mech->submit_form( with_fields => { username => 'new_editor', password => 'password' } );

$mech->get_ok('/label/create');
xml_ok($mech->content);
my $response = $mech->submit_form(
    with_fields => {
        'edit-label.name' => 'controller label',
        'edit-label.sort_name' => 'label, controller',
        'edit-label.type_id' => 2,
        'edit-label.label_code' => 12345,
        'edit-label.country_id' => 1,
        'edit-label.begin_date.year' => 1990,
        'edit-label.begin_date.month' => 01,
        'edit-label.begin_date.day' => 02,
        'edit-label.end_date.year' => 2003,
        'edit-label.end_date.month' => 4,
        'edit-label.end_date.day' => 15,
        'edit-label.comment' => 'label created in controller_label.t',
    }
);
ok($mech->success);
ok($mech->uri =~ qr{/label/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})}, 'should redirect to label page via gid');

my $edit = MusicBrainz::Server::Test->get_latest_edit($c);
isa_ok($edit, 'MusicBrainz::Server::Edit::Label::Create');
is_deeply($edit->data, {
        name => 'controller label',
        sort_name => 'label, controller',
        type_id => 2,
        country_id => 1,
        label_code => 12345,
        comment => 'label created in controller_label.t',
        begin_date => {
            year => 1990,
            month => 01,
            day => 02
        },
        end_date => {
            year => 2003,
            month => 4,
            day => 15
        },
    });

$mech->get_ok('/edit/' . $edit->id, 'Fetch the edit page');
xml_ok($mech->content, '..valid xml');
$mech->content_contains('controller label', '..has name');
$mech->content_contains('label, controller', '..has sort name');
$mech->content_contains('label created in controller_label.t', '..has comment');
$mech->content_like(qr/1990\D+01\D+02/, '..has begin date');
$mech->content_like(qr/2003\D+04\D+15/, '..has end date');
$mech->content_contains('Special MusicBrainz Label', '..has type name');
$mech->content_contains('United Kingdom', '..has country');
$mech->content_contains('12345', '..has label code');

done_testing;