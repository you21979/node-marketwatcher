var EtwingsManager = require('./etwings_manager');
var AllcoinManager = require('./allcoin_manager');
var MonatrManager = require('./monatr_manager');
var YahooManager = require('./yahoo_manager');
var Promise = require('bluebird');

Promise.all([
    EtwingsManager.initialize(),
    MonatrManager.initialize(),
    AllcoinManager.initialize(),
    YahooManager.initialize(),
])
.then(function(){
    EtwingsManager.taskstart();
    MonatrManager.taskstart();
    AllcoinManager.taskstart();
    YahooManager.taskstart();
});

