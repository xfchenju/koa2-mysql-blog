const router = require('koa-router')();

// 注销页面
router.get('/signout', async(ctx, next) => {
    ctx.session = null;
    console.log('登出成功')
    ctx.body = true
})

module.exports = router;