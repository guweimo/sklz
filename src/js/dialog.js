const dialog = function(title = '', body = '', footer='') {
    let tpl = `
        <div class="dialog-wrapper">
            <div class="dialog">
                <div class="dialog-header">
                    <span class="dialog-title">${ title }</span>
                    <button type="button" aria-label="Close" class="dialog-header-btn"><span class="dialog-close">x</span></button>
                </div>
                <div class="dialog-body">
                    ${ body }
                </div>
                <div class="dialog-footer">
                    ${ footer }
                </div>
            </div>
        </div>
    `
    return tpl
}

export default dialog
