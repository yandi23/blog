var express = require('express');
var models = require('../models');
var markdown = require('markdown').markdown;
var auth = require('../middleware/auth');
var multer = require('multer');
//通过multer.diskStorage指定存储目录和文件名
var storage = multer.diskStorage({
    //目标路径
    destination: function (req, res, cb) {
        cb(null, '../public/uploads')
    },
    //文件名
    filename: function (req, file, cb) {
        //fieldname originalname mimetype
        console.log(file);
        cb(null, Date.now() + '.' + (file.mimetype.slice(file.mimetype.indexOf('/') + 1)));
    }
});
var upload = multer({storage: storage});
//路由的实例
var router = express.Router();

//注册
router.get('/add', auth.checkLogin, function (req, res, next) {
    res.render('article/add', {article: {}});
});

router.post('/add', auth.checkLogin, upload.single('poster'), function (req, res, next) {
    //console.log(req.file);
    var article = req.body;
    var _id = article._id;
    if (_id) {
        var updateObj = {
            title: article.title,
            content: article.content
        };
        if (req.file) {
            updateObj.poster = '/uploads/' + req.file.filename;
        }
        models.Article.update({_id: _id}, {$set: updateObj}, function (err, result) {
            if (err) {
                req.flash('error', '文章更新失败');
            } else {
                //req表请求，客户端提交过来的，我们要读里面的内容
                req.flash('success', '文章更新成功');
                //res表相应，写，会发送到客户端的，控制客户端的行为的
                res.redirect('/');
            }
        });
    } else {
        //public/uploads/文件名
        if (req.file) {
            article.poster = '/uploads/' + req.file.filename;
        }

        //把当前登录的用户的ID赋值给user
        article.user = req.session.user._id;
        models.Article.create(article, function (err, doc) {
            if (err) {
                req.flash('error', '文章发表失败');
            } else {
                //req表请求，客户端提交过来的，我们要读里面的内容
                req.flash('success', '文章发表成功');
                //res表相应，写，会发送到客户端的，控制客户端的行为的
                res.redirect('/');
            }
        });
    }
});

router.get('/detail/:_id', function (req, res) {
    var _id = req.params._id;
    models.Article.update({_id: _id}, {$inc: {pv: 1}}, function (err, result) {
        models.Article.findById(_id).populate('user').populate('comments.user').exec(function (err, article) {
            article.content = markdown.toHTML(article.content);
            res.render('article/detail', {article: article});
        });
    });

});
router.get('/delete/:_id', function (req, res) {
    var _id = req.params._id;
    models.Article.remove({_id: _id}, function (err, result) {
        res.redirect('/');
    })
});
router.get('/edit/:_id', function (req, res) {
    var _id = req.params._id;
    models.Article.findById(_id, function (err, article) {
        res.render('article/add', {article: article});
    });
});
router.post('/comment', auth.checkLogin, function (req, res) {
    var user = req.session.user;
    models.Article.update({_id: req.body._id}, {
        $push: {
            comments: {
                user: user._id,
                content: req.body.content
            }
        }
    }, function (err, result) {
        if (err) {
            req.flash('error', err);
            return res.redirect('back');
        }
        req.flash('success', '评论成功');
        return res.redirect('back');
    });
});
module.exports = router;