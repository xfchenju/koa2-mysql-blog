const router = require('koa-router')();
const { query } = require('../lib/mysql.js');
const md5 = require('md5');
const { checkNotLogin, checkLogin } = require('../middlewares/check.js');
const moment = require('moment');
const fs = require('fs');

// 注册页面
router.get('/signup', async(ctx, next) => {
    await checkNotLogin(ctx);
    await ctx.render('signup', {
        session: ctx.session
    })
})

// 注册
router.post('/signup', async(ctx, next) => {
    let { name, password, repeatpass, avator } = ctx.request.body

    await query(`SELECT * FROM users WHERE name = '${name}'`).then(async(res)=>{
        console.log(res, 'res');
        if(res.length >= 1) {
            // 用户存在
            ctx.body = {
                code: 500,
                message: '用户存在'
            };
        }else if(avator && avator.trim() === '') {
            ctx.body = {
                code: 500,
                message: '请上传头像'
            };
        }else {
            let base64Data = avator.replace(/^data:image\/\w+;base64,/, ""),
                dataBuffer = new Buffer(base64Data, 'base64'),
                getName = Number(Math.random().toString().substr(3)).toString(36) + Date.now(),
                upload = await new Promise((reslove, reject)=>{
                    fs.writeFile(`./public/images/${getName}.png`, dataBuffer, err => {
                        if(err) {
                            throw err;
                            reject(err);
                        }
                        reslove(true);
                        console.log('头像上传成功')
                    })
                })
            if (upload) {
                let data = [name, md5(password), getName+'.png', moment().format('YYYY-MM-DD HH:mm:ss')];
                await query(`INSERT INTO users (name, pass, avator, moment) VALUES ('${data.join("','")}')`).then((res)=>{
                    if(res.insertId) {
                        console.log('注册成功', res)
                        //注册成功
                        ctx.body = {
                            code: 200,
                            message: '注册成功'
                        };
                    }
                })
            }else {
                console.log('头像上传失败')
                ctx.body = {
                    code: 500,
                    message: '头像上传失败'
                }
            }
        }
    })
})

module.exports = router;