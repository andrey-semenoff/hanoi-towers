var Block = function(position) {
    const maxWidth = 90;
    let width = maxWidth - position * 10 + '%';

    this.getPosition = function() {
        return position;
    }

    this.render = function() {
        let block = document.createElement('div', null);
        block.classList.add('block');
        block.style = 'width:' + width + ';';
        return block;
    }
}