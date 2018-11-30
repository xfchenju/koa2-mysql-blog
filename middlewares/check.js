module.exports = {
    checkNotLogin: (ctx) => {
        if(ctx.session && ctx.session.user) {
            ctx.redirext('./post');
            return false;
        }
        return true;
    },
    checkLogin: (ctx) => {
        if(!ctx.session || !ctx.session.user) {
            ctx.redirect('signin');
            return false;
        }
        return true;
    }
}