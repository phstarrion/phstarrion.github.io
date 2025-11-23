const { resolve } = require('path')
const { defineConfig } = require('vite')

module.exports = defineConfig({

    base: './',
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                music: resolve(__dirname, 'music.html'),
                images: resolve(__dirname, 'images.html'),
                apps: resolve(__dirname, 'apps.html'),
                blog: resolve(__dirname, 'blog.html'),
                x: resolve(__dirname, 'x.html')
            }
        }
    }
})
