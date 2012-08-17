/**
 * Life of a Meter
 *
 * Javascript functionality using the raphael framework
 *
 * Tim Westbaker 8-16-2012
 */
$(document).ready( function() {

	/*************/
	/* Globals
	/*************/
    var activeNode = null; // the "active" node -- the one in the center of the screen

	var nodeObjects = []; // Stores references to nodes in visualization

	var xmlData; // xml data storing data

	var currentPhase; // Phase currently selected. Undefined otherwise

	// Store phase information
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
    	}
	});


	/*************/
	/* Raphael Setup
	/*************/

	var paper = Raphael("container", "100%", "100%"); // Set canvas to fullscreen

	// Create transparency layer
	var transparencyMask = paper.rect(0,0, "100%", "100%");
	transparencyMask.attr({'fill': 'EFEFEF', 'opacity': '0'});
	transparencyMask.hide();

	transparencyMask.click( function() {
		hideTransparency();

		// Move old image back
		if( currentPhase != undefined) {
			currentPhase.moveBack();
		}
		currentPhase = undefined;

	});
	/*************/
	/* Create default images
	/*************/

	var phases = [];

	phases.push( new Phase(1, "images/Truck.JPG", 10, 10, 250, 200) );
	phases.push( new Phase(2, "images/Truck.JPG", 400, 10, 250, 200) );
	phases.push( new Phase(3, "images/Truck.JPG", 800, 100, 250, 200) );


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


	function loadData(phaseID, phase) {
		if( currentPhase) return;

		// Store current values
		currentPhase = phase;

		//animate current image to center of page
		var destx = parseInt($('body').css('width'))  / 2 - img.attrs.width/2;
		var desty = parseInt($('body').css('height')) / 2 - img.attrs.height/2;

		img.animate({x: destx, y: desty}, 500, 'easeOut', function() {
			loadPhase(phaseID);
		});
		displayTransparency();

		// Order objects
		transparencyMask.toFront();
		img.toFront();

	}

	// Load data
	function loadPhase(phaseID) {
        console.log("loading phase with ID: " + phaseID);

		var phase = $(xmlData).children('lifeOfMeter').children('phases').find("phase:nth-child(" + phaseID + ")");

		/** Load description box */
		var phaseDescription = phase.children('description').text();
		var phaseName = phase.attr('name');

		$('#description-header').html(phaseName);
		$('#description-content').html(phaseDescription);


		// Position next level of nodes to right

		/** Load nodes */
		var nodes = phase.find('department');
		console.log(nodes);

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


		var nodeLevelXPosition = centerX +  (column - 2) * (currentPhase.image.attrs.width/2 + 50 + paddingBetweenLevels);

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
		line.insertBefore(currentPhase.image);

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


		// Animate Circle and text
		var duration = 250;
		circle.animate({cx: destX, cy: destY}, duration, 'easeOut');
		text.animate({x: destX, y: destY}, duration, 'easeOut');


		/** Add objects to model **/
        nodeObjects['level1'].push(new nodeObject(circle, text, line, destX, destY));
	}

}); // End document.ready

