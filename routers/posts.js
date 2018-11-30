const router = require('koa-router')();
const { query } = require('../lib/mysql.js');
const md5 = require('md5');
const { checkNotLogin, checkLogin } = require('../middlewares/check.js');
const moment = require('moment');
const fs = require('fs');

// 登录页面
router.get('/posts', async(ctx, next) => {
    var data = [];
    await checkNotLogin(ctx);

    await query('SELECT * FROM users').then((res)=>{
        data = res;
    })

    for(let i in data) {
        console.log(data[i]['moment']);
        //data[i]['moment'] = moment(data[i]['moment']).format('YYYY-MM-DD HH:mm:ss');
    }
    await ctx.render('posts', {
        session: ctx.session,
        data: data
    })
})

module.exports = router;