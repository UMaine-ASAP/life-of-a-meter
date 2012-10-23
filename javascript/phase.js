/**
 * Phase Model
 *
 * Data model for phase objects
 *
 * Used in lifeOfMeter.js
 *
 * @Requires raphael.js
 *
 * @Author Tim Westbaker
 * @Created 8-20-2012
 */

function Phase(id, src, x, y, width, height, selectedImage, altImageAspectRatio, clickFunction, hoverFunction) {
	this.id = id;
    this.image = null;
    this._src = src;

	this.image = paper.image(src, x, y, width, height).attr({"cursor":"pointer"});
    this.node  = nodeSystem.createNode(0, 0, 0, '');

    // Used for movement back to origin
    var centerX = parseInt($('body').css('width'))  / 2 - 300*altImageAspectRatio/2;
    var centerY = parseInt($('body').css('height'))  / 2 - 300/2;

	this.originalX = centerX;
	this.originalY = centerY;
    this.location = 'origin'; // One of origin, center, or left

    this.destX = x;
    this.destY = y;

    // create popout image
    this.selectedImage = paper.image(selectedImage, centerX, centerY, 300*altImageAspectRatio, 300);
    this.selectedImage.hide();


	this.width  = this.selectedImage.attrs.width;
	this.height = this.selectedImage.attrs.height;

    // Generate border
    this.border = paper.rect(centerX, centerY, this.width, this.height).attr({ 'stroke': "#0CB260", "stroke-width": 5, 'cursor': 'pointer'});
    this.border.hide();

    // Onclick function
    this.clickFunction = clickFunction;
    this.hoverFunction = hoverFunction;

    // store reference for use in image function calls
    var myself = this; 

  

    /*************/
    /* Order
    /*************/

    this.toFront = function() {
        this.border.toFront();
        this.selectedImage.toFront();
    };

    this.behindObject = function(object) {
        this.selectedImage.insertBefore(object);
        this.border.insertBefore(object);        

    };

    this.afterObject = function(object) {
        this.selectedImage.insertAfter(object);
        this.border.insertAfter(object);
    };


    this.showImage = function() {
        this.selectedImage.show();
        this.border.show();
    };


    this.hideImage = function() {
        this.selectedImage.hide();
        this.border.hide();
    };

    this.useBorder = function(isUsingBorder) {
        if( isUsingBorder ) {
            this.border.attr('stroke-width', 5);
        } else {
            this.border.attr('stroke-width', 0);            
        }
    };

    /*************/
    /* Positioning
    /*************/

    this.moveTo = function(destX, destY, callback) {
        this.destX = destX;
        this.destY = destY;

       this.node.x = destX + this.width/2;
       this.node.y = destY + this.height/2;

        this.toFront(); // Make sure image is above other

        if(animation_speed == -1) {
            this.selectedImage.attr('x', destX);
            this.selectedImage.attr('y', destY);            
            if( callback ) {
                callback(myself);
            }

        } else {
            this.selectedImage.animate({x: destX, y: destY}, animation_speed, 'easeOut', function() {
                if( callback ) {
                callback(myself);
                }
            });
        }
        // just move the image, no callback
        // this.selectedImage.attr('x', destX);
        // this.selectedImage.attr('y', destY);
        
        // if( callback ) {
        //         callback(myself);
        // }

        this.border.attr('x', destX);
        this.border.attr('y', destY);
    };

    this.moveToOrigin = function() {
        this.location = 'origin';
        this.hideImage();
        this.moveTo(this.originalX, this.originalY);
    };

	this.moveToCenter = function(callback) {
		var destX = parseInt($('body').css('width'))  / 2 - this.width/2;
		var destY = parseInt($('body').css('height')) / 2 - this.height/2;

        this.location = 'center';
        this.showImage();
        this.moveTo(destX, destY, callback);

	};

    this.returnFromHiding = function(callback) {
        this.showImage();
        this.moveToLeft(callback);
    };

    this.moveToLeft = function(callback) {
        var destX = parseInt($('body').css('width'))  / 2 - this.width/2 - 200 - this.width/2; // center - 200 - width/2
        var destY = parseInt($('body').css('height')) / 2 - this.height/2;

        this.location = 'left';

        this.moveTo(destX, destY, callback);

    };

    /*************/
    /* Node Support
    /*************/

    this.connectNode = function(node) {
        nodeSystem.connectNodes(this.node, node);
    };

    /*************/
    /* Click & Hover
    /*************/

    this.onClick = function() {
        
        if( myself.clickFunction ) {
            myself.clickFunction(myself);
        }
    };

    this.onHover = function(isEnteringHover) {
        if( myself.hoverFunction ) {
            myself.hoverFunction(myself, isEnteringHover);
        }
    }

    /*************/
    /* Image properties
    /*************/
	this.image.attrs.position = "absolute";
	this.image.click( myself.onClick );
    this.selectedImage.click( myself.onClick );

    this.selectedImage.hover(function() { myself.onHover(true);}, function() { myself.onHover(false);} );

}; // End model Phase
