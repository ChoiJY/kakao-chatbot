/**
 * database implement
 */

const mongoose = require('mongoose');
const Logs = require('./userSchema');
const uri = 'mongodb://root:0000@ds046267.mlab.com:46267/chatbot';
const userModel = mongoose.model('logs', Logs.schema);

/**
 * getLogs
 * mLab에서 userKey 이용한 user data query
 * TODO promise err 처리 필요
 * @param userKey
 */
exports.getLogs = function (userKey) {
    return new Promise(function (res) {
        mongoose.connect(uri);
        userModel.find({userKey: userKey}, function (err, docs) {
            if (docs.length > 0) res(docs[0].data);
            else res("not exist");
        });
    });
};

exports.update = function (userKey, newData) {
    return new Promise(function (res) {
        mongoose.connect(uri);
        userModel.findOneAndUpdate(
            {userKey: userKey},
            {$push: {"data": newData}},
            function (err, docs) {
                if (err) console.log(err);
                else {
                    if (docs != null) res(docs[0]);
                }
            });
    });
};

exports.save = function (user_key, newData) {
    mongoose.connect(uri);
    var newUser = new userModel({userKey: user_key, data: newData});
    newUser.save(function (err, data) {
        if (err) console.log("save failed");
        else console.log(data + " save success")
    })
};

exports.delete = function (userKey) {
    return new Promise(function (res) {
        mongoose.connect(uri);
        userModel.findOneAndRemove({userKey: userKey}, function (err, docs) {
            if (err) console.log(err);
            else res(docs);
        })
    })
};