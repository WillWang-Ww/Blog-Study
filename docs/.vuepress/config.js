module.exports = {
    title: 'Will 的 学习笔记本',
    description: '记录学习点滴',
    themeConfig: {
        sidebar: 'auto',
        sidebar: [
          {
            title: '你不知道的JavaScript读书笔记',
            collapsable: true,
            children: [
              '/你不知道的JavaScript/作用域',
              '/你不知道的JavaScript/词法作用域-函数作用域-块作用域',
              '/你不知道的JavaScript/This'
            ]
          },
        ]
    
      }
  }