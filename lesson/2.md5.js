var crypto = require('crypto');
/*
 * 1、不同的输入一定会产生不同的输出
 * 2、相同的输入一定会产生相同的输出
 * 3、从输出的摘要中不能推算出原始输入的值
 * */
var md5 = crypto.createHash('md5');

var result = md5.update('3').update('4').digest('hex');
console.log(result);