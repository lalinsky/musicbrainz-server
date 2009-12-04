use strict;
use Test::More;

use Catalyst::Test 'MusicBrainz::Server';
use MusicBrainz::Server::Test qw( xml_ok );
use Test::WWW::Mechanize::Catalyst;

my ($res, $c) = ctx_request('/');
my $mech = Test::WWW::Mechanize::Catalyst->new(catalyst_app => 'MusicBrainz::Server');

$mech->get_ok('/release-group/7c3218d7-75e0-4e8c-971f-f097b6c308c5/tags');
xml_ok($mech->content);
$mech->content_like(qr{This release group has no tags});

done_testing;