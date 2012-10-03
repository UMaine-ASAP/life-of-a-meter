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

function Phase(id, src, x, y, width, height, selectedImage, altImageAspectRatio, clickFunction) {
	this.id = id;

	this.image = paper.image(src, x, y, width, height);
    this.node  = nodeSystem.createNode(0, 0, 0, '');

    // Used for movement back to origin
	this.originalX = x;
	this.originalY = y;
    this.location = 'origin'; // One of origin, center, or left

    this.destX = x;
    this.destY = y;

	this.width  = this.image.attrs.width;
	this.height = this.image.attrs.height;

    // Onclick function
    this.clickFunction = clickFunction;

    // store reference for use in image function calls
    var myself = this; 

    // Center Image
//    var centerX = parseInt($('body').css('width'))  / 2 - 300*altImageAspectRatio/2;
//    var centerY = parseInt($('body').css('height'))  / 2 - 300/2;
//    this.selectedImage = paper.image(selectedImage, centerX, centerY, 300*altImageAspectRatio, 300);
//    this.selectedImage.hide();
  

    /*************/
    /* Order
    /*************/

    this.toFront = function() {
        this.image.toFront();
    };

    this.behindObject = function(object) {
        this.image.insertBefore(object);
    };

    this.afterObject = function(object) {
        this.image.insertAfter(object);
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
        this.image.animate({x: destX, y: destY}, 400, 'easeOut', function() {
            if( callback ) {
                callback(myself);
            }
        });
    };

    this.moveToOrigin = function() {
        this.location = 'origin';
        this.moveTo(this.originalX, this.originalY);
    };

	this.moveToCenter = function(callback) {
		var destX = parseInt($('body').css('width'))  / 2 - this.width/2;
		var destY = parseInt($('body').css('height')) / 2 - this.height/2;

        this.location = 'center';
        // this.selectedImage.show();
        // if( callback ) {
        //     callback(myself);
        //             this.selectedImage.toFront();
        // }
        this.moveTo(destX, destY, callback);
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
    /* Click
    /*************/

    this.onClick = function() {
        if( myself.clickFunction ) {
            myself.clickFunction(myself);
        }
    };

    /*************/
    /* Image properties
    /*************/
	this.image.attrs.position = "absolute";
	this.image.click( myself.onClick );

}; // End model Phase
