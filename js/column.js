var Column = function(index) {
    let columnElement = document.querySelector('.column:nth-child('+ (index + 1) +')');
    let blocks = [];
    let isActive = false;
    let isHovered = false;
    let isDisabled = false;
    let hasHoveredBlock = false;

    this.getElement = function() {
        return columnElement;
    }

    this.isColumnActive = function() {
        return isActive;
    }

    this.isColumnHovered = function() {
        return isHovered;
    }

    this.isColumnDisabled = function() {
        return isDisabled;
    }

    this.click = function() {
        if(isActive) {
            moveBlock();
        } else {
            setActive(true);
            if(hasHoveredBlock) {
                setHovered(true);
                hasHoveredBlock = false;
            }
        }
    }

    this.activateColumn = function() {
        setActive(true);
    }

    this.inactivateColumn = function() {
        setActive(false);
        setHovered(false);
    }

    this.disableColumn = function() {
        setDisabled(true);
        setActive(false);
    }

    this.enableColumn = function() {
        setDisabled(false);
    }

    this.setHasHoveredBlock = function(status) {
        hasHoveredBlock = status;
    }

    this.setBlocks = function(newBlocks) {
        blocks = newBlocks;
    }

    this.addBlock = function(block) {
        blocks.push(block);
    }

    this.takeBlock = function() {
        return blocks.pop();
    }

    this.clear = function() {
        blocks = [];
    }

    this.render = function() {
        columnElement.innerHTML = '';
        if(!blocks.length) {
            return;
        }
        for(let i = 0; i < blocks.length; i++) {
            let block = blocks[i].render();
            columnElement.append(block);
        }
    }

    this.check = function(blocksAmount) {
        if(blocks.length === blocksAmount && !isHovered) {
            return true;
        }
        return false;
    }

    const setActive = function(status) {
        isActive = status;
        columnElement.classList.toggle('active', isActive);
    }

    const setHovered = function(status) {
        isHovered = status;
        columnElement.classList.toggle('hovered', isHovered);
    }

    const setDisabled = function(status) {
        isDisabled = status;
        columnElement.classList.toggle('disabled', isDisabled);
    }

    const moveBlock = function() {
        if(isHovered) {
            if(blocks.length > 1) {
                let lastBlockPosition = blocks[blocks.length - 2].getPosition();
                let newBlockPosition = blocks[blocks.length - 1].getPosition();
                if(newBlockPosition < lastBlockPosition) {
                    return;
                }
            }
            hasHoveredBlock = false;
        }
        
        setHovered(!isHovered);
    }
}