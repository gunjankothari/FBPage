/*
Github Reference :
https://gist.github.com/fatihacet/1290216
*/

'use strict';
(function(App) {
    
    var events = function(){
        this.topics = {}, 
        this.subUid = -1;
    }
    events.prototype.listenTo = function(topic, func) {
        if (!this.topics[topic]) {
            this.topics[topic] = [];
        }
        var token = (++this.subUid).toString();
        this.topics[topic].push({
            token: token,
            func: func
        });
        return token;
    };

    events.prototype.on = function( topic, context, args) {
        if (!context.topics || !context.topics[topic]) {
            return false;
        }
        //setTimeout(function() {
            var subscribers = context.topics[topic],
                len = subscribers ? subscribers.length : 0;

            while (len--) {
                subscribers[len].func(context, args);
            }
       // }, 0);
        return true;

    };

    events.prototype.dontListen = function(token) {
        for (var m in this.topics) {
            if (this.topics[m]) {
                for (var i = 0, j = this.topics[m].length; i < j; i++) {
                    if (this.topics[m][i].token === token) {
                        this.topics[m].splice(i, 1);
                        return token;
                    }
                }
            }
        }
        return false;
    };

    App.listenerEvents = events;
}(app));