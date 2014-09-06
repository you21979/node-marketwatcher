var monatr = require('./lib/monatr');
var redis = require('then-redis');
var Promise = require('bluebird');

var updateDepth = function(self, pair){
    return monatr.depth(pair).then(function(v){
        var mapper = function(key){
            return v[key].map(function(v){
                return {
                    price : v.price,
                    quantity : v.amount,
                }
            });
        }
        return {
            bids: mapper('buy'),
            asks: mapper('sell'),
        };
    }).then(function(v){
        var mapper = function(key){
            var total = {
                amount : 0,
                quantity : 0,
            };
            return v[key].map(function(d){
                var amount = d.price * d.quantity;
                total.amount += amount;
                total.quantity += d.quantity;
                return {
                    price : d.price,
                    quantity : d.quantity,
                    amount : amount,
                    totalamount : total.amount,
                    totalquantity : total.quantity,
                }
            })
        }
        return {
            asks:mapper('asks'),
            bids:mapper('bids'),
        }
    }).then(function(v){
        return self.redis.set('monatr.depth.' + pair, JSON.stringify(v));
    })
}

var MonatrManager = function(){
    this.redis = redis.createClient();
}
MonatrManager.prototype.initialize = function(){
    var self = this;
    return Promise.all([]);
}
MonatrManager.prototype.heartbeat = function(){
    return Promise.all([
        updateDepth(this, 'mona_btc'),
        updateDepth(this, 'btc_mona')
    ]).delay(10000);
}
MonatrManager.prototype.taskstart = function(){
    var self = this;
    var update = function(){
        self.heartbeat().then(function(){
            setTimeout(update, 0);
        });
    }
    update();
}

module.exports = new MonatrManager();

