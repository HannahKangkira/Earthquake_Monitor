const { createProxyMiddleware } = require('http-proxy-middleware')
module.exports = function (app) {
    app.use(createProxyMiddleware('/api1', {
        target: 'http://118.113.105.29:8002',
        changeOrigin: true,
        pathRewrite: { '^/api1': '' }
    }),
        createProxyMiddleware('/api2', {
            target: 'http://10.2.148.244:8080/',
            changeOrigin: true,
            pathRewrite: { '^/api2': '' }
        })
    );
}

/*  , createProxyMiddleware(
     {
         target: 'http://localhost:5001',
         changeOrigin: true,
         //将对象进行替换
         pathRewrite: { '^/api2': '' }
     }) */
