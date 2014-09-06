var Promise = require('bluebird');
var redis = require('then-redis');
var fx = require('yahoo-currency');

var reverseRate = function(rate){
    return 1/rate;
}
var calcRate = function(target, rates){
    var usdtarget = reverseRate(rates[target+'USD']);
    var f = function(r){return (r*10000|0)/10000}
    var keys = Object.keys(rates);
    var r = {};
    r['USD'+target] = f(usdtarget);
    keys.
        map(function(v){
            return v.split('USD')[0]
        }).
        filter(function(v){return v !== target}).
        forEach(function(v){
            r[v+target] = f(usdtarget * rates[v+'USD']);
        });
    return r;
}

var updateRate = function(self){
    return fx.rate(fx.getSupportPair('USD')).then(function(rates){
        var j = calcRate('JPY',rates);
        var e = calcRate('EUR',rates);
        Object.keys(j).forEach(function(k){rates[k]=j[k]});
        Object.keys(e).forEach(function(k){rates[k]=e[k]});
        return self.redis.set('forex', JSON.stringify(rates));
    })
}

var YahooManager = function(){
    this.redis = redis.createClient();
}
YahooManager.prototype.initialize = function(){
    return Promise.all([])
}
YahooManager.prototype.heartbeat = function(){
    return Promise.all([
        updateRate(this)
    ]).delay(30 * 1000);
}
YahooManager.prototype.taskstart = function(){
    var self = this;
    var update = function(){
        self.heartbeat().then(function(){
            setTimeout(update, 0);
        });
    }
    update();
}
module.exports = new YahooManager();
