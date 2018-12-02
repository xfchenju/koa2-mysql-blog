const router = require('koa-router')();
const { query } = require('../lib/mysql.js');
const md5 = require('md5');
const { checkNotLogin, checkLogin } = require('../middlewares/check.js');
const moment = require('moment');
const qs = require('querystring');
const md = require('markdown-it')();  

// 全部文章 和 我的文章
router.get('/posts', async(ctx, next) => {
    //  参数
    let resParams = ctx.request.querystring;
    let res = [];
    let postCount = 0;
    
    if(resParams) {
        let params = qs.parse(resParams);
        if(!params.author) {
            ctx.redirect('/posts');
        }else {
            let userId = params.author;
            await query(`SELECT * FROM posts WHERE uid = '${userId}'`).then((data)=>{
                res = data;
            })
        
            await ctx.render('posts', {
                session: ctx.session,
                posts: res,
                postsLength: postCount,
                postsPageLength: Math.ceil(postCount / 10),
            })
        }
    }else {
        await query(`SELECT * FROM posts`).then((data)=>{
            res = data;
        })
    
        await ctx.render('posts', {
            session: ctx.session,
            posts: res,
            postsLength: postCount,
            postsPageLength: Math.ceil(postCount / 10),
        })
    }
    
});

// 获取评论
router.get('/posts/:id', async(ctx, next) => {
    let acticalId = ctx.params.id;
    let res = [], postsRes = []
    let postCount = 0;
    

    await query(`SELECT users.name, users.id, users.avator, posts.id as pid, posts.title, posts.content, posts.comments, posts.pv, posts.moment FROM posts LEFT JOIN users ON posts.uid = users.id WHERE posts.id = '${acticalId}'`).then((data)=>{
        postsRes = data[0];
    });

    await query(`SELECT comment.* FROM posts LEFT JOIN comment ON posts.id = comment.postid WHERE posts.id = '${acticalId}'`).then((data)=>{
        res = data;
        postCount = data.length;
    })

    await ctx.render('sPost', {
        session: ctx.session,
        posts: postsRes,
        pageOne: res,
        commentPageLength: Math.ceil(res.length / 10),
        postsLength: postCount,
        postsPageLength: Math.ceil(postCount / 10),
    })
});

// 发表文章页面
router.get('/create', async(ctx, next) => {
    await checkLogin(ctx)
    await ctx.render('create', {
        session: ctx.session,
    })
})

// post 发表文章
router.post('/create', async(ctx, next) => {
    let res = ctx.request.body;
    let id = ctx.session.id,
        name = ctx.session.user,
        avator;
    await query(`SELECT avator FROM users WHERE id = '${id}'`).then((data)=>{
        avator = data[0].avator;
    });
    let data = [name, res.title, res.content, md.render(res.content), id, moment().format('YYYY-MM-DD HH:mm:ss'), avator];
    await query(`INSERT INTO posts (name, title, content, md, uid, moment, avator) VALUES ('${data.join("','")}')`).then((data)=>{
        if(data.insertId) {
            ctx.body = {
                code:200,
                message:'发表文章成功'
            };
        }
    })
});

// 删除单篇文章
router.post('/posts/:postId/remove', async(ctx, res) => {
    let postId = ctx.params.postId;

    await query(`DELETE FROM posts WHERE id = '${postId}'`).then(async(res)=>{
        if(res) {
            await query(`DELETE FROM comment WHERE postid = '${postId}' `).then((ress)=>{
                if(ress) {
                    ctx.body = {
                        code:200,
                        message:'删除文章成功'
                    };
                }
            }).catch((err)=>{
                ctx.body = {
                    code: 500,
                    message: err
                };
            });
        }else {
            ctx.body = {
                code: 500,
                message: err
            };
        }     
    }).catch((err)=>{
        ctx.body = {
            code: 500,
            message: err
        };
    });
});

// 发表评论
router.post('/:postId',async(ctx, next) => {
    let postId = ctx.params.postId;
    let request = ctx.request.body;
    let id = ctx.session.id,
        name = ctx.session.user,
        avator;

    await query(`SELECT avator FROM users WHERE id = '${id}'`).then((data)=>{
        if(data.length > 0) {
            avator = data[0].avator;
        }
    });

    let data = [name, request.content, moment().format('YYYY-MM-DD HH:mm:ss'), postId, avator];
    await query(`INSERT INTO comment (name, content, moment, postid, avator) VALUES ('${data.join("','")}')`).then((res)=>{
        if(res.insertId) {
            ctx.body = {
                code:200,
                message:'发表评论成功'
            };
        }
    }).catch((err)=>{
        ctx.body = {
            code: 500,
            message: err
        };
    });
})

// 删除评论
router.post('/posts/:postId/comment/:commentId/remove', async(ctx, next) => {
    let commentId = ctx.params.commentId;

    await query(`DELETE FROM comment WHERE id = '${commentId}'`).then((res)=>{
        if(res) {
            ctx.body = {
                code:200,
                message:'发表评论成功'
            };
        }
    }).catch((err)=>{
        ctx.body = {
            code: 500,
            message: err
        };
    });
});

// 编辑单篇文章页面
router.get('/posts/:postId/edit', async(ctx, next)=>{
    let postId = ctx.params.postId;

    await query(`SELECT * FROM posts WHERE id = '${postId}'`).then((data)=>{
        postsTitle = data[0].title;
        postsContent = data[0].md;
    })
    
    await ctx.render('edit', {
        session: ctx.session,
        postsTitle: postsTitle,
        postsContent: postsContent
    })
});
// post 编辑单篇文章
router.post('/posts/:postId/edit',  async(ctx, next)=>{
    let postId = ctx.params.postId;
    let request = ctx.request.body;
    
    await query(`UPDATE posts SET title = '${request.title}', content = '${request.content}', md = '${md.render(request.content)}', moment = '${moment().format('YYYY-MM-DD HH:mm:ss')}' WHERE id = '${postId}'`).then((res)=>{
        if(res) {
            ctx.body = {
                code:200,
                message:'修改文章成功'
            };
        }
    }).catch((err)=>{
        ctx.body = {
            code: 500,
            message: err
        };
    });
})


module.exports = router;