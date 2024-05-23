// 用于上线时，清空 log 内容
// export const log = () => {}

let log1 = () => {}
if (process.env.NODE_ENV === 'development') {
    log1 = console.log.bind(console)
}

export const log = log1

export const e = selector => {
    return document.querySelector(selector)
}

export const es = selector => {
    return document.querySelectorAll(selector)
}

export const addHtml = (element, template) => {
    element.insertAdjacentHTML('beforeend', template)
}

