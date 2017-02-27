var mongoose = require('mongoose');
var config = require('../config');
var ObjectId = mongoose.Schema.Types.ObjectId;
mongoose.connect(config.dbUrl);
exports.User = mongoose.model('user', new mongoose.Schema({
    username: String,
    password: String,
    email: String,
    avatar: String
}));
exports.Article = mongoose.model('article', new mongoose.Schema({
    //是一个对象ID类型，引用用户模型
    user: {type: ObjectId, ref: 'user'},
    title: String,
    content: String,
    pv: {type: Number, default: 0},
    poster: String,//增加一张图片
    comments: [{
        user: {type: ObjectId, ref: 'user'},
        content: String,
        createAt: {
            type: Date,
            default: Date.now
        }
    }],
    createAt: {type: Date, default: Date.now}
}));