var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var log_schema = new Schema({
    userKey: String,
    data: Array
});

var Log = mongoose.model('Log', log_schema);

module.exports = Log;