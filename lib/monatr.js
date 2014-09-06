var rp = require('request-promise');
var querystring = require('querystring');

var MONATR_APIV1_URL = 'https://api.monatr.jp';

var makeapi = function(api){
    return MONATR_APIV1_URL + '/' + api;
}
var createEndPoint = function(api, params){
    return api + '?' + querystring.stringify(params);
}

var query = exports.query = function(method, params){
    return rp(createEndPoint(makeapi(method), params)).then(JSON.parse)
}

var ticker = exports.ticker = function(pair){
    return query('ticker', {market:pair.toUpperCase()});
}
var tickerAll = exports.tickerAll = function(){
    return query('ticker', {market:'all'});
}
var depth = exports.depth = function(pair){
    return query('depth', {market:pair.toUpperCase()});
}
var trade = exports.trade = function(pair){
    return query('trade', pair);
}

