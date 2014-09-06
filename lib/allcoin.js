var rp = require('request-promise');

var ALLCOIN_APIV2_URL = 'https://www.allcoin.com/api2';

var makeapi = function(api){
    return ALLCOIN_APIV2_URL + '/' + api;
}
var createEndPoint = function(api, pair){
    return api + '/' + pair.toUpperCase();
}

var query = exports.query = function(method, pair){
    return rp(createEndPoint(makeapi(method), pair)).then(JSON.parse).
        then(function(v){
            if(v.code !== 1) throw new Error(v.data);
            else return v.data;
        });
}

var pair = exports.pair = function(pair){
    return query('pair', pair);
}
var depth = exports.depth = function(pair){
    return query('depth', pair);
}
var trade = exports.trade = function(pair){
    return query('trade', pair);
}

