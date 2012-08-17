function Phase(id, src, x, y, width, height) {
	var parentPhase = this; // store reference for use in image function calls

	this.id = id;
	this.image = paper.image(src, x, y, width, height);
	this.originalX = x;
	this.originalY = y;
	this.width = this.image.attrs.width;
	this.height = this.image.attrs.height;

	this.moveCenter = function() {
		var image = this.image;

		var destx = parseInt($('body').css('width'))  / 2 - image.attrs.width/2;
		var desty = parseInt($('body').css('height')) / 2 - image.attrs.height/2;

		image.animate({x: destx, y: desty}, 500, 'easeOut', function() {
			// Load phase data after animation is complete
			loadPhase(parentPhase.id);
		});

		// Order objects
		transparencyMask.toFront();
		this.image.toFront();

		// Display transparency
		displayTransparency();
	};

	this.moveBack = function() {
           this.image.animate({x: this.originalX, y: this.originalY}, 500, 'easeOut');
	};

	// set image properties
	this.image.attrs.position = "absolute";

	this.image.click( function() {
		// Make sure there isn't something already in the center
		if( currentPhase ) return;

		// Set currentPhase to the clicked one
		currentPhase = parentPhase;

		// Animate image to center of page
		parentPhase.moveCenter();
	});

};



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
                    loadPhase(parseInt($(this).parent().parent().attr("order")));
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

        if( currentPhase != undefined) {
		currentPhase.moveBack();
        }

        // Don't move same image again, instead move back

        currentPhase = undefined;

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