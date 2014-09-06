var allcoin = require('./lib/allcoin');
var redis = require('then-redis');
var Promise = require('bluebird');

var updateDepth = function(self, pair){
    return allcoin.depth(pair).then(function(v){
        var mapper = function(key){
            return Object.keys(v[key]).map(function(k){
                return {price:parseFloat(k), quantity:v[key][k]}
            })
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
        return self.redis.set('allcoin.depth.' + pair, JSON.stringify(v));
    })
}

var AllcoinManager = function(){
    this.redis = redis.createClient();
}
AllcoinManager.prototype.initialize = function(){
    var self = this;
    return Promise.all([]);
}
AllcoinManager.prototype.heartbeat = function(){
    return Promise.all([
        updateDepth(this, 'mona_btc')
    ]).delay(10000);
}
AllcoinManager.prototype.taskstart = function(){
    var self = this;
    var update = function(){
        self.heartbeat().then(function(){
            setTimeout(update, 0);
        });
    }
    update();
}

module.exports = new AllcoinManager();

