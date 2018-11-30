const router = require('koa-router')();
const { findDataByName, insertData } = require('../lib/mysql.js');
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
    console.dir(user, 'user');

    await findDataByName(user.name).then((res) => {
        
    })
})

module.exports = router;