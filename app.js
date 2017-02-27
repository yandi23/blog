var express = require('express');
//处理路径的 path.join path.resolve
var path = require('path');
//处理收藏夹图标的
var favicon = require('serve-favicon');
//写日志的
var logger = require('morgan');
//解析cookie req.cookie属性存放着客户端提交过来的cookie
//res.cookie(key,value)想客户端写入cookie
var cookieParser = require('cookie-parser');
//处理请求体的 req.body 属性 存放着请求体是个对象
var bodyParser = require('body-parser');

//主页路由
var routes = require('./routes/index');
//用户路由
var users = require('./routes/users');
//文章路由
var articles = require('./routes/articles');
//引入session中间件
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);

var flash = require('connect-flash');

//得到app
var app = express();

var config = require('./config');

// views设置模版的存放路径
app.set('views', path.join(__dirname, 'views'));
//设置模版引擎
app.set('view engine', 'html');
//指定HTML模版的渲染方法
app.engine('html', require('ejs').__express);

// uncomment after placing your favicon in /public
//在把favicon图标放置在public目录之后取消注释
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
//日志记录中间件 ：method :url :response-time ms -:res[content-length]
app.use(logger('dev'));
//处理content-type=json的请求体 {"name":"zf"}
app.use(bodyParser.json());
//处理content-type=urlencoded的请求体 extended为true表示使用querystring来将请求体的字符串转成对象 name=zf&age=7
app.use(bodyParser.urlencoded({extended: false}));

//req.cookie res.cookie(key,value)
app.use(cookieParser());
app.use(session({
    secret: 'yd',
    resave: true,//每次响应结束后都保存一下session数据
    saveUninitialized: true,//保存新创建但为初始化的session
    store: new MongoStore({
        url: config.dbUrl
    })
}));

//flash依赖session，所以要放在session后面
app.use(flash());

app.use(function (req, res, next) {
    //res.locals 才是真正的渲染模版的对象
    res.locals.user = req.session.user;
    res.locals.success = req.flash('success').toString();
    res.locals.error = req.flash('error').toString();
    res.locals.keyword = req.session.keyword;
    next();
});

//静态文件服务中间件 指定一个绝对目录的路径作为静态文件的根目录
app.use(express.static(path.join(__dirname, 'public')));

//指定路由
app.use('/', routes);
app.use('/users', users);
app.use('/articles', articles);

// catch 404 and forward to error handler
//捕获404错误并转发到错误处理中间件
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

//错误处理中间件：四个参数，第一个参数是错误对象
//如果有中间件出错了，会把请求转交给错误处理中间件来处理
app.use(function (err, req, res, next) {
    // set locals, only providing error in development 开发时的错误处理
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};//隐藏错误对象

    // render the error page
    //设置状态码 默认500
    res.status(err.status || 500);
    //渲染模版
    res.render('error');
});

module.exports = app;
