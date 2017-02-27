var express = require('express');
var models = require('../models');
var util = require('../util');
var auth = require('../middleware/auth');
//路由的实例
var router = express.Router();

//注册
router.get('/reg', auth.checkNotLogin, function (req, res, next) {
    res.render('user/reg.html', {title: '注册'});
});

router.post('/reg', auth.checkNotLogin, function (req, res, next) {
    //保存对象的两种方法：model.create  entity.save
    var user = req.body;
    if (user.password != user.repassword) {
        res.redirect('back');
    } else {
        req.body.password = util.md5(req.body.password);
        //增加一个用户头像
        req.body.avatar = 'https://secure.gravatar.com/avatar/' + util.md5(req.body.email) + '?s=48';
        models.User.create(user, function (err, doc) {
            if (err) {
                req.flash('error', '用户注册失败');
            } else {
                req.flash('success', '用户注册成功');
                // = req.session.success='用户注册成功';
                //console.log(doc);
                res.redirect('/users/login');// 302 Location
            }
        })
    }

});

//登录
router.get('/login', auth.checkNotLogin, function (req, res, next) {
    res.render('user/login.html', {title: '登录'});
});

router.post('/login', auth.checkNotLogin, function (req, res, next) {
    req.body.password = util.md5(req.body.password);
    models.User.findOne({username: req.body.username, password: req.body.password}, function (err, doc) {
        if (err) {
            req.flash('error', '用户登录失败');
            res.redirect('back');
        } else {
            if (doc) {//如果有值表示找到了对应的用户，表示登录成功
                //如果登录成功后，把查询到的user用户赋值给session的user属性
                req.session.user = doc;
                req.flash('success', '用户登录成功');
                res.redirect('/');
            } else {//找不到，登录失败
                req.flash('error', '用户登录失败');
                res.redirect('back');
            }
        }
    })
});


//退出
router.get('/logout', auth.checkLogin, function (req, res, next) {
    req.session.user = null;
    req.flash('success', '用户退出成功');
    res.redirect('/');
});

//只要写后半段就可以了，不同path的全部内容
router.get('/', function (req, res, next) {
    res.send('respond with a resource');
});

module.exports = router;