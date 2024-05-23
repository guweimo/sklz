// 实现扫雷程序的流程如下
// 1, 生成扫雷数据
// 2, 根据扫雷数据画图
// 3, 点击的时候根据情况判断
//
// 为了方便, 我们跳过第一步, 直接用下面给定的数据即可, 这样方便测试
// 直接写死数据
// let s = ' [[9,1,0,0,0,1,1,1,0],[1,1,0,0,1,2,9,1,0],[1,1,1,0,1,9,2,1,0],[1,9,2,1,1,1,1,0,0],[1,2,9,1,0,0,1,1,1],[1,2,1,1,0,1,2,9,1],[9,1,0,0,1,2,9,2,1],[1,2,1,1,1,9,2,1,0],[0,1,9,1,1,1,1,0,0]]'
// 把字符串转成数组
// let square = JSON.parse(s)

// 以我们这个数据为例, 网页布局实际上应该 9 * 9 的格子
// cell 用 float 完成布局, clearfix 是用来解决浮动的方案
// 每一行处理成下面的形式
// data-number 是数字, data-x 和 data-y 分别是数组中的下标
// <div class="row clearfix">
//     <div class="cell" data-number="9" data-x="0" data-y="0">9</div>
//     <div class="cell" data-number="1" data-x="0" data-y="1">1</div>
//     <div class="cell" data-number="0" data-x="0" data-y="2">0</div>
//     <div class="cell" data-number="0" data-x="0" data-y="3">0</div>
//     <div class="cell" data-number="0" data-x="0" data-y="4">0</div>
//     <div class="cell" data-number="1" data-x="0" data-y="5">1</div>
//     <div class="cell" data-number="1" data-x="0" data-y="6">1</div>
//     <div class="cell" data-number="1" data-x="0" data-y="7">1</div>
//     <div class="cell" data-number="0" data-x="0" data-y="8">0</div>
// </div>
import { log, es, e, addHtml } from './js/utils'
import dialog from "./js/dialog"
import './style/index.css'
import config from './js/config'
import { renderMenu, showMenu } from './js/menu'

// 1. templateCell 函数, 参数为数组 line 和变量 x, x 表示第几行
// 返回 line.length 个 cell 拼接的字符串
const templateCell = function(line, y) {
    let cell = ''

    for (let i = 0; i < line.length; i++) {
        let number = line[i]
        let str = number
        if (number === 9) {
            str = '💣'
        }
        let tpl = `<div class="cell level${config.levelIndex}" data-number="${number}" data-x="${i}" data-y="${y}">${str}</div>`
        cell += tpl
    }

    return cell
}

// 2. templateRow 的参数 square 是二维数组, 用来表示雷相关的数据
// 返回 square.length 个 row 拼接的字符串
// row 的内容由 templateCell 函数生成
const templateRow = function(square) {
    let rows = ''

    for (let i = 0; i < square.length; i++) {
        let item = square[i]
        let cells = templateCell(item, i)
        const row = `<div class="row clearfix">${cells}</div>`
        rows += row
    }

    return rows
}

// 返回 头部信息
// 计时器 和炸弹的个数
const templateHeader = function() {
    const tpl = `
        <div class="header-container">
            <span class="header-icon">🕜</span>：<span class="timer">00:00</span>
            <span class="header-icon" style="padding-left: 20px;">💣</span>：<span class="flag">${config.boom}</span>
        </div>
    `
    return tpl
}

// 更新炸弹标志剩余个数
const updateFlag = function(boom) {
    let flag = e('.flag')
    flag.innerHTML = boom
}

// 开始计时
// 点击扫雷后，开始计时
const beginInterval = function() {
    if (config.isEnd) {
        return
    }
    let s = 0
    let timer = e('.timer')
    config.time = '00:00'
    config.inter = setInterval(() => {
        if (config.isStart) {
            s += 1
            // 计算分钟
            let minus = Math.floor(s / 60)
            // 计算秒
            let second = s % 60
            // 小于 10 补 0
            if (minus < 10) {
                minus = '0' + minus
            }
            if (second < 10) {
                second = '0' + second
            }
            // 更新页面的计时
            let time = minus + ':' + second
            timer.innerHTML = time
            // 保存当前计时，用于结束后展示
            config.time = time
        }
    }, 1000)
}

// 结束计时
const endInterval = function() {
    clearInterval(config.inter)
    config.isStart = false
}

// 返回 footer 内容
// 初级 中级 高级选项
// 点击后直接重新开始
const templateFooter = function() {
    const tpl = `
        <div class="footer-container">
            <button class="btn btn-primary" data-number="1">简单 9x9</button>
            <button class="btn btn-danger" data-number="2">中等 16x16</button>
            <button class="btn btn-warning" data-number="3">专家 30x16</button>
        </div>
    `
    return tpl
}

// 3. square 是二维数组, 用来表示雷相关的数据
// 用 square 生成 9 * 9 的格子, 然后插入到页面中
// div container 是 <div id="id-div-mime"></div>
const renderSquare = function(square) {
    const rows = templateRow(square)
    const header = templateHeader()
    const footer = templateFooter()
    let body = e('body')
    let container = e('#id-div-mine')
    // 如果 id-div-mine 的元素存在
    // 则把内容清除后，再加 头部 展开框 尾部
    // 不存在，就生成新的 id-div-mine 并且塞进内容
    if (container) {
        container.innerHTML = ''
        addHtml(container, header)
        addHtml(container, rows)
        addHtml(container, footer)
    } else {
        let mine = `<div id="id-div-mine">${header}${rows}${footer}</div>`
        addHtml(body, mine)
    }
}

// 更新 square，并重新分配位置
const updateSquare = function(x1, y1) {
    // 生成新的 square
    let square = generalArray()
    // 循环生成新的 square
    // 当点击的位置不为 0 时，重新生成
    // 直到点击的位置为 0 时才结束循环
    while (square[Number(y1)][Number(x1)] !== 0) {
        square = generalArray()
    }
    // 循环 square 值，替换 cell 的值和 data-number
    let cell = es('.cell')
    // 遍历 square
    // 重新设置每个格子的 number 值
    // 当 number 是 9 时，修改为炸弹
    for (let y = 0; y < square.length; y++) {
        let col = square[y]
        for (let x = 0; x < col.length; x++) {
            let n = col[x]
            let index = y * col.length + x
            let item = cell[index]
            item.dataset.number = n
            let type = Number(item.dataset.type) || 0
            let str = n
            // 等于 9 时，替换成炸弹
            if (type !== 0) {
                str = item.innerHTML
            } else if (Number(n) === 9) {
                str = '💣'
            }
            item.innerHTML = str
        }
    }
    return square
}

// 右键按下时选中附近没打开的格子
// 右键松开或移出则移出选中状态
const rightSelect = function(x, y, select) {
    const opened = 'opened'
    let selector = `.cell[data-x="${x}"][data-y="${y}"]`
    let cell = e(selector)

    if (cell === null || cell.classList.contains(opened)) {
        return
    }
    const click = 'right-click'
    if (select) {
        cell.classList.add(click)
    } else {
        cell.classList.remove(click)
    }
}

// 寻找当前 cell 的范围，根据这个范围循环选中没打开的格子
const rightSelectAround = function(cell, select=false) {
    let x = Number(cell.dataset.x)
    let y = Number(cell.dataset.y)

    const position = [
        // 上一行
        [x - 1, y - 1],
        [x - 1, y],
        [x - 1, y + 1],
        // 当前行
        [x , y - 1],
        [x, y + 1],
        // 下一行
        [x + 1, y - 1],
        [x + 1, y],
        [x + 1, y + 1],
    ]

    for (let i = 0; i < position.length; i ++) {
        const p = position[i]
        const x = p[0]
        const y = p[1]
        rightSelect(x, y, select)
    }
}

// 绑定右键事件
const bindRight = function(square) {
    // 阻止右键菜单栏
    let mine = e('#id-div-mine')
    mine.addEventListener('contextmenu', (event) => {
        event.preventDefault()
    })
    let rightClick = false
    let cell = null
    // 右键按下绑定
    mine.addEventListener('mousedown', (event) => {
        // 不是右键直接返回
        if (event.button !== 2) {
            return
        }
        let target = event.target
        cell = target
        // 判断是否已展开，展开才能点击
        if (target.classList.contains('opened') && !rightClick) {
            log('按下', target)
            rightClick = true
            rightSelectAround(cell, true)
        }
    })
    // 移动时判断是否移出当前 cell
    // 如果移出，则取消选中状态
    mine.addEventListener('mousemove', (event) => {
        // 如果右键没有按下，直接返回
        if (!rightClick) {
            return
        }
        let target = event.target
        // 如果移出右键按下时的元素，则取消选中状态
        // 并且移除右键按下状态
        if (cell !== target) {
            rightClick = false
            rightSelectAround(cell, false)
            cell = null
        }
    })
    // 右键松开绑定
    mine.addEventListener('mouseup', (event) => {
        // 不是右键直接返回
        if (event.button !== 2) {
            return
        }
        let target = event.target
        // 判断是否已展开，展开才能点击
        if (target.classList.contains('opened') && rightClick) {
            log('松开')
            rightClick = false
            rightVjklAround(square, cell)
            rightSelectAround(cell, false)
        }
    })
}

// 绑定等级按钮
// 点击等级后，根据等级获取各等级的数据
// 重新生成数据
const bindLevelButton = function() {
    let btns = es('.footer-container .btn')
    for (let i = 0; i < btns.length; i++) {
        let btn = btns[i]
        btn.addEventListener('click', (event) => {
            let target = event.target
            let level = config.level[i]
            config.col = level[0]
            config.row = level[1]
            config.boom = level[2]
            config.levelIndex = i + 1
            switchLevel()
        })
    }
}

// 4. 实现 bindEventDelegate 函数, 只处理格子, 也就是 .cell 元素
const bindEventDelegate = function(square) {
    renderSquare(square)
    let boom = config.boom
    let cells = es('.cell')
    let bol = false
    for (let i = 0; i < cells.length; i++) {
        let cell = cells[i]
        // 左键点击绑定
        cell.addEventListener('click', (event) => {
            let target = event.target
            // 判断第一次点击的位置是否为 0
            // 不是的话，保证第一次点击的位置是 0
            log(bol, target.dataset.number)
            if (target.dataset.number !== '0' && bol === false) {
                log('into update')
                square = updateSquare(target.dataset.x, target.dataset.y)
            }
            bol = true
            // 如果结束，则不能再次点击
            if (!config.isEnd) {
                // 点击到值为 9 时并且 type 为 0 的时候结束游戏
                let type = Number(target.dataset.type) || 0
                if (target.dataset.number === '9' && type === 0) {
                    config.isEnd = true
                }
                vjkl(target, square)
            }
            if (!config.isStart) {
                config.isStart = true
                beginInterval()
            }
        })
        // 右键点击绑定
        cell.addEventListener('contextmenu', (event) => {
            event.preventDefault()
            let target = event.target
            if (config.isEnd) {
                return
            }
            // 判断是否已展开，没展开才能点击
            if (!target.classList.contains('opened')) {
                let type = Number(target.dataset.type) || 0
                type = (type + 1) % 3
                target.dataset.type = type.toString()
                // 默认为空，
                // 当 type 为 1 时，显示红旗
                // 当 type 为 2 时，显示问号
                let str = ''
                if (type === 1) {
                    str = '🚩'
                    boom -= 1
                } else if (type === 2) {
                    str = '?'
                    boom += 1
                }

                updateFlag(boom)
                target.innerHTML = str
            }
            // 如果开始状态不为 true
            // 则把开始状态设置为 ture
            // 并且开始计时
            if (!config.isStart) {
                config.isStart = true
                beginInterval()
            }
        })
    }

    // 绑定右键
    bindRight(square)
    // 绑定等级按钮
    bindLevelButton()
}

// 展开所有爆炸点
const vjklBoom = function() {
    let cells = es('.cell')
    endInterval()
    // 循环所有 cell 节点，找到
    for (let i = 0; i < cells.length; i++) {
        let cell = cells[i]
        let n = cell.dataset.number
        // 如果 cell 元素的 number 为 9，并且没有展开
        // 则添加展开样式
        if (n === '9' && !cell.classList.contains('opened')) {
            cell.classList.add('opened')
        }
        // 如果 cell 元素的内容是 🚩 并且 number 为 9
        // 则设置 cell 元素的内容为 💣，添加 成功标识炸弹样式
        // 如果 cell 元素的内容是 🚩，但 number 不是 9
        // 则在 cell 元素添加 错误标识炸弹样式
        if (cell.innerHTML === '🚩' && n === '9') {
            cell.innerHTML = '💣'
            cell.classList.add('success-flag')
        } else if (cell.innerHTML === '🚩' && n !== '9') {
            cell.classList.add('error-flag')
        }
    }

    // 打开结束弹窗
    openDialog('😞')
}

// 5. vjkl 是点击格子的函数
// 要注意的是我们在初始情况下就把数字写到了 html 中 <div class="cell" data-number="1" data-x="0" data-y="1">1</div>
// 而初始情况下数字不应该显示出来的, 可以直接用 font-size: 0; 来隐藏文字
// 点击的时候根据情况用 font-size: 14px; (当然这一步应该用 class 来完成, 比如添加 opened class) 的方式显示文字
// 如果已经显示过, 则不做任何处理
// 如果没有显示过, 判断下列情况
// 1. 如果点击的是 9, 展开, 游戏结束
// 2. 如果点击的是 0, 展开并且调用 vjklAround 函数
// 3. 如果点击的是其他数字, 展开
const vjkl = function(cell, square) {
    let opened = 'opened'
    let number = cell.dataset.number
    let type = Number(cell.dataset.type) || 0
    if (type > 0) {
        return
    }

    cell.classList.add(opened)

    if (number === '9') {
        vjklBoom()
        cell.classList.add('error-open')
    } else if (number === '0') {
        const x = cell.dataset.x
        const y = cell.dataset.y
        vjklAround(square, x, y)
    }
}

// rightVjklAround 根据当前 cell 元素的 number 值
// 寻找周围 8 个元素的 🚩 是否等于 number 值
// 不相等不执行
// 相等就展开展开周围 cell 周围 8 个元素, x 和 y 分别是下标
// 展开周围的元素通过调用 vjkl1 来解决
const rightVjklAround = function(square, cell) {
    let x = Number(cell.dataset.x)
    let y = Number(cell.dataset.y)

    const position = [
        // 上一行
        [x - 1, y - 1],
        [x - 1, y],
        [x - 1, y + 1],
        // 当前行
        [x , y - 1],
        [x, y + 1],
        // 下一行
        [x + 1, y - 1],
        [x + 1, y],
        [x + 1, y + 1],
    ]

    let flag = 0
    for (let i = 0; i < position.length; i ++) {
        const p = position[i]
        const x = p[0]
        const y = p[1]
        let selector = `.cell[data-x="${x}"][data-y="${y}"]`
        let cell = e(selector)
        if (cell == null) {
            continue
        }
        if (cell.innerHTML === '🚩') {
            flag += 1
        }
    }

    if (flag !==  Number(cell.dataset.number)) {
        return
    }

    for (let i = 0; i < position.length; i ++) {
        const p = position[i]
        const x = p[0]
        const y = p[1]
        vjkl1(square, x, y, true)
    }
}

const rightVjkl1 = function(square, x, y) {
    const opened = 'opened'
    let selector = `.cell[data-x="${x}"][data-y="${y}"]`
    let cell = e(selector)

    if (cell === null || cell.classList.contains(opened)) {
        return
    }
    let type = Number(cell.dataset.type) || 0
    if (type > 0) {
        return
    }
    setTimeout(() => {
        let number = cell.dataset.number

        if (number === '9') {
            vjklBoom()
        } else if (number === '0') {
            cell.classList.add(opened)
            vjklAround(square, x, y)
        } else {
            cell.classList.add(opened)
            winDialog()
        }
    }, 20)
}

// 6. vjklAround 展开周围 cell 周围 8 个元素, x 和 y 分别是下标
// 展开周围的元素通过调用 vjkl1 来解决
const vjklAround = function(square, x, y) {
    x = Number(x)
    y = Number(y)

    const position = [
        // 上一行
        [x - 1, y - 1],
        [x - 1, y],
        [x - 1, y + 1],
        // 当前行
        [x , y - 1],
        [x, y + 1],
        // 下一行
        [x + 1, y - 1],
        [x + 1, y],
        [x + 1, y + 1],
    ]

    for (let i = 0; i < position.length; i ++) {
        const p = position[i]
        const x = p[0]
        const y = p[1]
        vjkl1(square, x, y)
    }
}

// isWin 判断胜利条件
// 遍历所有 cell 元素
// 统计未展开的格子数量，未展开格子炸弹数量
// 判断未展开的格子数量，未展开格子炸弹数量是否跟 炸弹数量相等
// 如果相等返回 true，否则返回 false
const isWin = function() {
    let cells = es('.cell')
    let n = 0
    let boom = 0
    // 统计未展开的格子数量
    for (let i = 0; i < cells.length; i++) {
        let cell = cells[i]
        if (!cell.classList.contains('opened')) {
            n += 1
        }
    }
    // 统计未展开格子炸弹数量
    for (let i = 0; i < cells.length; i++) {
        let cell = cells[i]
        if (!cell.classList.contains('opened') && cell.dataset.number === '9') {
            boom += 1
        }
    }
    // log(n === config.boom && boom === config.boom)
    // 判断未展开的格子数量，未展开格子炸弹数量是否跟 炸弹数量相等
    // 如果相等返回 true，否则返回 false
    return n === config.boom && boom === config.boom
}

// 结束弹窗按钮绑定 click 事件
// 分别绑定关闭，再来一局，返回菜单按钮
// 点击关闭按钮时，删除结束弹窗
// 点击再来一局，重新生成新的扫雷，通过调用 switchLevel 来解决
// 点击再来一局，显示菜单，通过调用 showMenu 来解决
const bindDialogBtn = function() {
    let close = e('.dialog-close')
    close.addEventListener('click', (event) => {
        let dialog = e('.dialog-wrapper')
        // let modal = e('.modal')
        dialog.remove()
        // modal.remove()
    })
    let btns = es('.dialog-footer .btn')
    for (let i = 0; i < btns.length; i++) {
        let btn = btns[i]
        btn.addEventListener('click', (event) => {
            if (i === 0) {
                switchLevel()
            } else if (i === 1) {
                let dialog = e('.dialog-wrapper')
                dialog.remove()
                showMenu()
            }
        })
    }
}

const winDialog = function() {
    let win = isWin()
    if (win) {
        openDialog('😉')
    }
}
const openDialog = function(icon) {
    let m = e('#id-div-mine')
    const body = `<div class="dialog-body-item">游戏用时<div class="right game-time">${config.time}</div></div>`
    const footer = `
        <button class="btn">再来一局</button>
        <button class="btn btn-primary">返回菜单</button>
    `
    let d = dialog(icon, body, footer)
    setTimeout(() => {
        addHtml(m, d)
        bindDialogBtn()
    }, 100)
}

// 7. vjkl1 是重点函数
// 如果满足边界调节, 则继续
// 因为 vjkl1 这个函数是展开格子, 所以如果已经展开过, 那么就不展开元素, 这个是递归终止条件
// 根据 x 和 y 还有属性选择器选择出格子, 具体可以参考 https://developer.mozilla.org/zh-CN/docs/Web/CSS/Attribute_selectors
// 选择出格子之后拿到格子上面放的元素
// 如果没有展开过, 判断下列情况
// 如果碰到的是 9, 什么都不做. 注意, 这里 9 的处理方式和直接点击格子 9 的处理方式不一样
// 如果碰到的是 0, 递归调用 vjklAround 函数
// 如果碰到的是其他元素, 展开
const vjkl1 = function(square, x, y, showBoom=false) {
    const opened = 'opened'
    let selector = `.cell[data-x="${x}"][data-y="${y}"]`
    let cell = e(selector)

    if (cell === null || cell.classList.contains(opened)) {
        return
    }
    let type = Number(cell.dataset.type) || 0
    if (type > 0) {
        return
    }
    setTimeout(() => {
        let number = cell.dataset.number
        if (number === '9' && showBoom) {
            vjklBoom()
        } else if (number === '0') {
            cell.classList.add(opened)
            vjklAround(square, x, y)
        } else {
            cell.classList.add(opened)
        }

        winDialog()
    }, 0)
}

const bindEvent = square => {
    // log('start', square)
    bindEventDelegate(square)
}

const restart = () => {
    let s = '[[9,1,0,0,0,1,1,1,0],[1,1,0,0,1,2,9,1,0],[1,1,1,0,1,9,2,1,0],[1,9,2,1,1,1,1,0,0],[1,2,9,1,0,0,1,1,1],[1,2,1,1,0,1,2,9,1],[9,1,0,0,1,2,9,2,1],[1,2,1,1,1,9,2,1,0],[0,1,9,1,1,1,1,0,0]]'
    let square = JSON.parse(s)
    bindEventDelegate(square)
}

// 洗牌算法
const shuffle = function(array) {
    for (let i = array.length - 1; i >= 0; i--) {
        let randomIndex = Math.floor(Math.random() * (i+1))
        let itemAtIndex = array[randomIndex]
        array[randomIndex] = array[i]
        array[i] = itemAtIndex
    }
}

// 累加周围 8 个格子的炸弹数量
const lzjw = function(x, y, array) {
    if (y < 0 || y >= array.length) {
        return
    } else if (x < 0 || x >= array[y].length) {
        return
    }
    const n = array[y][x]
    if (n !== 9) {
        array[y][x] += 1
    }
}

// 根据 9 累加周围 8 个元素的值，x 和 y 分别是下标
// 累加通过调用 lzjw 来解决
const lzjwAround = function(x, y, array) {
    const position = [
        // 上一行
        [x - 1, y - 1],
        [x - 1, y],
        [x - 1, y + 1],
        // 当前行
        [x , y - 1],
        [x, y + 1],
        // 下一行
        [x + 1, y - 1],
        [x + 1, y],
        [x + 1, y + 1],
    ]
    for (let i = 0; i < position.length; i++) {
        let p = position[i]
        let x = p[0]
        let y = p[1]
        lzjw(x, y, array)
    }
}

// 生成二维数组，并生成扫雷数据
const fromSklz = function(array) {
    let result = []
    // 生成二维数组
    for (let i = 0; i < array.length / config.col; i++) {
        result.push(array.slice(i * config.col, (i * config.col) + config.col))
    }
    // 循环 result
    for (let y = 0; y < result.length; y++) {
        let item = result[y]
        // 循环二级数组
        for (let x = 0; x < item.length; x++) {
            // 等于 9 时，累加四周数据
            if (item[x] === 9) {
                lzjwAround(x, y, result)
            }
        }
    }
    return result
}

// 生成 square 数据，返回数据
// 新建数据 array
// 根据 行 * 列 来循环对应次数
// array 根据炸弹的数量添加 9，后面的补充 0
// 然后洗数据的数据并生成扫雷数据格式
// 洗数据通过调用 shuffle 来解决
// 生成扫雷数据格式通过调用 fromSklz 来解决
const generalArray = function() {
    let array = []
    let total = config.row * config.col
    let boom = config.boom
    for (let i = 0; i < total; i++) {
        let n = 0
        if (i < boom) {
            n = 9
        }
        array.push(n)
    }
    shuffle(array)
    let square = fromSklz(array)
    // log(square)
    return square
}

const start = function(square) {
    bindEvent(square)
}

// 切换等级
// 重新初始化状态并重新生成扫雷数据
// 然后渲染扫雷
// 生成扫雷数据通过调用 generalArray 来解决
// 渲染扫雷通过调用 start 来解决
const switchLevel = function() {
    log('config', config)
    // 初始化状态
    config.isStart = false
    config.isWin = false
    config.isEnd = false
    // 重新生成数据
    let square = generalArray()
    // 开始渲染
    start(square)
}

const _main = () => {
    // 渲染菜单页面
    renderMenu(switchLevel)
    // let square = generalArray()
    // start(square)
}

_main()

