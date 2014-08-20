var State = require('ampersand-state');
var JIDMixin = require('ampersand-jid-datatype-mixin');


module.exports = State.extend(JIDMixin, {
    props: {
        jid: 'JID',
        name: 'string',
        node: 'string',
        ver: 'string',
        hash: 'string',
        features: ['array', true],
        identities: ['array', true],
        extensions: ['array', true],
        chatStatesReceived: 'boolean',
        chatStatesSent: 'boolean',
        passwordRequired: 'boolean',
        resolved: 'boolean'
    },

    derived: {
        isLeaf: {
            deps: ['identities'],
            fn: function () {
                return this.findCategoryType('hierarchy', 'leaf');
            }
        },
        isBranch: {
            deps: ['identities'],
            fn: function () {
                return this.findCategoryType('hierarchy', 'branch');
            }
        },
        isCommandList: {
            deps: ['identities'],
            fn: function () {
                return this.findCategoryType('automation', 'command-list');
            }
        },
        isCommand: {
            deps: ['identities'],
            fn: function () {
                return this.findCategoryType('automation', 'command-node');
            }
        },
        isMobile: {
            deps: ['identities'],
            fn: function () {
                return this.findCategoryType('client', 'phone') ||
                       this.findCategoryType('client', 'handheld');
            }
        },
        isMUC: {
            deps: ['identities'],
            fn: function () {
                return this.findCategoryType('conference', 'text');
            }
        },
        isPasswordProtected: {
            deps: ['features', 'passwordRequired'],
            fn: function () {
                if (this.passwordRequired) {
                    return true;
                }

                var featureYes = this.findFeature('muc_passwordprotected');
                if (featureYes) {
                    return true;
                }

                var featureNo = this.findFeature('muc_unsecured');
                if (featureNo) {
                    return false;
                }

                return undefined;
            }
        },
        supportsReceipts: {
            deps: ['features'],
            fn: function () {
                return this.findFeature('urn:xmpp:receipts');
            }
        },
        supportsChatStates: {
            deps: ['features', 'chatStatesSent', 'chatStatesReceived'],
            fn: function () {
                return this.chatStatesReceived || 
                       this.findFeature('http://jabber.org/protocol/chatstates') || 
                       !this.chatStatesSent;
            }
        },
        supportsRTT: {
            deps: ['features'],
            fn: function () {
                return this.findFeature('urn:xmpp:rtt:0');
            }
        },
        supportsJingle: {
            deps: ['features'],
            fn: function () {
                return this.findFeature('urn:xmpp:jingle:1');
            }
        },
        supportsJingleMedia: {
            deps: ['features', 'supportsJingle'],
            fn: function () {
                if (!this.supportsJingle) {
                    return false;
                }

                if (!this.findFeature('urn:xmpp:jingle:apps:rtp:1')) {
                    return false;
                }

                if (!this.findFeature('urn:xmpp:jingle:apps:rtp:audio')) {
                    return false;
                }

                if (!this.findFeature('urn:xmpp:jingle:apps:rtp:video')) {
                    return false;
                }

                return true;
            }
        },
        supportsJingleFileTransfer: {
            deps: ['features', 'supportsJingle'],
            fn: function () {
                if (!this.supportsJingle) {
                    return false;
                }

                if (!this.findFeature('urn:xmpp:jingle:apps:file-transfer:3')) {
                    return false;
                }

                return true;
            }
        },
        supportsMessageCorrection: {
            deps: ['features'],
            fn: function () {
                return this.findFeature('urn:xmpp:message-correct:0');
            }
        },
        supportsEntityTime: {
            deps: ['features'],
            fn: function () {
                return this.findFeature('urn:xmpp:time');
            }
        },
        supportsAttention: {
            deps: ['features'],
            fn: function () {
                return this.findFeature('urn:xmpp:attention:0');
            }
        },
        supportsHTML: {
            deps: ['features'],
            fn: function () {
                return this.findFeature('http://jabber.org/protocol/xhtml-im');
            }
        },
        roomInfo: {
            deps: ['extensions'],
            fn: function () {
                return this.findExtension('http://jabber.org/protocol/muc#roominfo');
            }
        },
        pubsubInfo: {
            deps: ['extensions'],
            fn: function () {
                return this.findExtension('http://jabber.org/protocol/pubsub#meta-data');
            }
        }
    },

    findCategoryType: function (category, type) {
        for (var i = 0, len = this.identities.length; i < len; i++) {
            var identity = this.identities[i];
            if (identity.category === category && identity.type === type) {
                return true;
            }
        }
        return false;
    },

    findFeature: function (feature) {
        return this.features.indexOf(feature) >= 0;
    },

    findExtension: function (ext) {
        var extensions = this.extensions || [];
        for (var i = 0, elen = extensions.length; i < elen; i++) {
            var fields = extensions[i].fields || [];
            for (var j = 0, flen = fields.length; j < flen; j++) {
                if (fields[j].name === 'FORM_TYPE' && fields[j].value === ext) {
                    return extensions[i];
                }
            }
        }
        return {};
    }
});
