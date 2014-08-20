var test = require('tape');
var Disco = require('../');


test('Test MUC identity', function (t) {
    var info = new Disco({
        identities: [
            {
                category: 'conference',
                type: 'text'
            }
        ]
    });

    t.ok(info.isMUC, 'isMUC works');
    t.end();
});

test('Test MUC password protected', function (t) {
    var info = new Disco({
        features: [
            'muc_passwordprotected'
        ]
    });

    t.ok(info.isPasswordProtected, 'feature check works');

    var info2 = new Disco({
        passwordRequired: true
    });

    t.ok(info2.isPasswordProtected, 'explicit check works');

    var nullTest = new Disco();

    t.notOk(nullTest.isPasswordProtected, 'null test passes');

    t.end();
});

test('Test Jingle Support', function (t) {
    var info = new Disco({
        features: [
            'urn:xmpp:jingle:1',
            'urn:xmpp:jingle:apps:rtp:1',
            'urn:xmpp:jingle:apps:rtp:audio',
            'urn:xmpp:jingle:apps:rtp:video',
            'urn:xmpp:jingle:apps:file-transfer:3'
        ]
    });
    var nullTest = new Disco();

    t.ok(info.supportsJingle, 'Jingle supported');
    t.ok(info.supportsJingleMedia, 'Jingle audio/video supported');
    t.ok(info.supportsJingleFileTransfer, 'Jingle file transfer supported');

    t.notOk(nullTest.supportsJingle ||
            nullTest.supportsJingleMedia ||
            nullTest.supportsJingleFileTransfer,
            'null test passes');
    t.end();
});

test('Test chat state support', function (t) {
    var info = new Disco();

    t.ok(info.supportsChatStates, 'Assume support absent any info');

    info.chatStatesSent = true;

    t.notOk(info.supportsChatStates, 'Don\'t assume support after sending a chat state');

    info.chatStatesReceived = true;

    t.ok(info.supportsChatStates, 'Support determined via explicit use');

    var info2 = new Disco({
        features: [
            'http://jabber.org/protocol/chatstates'
        ]
    });

    t.ok(info2.supportsChatStates, 'Support declared in features');

    t.end();
});
