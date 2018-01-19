/**
 * database implement
 */

const mongoose = require('mongoose');
const Logs = require('./userSchema');
const uri = 'mongodb://root:0000@ds046267.mlab.com:46267/chatbot';
const userModel = mongoose.model('logs', Logs.schema);

exports.getLogs = function (userKey) {
    return new Promise(function (res) {
        mongoose.connect(uri);
        userModel.find({userKey: userKey}, function (err, docs) {
            if (docs.length > 0) res(docs[0].data);
            else res("기록이 없습니다.")
        });
    });
};

exports.save = function (userKey, newData) {
    return new Promise(function (res) {
        mongoose.connect(uri);
        userModel.findByIdAndUpdate(userKey,
            {$push: {"data": newData}},
            function (err, docs) {
                if (err) console.log(err);
                else {
                    res(docs[0]);
                }
            });
    });
};