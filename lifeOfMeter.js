/**
 * Life of a Meter
 *
 * Javascript functionality using the raphael framework
 *
 * Tim Westbaker 8-16-2012
 */

var currentImageOldX;
var currentImageOldY;
var currentImage;
var imagesMoving = 0;

var nodeObjects = [];

var xmlData;

$(document).ready( function() {
	
	/*************/
	/* Read remote xml
	/*************/

	$.ajax({
    	type: "GET",
    	url: "data.xml",
    	dataType: "xml",
    	success: function(xml){ 
    		console.log("loaded xml file");
    		xmlData = xml;
      		// $(xml).find("user").each(function(){
	       //  	var name = $(this).find("name").text();
    	   //  	var email = $(this).find("email").text();
        // 		var phone_number = $(this).find("mobile").text();

	      	// });
    	}
   });
    //the "active" node -- the one in the center of the screen
    var activeNode = null;

	/*************/
	/* Raphael Setup
	/*************/

	// Start raphael full screen
	var paper = Raphael("container", "100%", "100%");

	// Load main images
	var img  = paper.image("images/Truck.JPG", 10, 100, 250, 200);
	var img2 = paper.image("images/Truck.JPG", 400, 10, 250, 200);
	var img3 = paper.image("images/Truck.JPG", 800, 100, 250, 200);

	img.attrs.position = "absolute";
	img2.attrs.position = "absolute";
	img3.attrs.position = "absolute";

	// Create transparency layer
	var transparencyMask = paper.rect(0,0, "100%", "100%");
	transparencyMask.attr({'fill': 'EFEFEF', 'opacity': '0'});
	transparencyMask.hide();

	transparencyMask.click( function() {
		hideTransparency();
		// Move old image back
		if( currentImage != undefined) {
			imagesMoving++;
			img.attrs.z = 1;
			currentImage.animate({x: currentImageOldX, y: currentImageOldY}, 500, 'easeOut', function() { imagesMoving--;} );
		}
		// Don't move same image again, instead move back
		currentImage = undefined;
		currentImageOldX = undefined;
		currentImageOldY = undefined;

	});

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

            if( currentImage != undefined) {
                imagesMoving++;
                img.attrs.z = 1;
                currentImage.animate({x: currentImageOldX, y: currentImageOldY}, 500, 'easeOut', function() { imagesMoving--;} );
            }

            // Don't move same image again, instead move back
            currentImage = undefined;
            currentImageOldX = undefined;
            currentImageOldY = undefined;
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

	img.click(  function() { loadData(1, this); } );
	img2.click( function() { loadData(2, this); } );
	img3.click( function() { loadData(3, this); } );

	function displayTransparency() {
		transparencyMask.show();
		transparencyMask.animate({'opacity': 0.3}, 500, 'linear');
	}

	function hideTransparency() {
		transparencyMask.animate({'opacity': 0.0}, 500, 'linear');
		transparencyMask.hide();

		//destroy nodes
		for( node in nodeObjects['level1']) {
			nodeObjects['level1'][node].remove();
		}

		// Reset box
		$('description-header').html("Life of a Meter");
		$('description-content').html("Click on a phase to learn more"); 

	}


	function loadData(phaseID, img) {
		if( imagesMoving != 0 || currentImage ) return;

		// Store current values
		currentImageOldX = img.attrs.x;
		currentImageOldY = img.attrs.y;
		currentImage = img;

		//animate current image to center of page
		var destx = parseInt($('body').css('width'))  / 2 - img.attrs.width/2;
		var desty = parseInt($('body').css('height')) / 2 - img.attrs.height/2;

		imagesMoving++;
		img.attrs.z = 2;
		img.animate({x: destx, y: desty}, 500, 'easeOut', function() {
			loadPhase(phaseID);
			imagesMoving--;
		});
		displayTransparency();

		// Order objects
		transparencyMask.toFront();
		img.toFront();

	}
		// Load data
	function loadPhase(phaseID) {
        console.log("loading phase with ID: " + phaseID);
		var phase = $(xmlData).find("phase:nth-child(" + phaseID + ")");

		/** Load description box */
		var phaseDescription = phase.children('description').text();
		var phaseName = phase.attr('name');

		$('#description-header').html(phaseName);
		$('#description-content').html(phaseDescription);


		// Position next level of nodes to right

		/** Load nodes */
		var nodes = phase.find('department');

		createLevel('level1', nodes, 3);
	} // End load Data and nodes

    function loadDepartmentEmployees(department) {
        console.log("loading phase employees");
        var employees = null;

        $(xmlData).find("department").each(function() {
           if ($(this).attr("name") == department) {
               console.log("matched " + department);
                employees = $(this).find("employee");
           }
        });

        console.log("count of nodeObjects: " + nodeObjects['level1'].length);

        for (var i = 0; i < nodeObjects['level1'].length; i++) {
            if (nodeObjects['level1'][i] == activeNode) {
                continue;
            }

            nodeObjects['level1'][i].remove();
        }

        createLevel('level1', employees, 3);
    }

	function loadNextLevel() {

	}

	/**
	 * Create Level
	 *
	 * Generates a series of nodes at the same depth
	 *
	 * @param 	level 	string
	 * @param 	nodes 	array
	 * @param 	column 	int 		indicates where the nodes should be placed visibly. 1 indicates far left, 2 center, 3 far right, otherwise nodes are not visible
	 *
	 * @return 	void
	 */
	function createLevel(level, nodes, column) {
		nodeObjects[level] = [];
		nodes.each( function() { 
			createNode(level, $(this).attr('name'), column);
		});		
	}

	function createNode(level, nodeName, column) {
		// Defaults
		var nodeHeight = 50;
		var nodeWidth = 100;
		var padding = 20;
		var paddingBetweenLevels = 100;


		var centerX = parseInt($('body').css('width'))  / 2;
		var centerY = parseInt($('body').css('height')) / 2;

		var nodeLevelXPosition = centerX +  (column - 2) * ( 50 + paddingBetweenLevels);
		var nodeLevelCenter = centerY - nodeHeight / 2;


		var nodeProcessedCount = nodeObjects[level].length;
		var yDiff = parseInt( (nodeProcessedCount+1) /2) * (nodeHeight*2 + padding);
		if( nodeProcessedCount%2 == 0) {
			yDiff *= -1;
		}

		/** Set position **/
		var destX = nodeLevelXPosition;
		var destY = nodeLevelCenter + yDiff;

		/** Create line **/
		var line = paper.path("M" + centerX + " " + centerY + "L" + centerX + " " + centerY);
		line.attr({'stroke': '#DAEDE2', 'stroke-width': 2 });
		line.insertBefore(currentImage);

		/** Load text **/
		var text = paper.text(centerX, centerY, nodeName);

		/** Load Circle **/
		var circle = paper.ellipse(centerX, centerY, 50, 50);

		// Move line with circle
		circle.onAnimation(function () {
			paper.getById(this.attrs.line_id).attr({path: "M" + centerX + " " + centerY + "L" + this.attrs.cx + " " + this.attrs.cy });
		});

		circle.attrs.line_id = line.id;
		circle.attrs.text_id = text.id;
		circle.attr({'fill': '#77C4D3', 'stroke': '#DAEDE2', 'stroke-width': 5});
		circle.insertBefore(text);


       // circle.click(function() {
         //  console.log("clicked circle " + text.attrs.text);
          // circle.animate({cx: centerX, cy: centerY}, 100, 'easeOut');

        //});

		// Animate Circle and text
		var duration = 250;
		circle.animate({cx: destX, cy: destY}, duration, 'easeOut');
		text.animate({x: destX, y: destY}, duration, 'easeOut');

		/** Add objects to model **/
        nodeObjects['level1'].push(new nodeObject(circle, text, line, destX, destY));
	}

}); // End document.ready



