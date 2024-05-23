import config from './config'
import { e, addHtml, es } from './utils'

// 返回菜单模板
// 分别有 初级 中级 高级 菜单选项
const templateMenu = function() {
    let tpl = `
        <div id="menu-container">
            <button class="btn btn-primary" data-number="1">简单 9x9</button>
            <button class="btn btn-danger" data-number="2">中等 16x16</button>
            <button class="btn btn-warning" data-number="3">专家 30x16</button>
        </div>
    `
    return tpl
}

// 渲染菜单，等级按钮绑定 click事件
// 按下按钮时，拿到相应等级数据赋值重新渲染扫雷
// 重新渲染扫雷通过调用 回调函数 restart 来解决
export const renderMenu = function(restart) {
    let tpl = templateMenu()
    let body = e('body')
    addHtml(body, tpl)
    // 绑定按钮事件
    let btns = es('#menu-container .btn')
    for (let i = 0; i < btns.length; i += 1) {
        let btn = btns[i]
        btn.addEventListener('click', (event) => {
            let level = config.level[i]
            config.col = level[0]
            config.row = level[1]
            config.boom = level[2]
            config.levelIndex = i + 1
            hideMenu()
            // 当函数存在时，回调
            restart && restart()
        })
    }
}

// 显示菜单
export const showMenu = function() {
    let container = e('#menu-container')
    container.classList.remove('hide')
}

// 隐藏菜单
export const hideMenu = function() {
    let container = e('#menu-container')
    container.classList.add('hide')
}
