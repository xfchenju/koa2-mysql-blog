const router = require('koa-router')();
const { findDataByName, insertData } = require('../lib/mysql.js');
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
    let req = ctx.request.body;
    let user = {
        name: req.name,
        psw: req.password,
        repsw: req.repeatpass,
        avator: '',
        moment: moment().unix()
    }
    if(user.pws !== user.repsw) {
        ctx.body = {
            data: 1
        };
    }

    await findDataByName(user.name).then(async(res) => {
        if(res.length) {
            try {
                throw Error('用户名已存在');
            }catch(error) {
                console.dir(error);
            } 
            ctx.body = {
                data: 1
            };
        }else {
            await insertData(user).then(async(res)=>{
                if(res.insertId) {
                    ctx.body = {
                        data: 3
                    };
                }else {
                    ctx.body = {
                        data: 4
                    }; 
                }
            })
        }
    })
})

module.exports = router;