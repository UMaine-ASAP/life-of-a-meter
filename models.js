function Phase(id, src, x, y, width, height, clickFunction) {
	this.id = id;
	this.image = paper.image(src, x, y, width, height);
	this.originalX = x;
	this.originalY = y;
    this.destX = x;
    this.destY = y;
	this.width = this.image.attrs.width;
	this.height = this.image.attrs.height;
    this.location = '';
    this.node = nodeSystem.createNode(30, 30, 0, '');
    this.clickFunction = clickFunction;

    var myself = this; // store reference for use in image function calls

    this.moveTo = function(destX, destY, callback) {
        this.destX = destX;
        this.destY = destY;

       this.node.x = destX + this.width/2;
       this.node.y = destY + this.height/2;

        this.toFront(); // Make sure image is above other
        this.image.animate({x: destX, y: destY}, 400, 'easeOut', function() {
            if( callback ) {
                callback(myself);
            }
        });
    };

    this.hide = function() {

    };

    this.connectNode = function(node) {
        nodeSystem.connectNodes(currentPhase.node, node);
    };

	this.moveToCenter = function(callback) {
		var destX = parseInt($('body').css('width'))  / 2 - this.width/2;
		var destY = parseInt($('body').css('height')) / 2 - this.height/2;

        this.location = 'center';

        this.moveTo(destX, destY, callback);
	};

//    this.moveToCenterCallback = moveToCenterCallback;

    this.toFront = function() {
        this.image.toFront();
    };

    this.moveToLeft = function(callback) {
        var destX = parseInt($('body').css('width'))  / 2 - this.width/2 - 200 - this.width/2; // center - 200 - width/2
        var destY = parseInt($('body').css('height')) / 2 - this.height/2;

        this.location = 'left';

        this.moveTo(destX, destY, callback);

    };

	this.moveToOrigin = function() {
        this.location = 'origin';
        this.moveTo(this.originalX, this.originalY);
	};

    this.onClick = function() {
        myself.clickFunction(myself);
    };

	// set image properties
	this.image.attrs.position = "absolute";
	this.image.click( myself.onClick );

}; // End model Phase



function nodeObject(circle, text, line, x, y) {
    this.circle = circle;
    this.text = text;
    this.line = line;
    this.x = x;
    this.y = y;
    this.oldX = x;
    this.oldY = y;

    this.centerX = parseInt($('body').css('width')) / 2;
    this.centerY = parseInt($('body').css('height')) / 2;

    var that = this;

    this.bounds = function() {
        return that.circle.getBBox();
    }

    this.circle.click(function() {
        that.onClick();
    });

    this.text.click(function() {
        that.onClick();
    });

    this.onClick = function() {
        if (activeNode == null) {
            activeNode = that;
            loadDepartmentEmployees(that.text.attrs.text);
        }
        else if (activeNode == that) {
            //jump back one level
            $(xmlData).find("department").each(function() {
                if ($(this).attr("name") == that.text.attrs.text) {
                    openPhase(currentPhase);//parseInt($(this).parent().parent().attr("order")));
                }
            });
        }
        else if (activeNode != that) {
            activeNode.animateTo(activeNode.oldX, activeNode.oldY);
            activeNode = that;

            //load the description of this and all people inside it
            loadDepartmentEmployees(that.text.attrs.text);
        }

        console.log("Clicked node " + that.text.attrs.text);
        that.text.animate({x: that.centerX, y: that.centerY}, 250);
        that.circle.animate({cx: that.centerX, cy: that.centerY}, 250);

        console.log(nodeObjects);
        for(var nodeObject in nodeObjects['level1']) {
            console.log("nodeObject: " + nodeObject);
        }
    }

    this.remove = function() {
        this.circle.remove();
        this.text.remove();
        this.line.remove();
    }

    this.animateTo = function(x, y) {
        that.circle.animate({cx: x, cy: y}, 250);
        that.text.animate({x: x, y: y}, 250);
    }
}