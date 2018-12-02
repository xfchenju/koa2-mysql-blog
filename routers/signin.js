const router = require('koa-router')();
const { query, findDataByName, insertData } = require('../lib/mysql.js');
const md5 = require('md5');
const { checkNotLogin, checkLogin } = require('../middlewares/check.js');
const moment = require('moment');
const fs = require('fs');

// 登录页面
router.get('/signin', async(ctx, next) => {
    await checkNotLogin(ctx);
    await ctx.render('signin', {
        session: ctx.session
    })
})

// 登录
router.post('/signin', async(ctx, next) => {
    let user = {
        name: ctx.request.body.name,
        psw: ctx.request.body.password,
        moment: moment().unix()
    }
    await query(`SELECT * FROM users WHERE name = '${user.name}' AND pass = '${md5(user.psw)}'`).then((res)=>{
        if(res.length > 0) {
            console.log(`用户 ${res[0].name} 在 ${moment().format('YYYY-MM-DD HH:mm:ss')} 登录了`);
            ctx.session = {
                user: res[0]['name'],
                id: res[0]['id']
            }
            ctx.body = {
                data: {
                    code: '0',
                    msg: '登录成功！'
                }
            }
        }else {
            ctx.body = {
                data: {
                    code: '1',
                    msg: '用户名或密码错误！'
                }
            }
        }
    })
})

module.exports = router;