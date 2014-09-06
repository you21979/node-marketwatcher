var etwings = require('etwings');
var Promise = require('bluebird');
var redis = require('then-redis');

var updateDepth = function(self, pair){
    var mapper = function(list){ return list.map(function(v){ return {price:v[0], quantity:v[1]} }) }
    return etwings.PublicApi.depth(pair).
        then(function(v){
            return {
                asks : mapper(v.asks),
                bids : mapper(v.bids),
            }
        }).then(function(v){
            var mapper = function(list){
                var total = {
                    amount : 0,
                    quantity : 0,
                };
                return list.map(function(v){
                    var amount = v.price * v.quantity;
                    total.amount += amount;
                    total.quantity += v.quantity;
                    return {
                        price : v.price,
                        quantity : v.quantity,
                        amount : amount,
                        totalamount : total.amount,
                        totalquantity : total.quantity,
                    };
                })
            }
            return {
                asks : mapper(v.asks),
                bids : mapper(v.bids),
            }
        }).then(function(v){
            return self.redis.set('etwings.depth.' + pair, JSON.stringify(v));
        })
}

var EtwingsManager = function(){
    this.redis = redis.createClient();
}
EtwingsManager.prototype.initialize = function(){
    var self = this;
    return Promise.all([])
}
EtwingsManager.prototype.heartbeat = function(){
    return Promise.all([
        updateDepth(this, 'mona_jpy'),
        updateDepth(this, 'btc_jpy')
    ]).delay(10000);
}
EtwingsManager.prototype.taskstart = function(){
    var self = this;
    var update = function(){
        self.heartbeat().then(function(){
            setTimeout(update, 0);
        });
    }
    update();
}

module.exports = new EtwingsManager();

