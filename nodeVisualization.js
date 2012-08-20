var nodeSystem = {};

(function() {
	var defaultCircleAttrs = {'fill': '#77C4D3', 'stroke': '#DAEDE2', 'stroke-width': 5};

	function node(x, y, size, text) {
		this.x = x; //the center X position of the node
		this.y = y; //the center Y position of the node
		this.size = size; //the diameter of the node
		this.contents = text; //the text contents of the node, so that you don't have to go node.text.attrs.blahblahblah.text
		this.defaultAnimationDuration = 250; //default animation duration in ms
		this.connectingLines = [];

		//check to make sure that the nodeSystem has been initialized before making a node
		if (nodeSystem._mainCanvas != undefined || nodeSystem._mainCanvas != null) {
			this.canvas = nodeSystem._mainCanvas;
		}
		else {
			//and if it isn't, create and throw an error
			throw {
				name: "Invalid state",
				message: "Cannot create node while mainCanvas is not set"
			}
		}

		//start by drawing the circle, then the text (so that the text appears on top of the circle)
		this.circle = this.canvas.ellipse(this.x, this.y, this.size, this.size);

		//set the circle's attributes to the default
		this.circle.attr(defaultCircleAttrs);

		//draw the text (after the circle, so that it appears on top of it)
		this.text = this.canvas.text(this.x, this.y, this.contents);

		//function that animates the node from one position to another
		this.animateTo = function(cx, cy) {
			var nodesToConnect = [];

			for (var i = 0; i < this.connectingLines.length; i++) {
				var x = this.connectingLines[i];

				var connectedNode = x[0];
				var connectedPath = x[1];

				//fade out the line
				connectedPath.animate({opacity: 0}, this.defaultAnimationDuration, 'easeOut');
				nodesToConnect.push(connectedNode);

				this.connectingLines.splice(this.connectingLines.indexOf(x), 1); //remove that connection from connectingLines
				connectedNode.connectingLines.splice(nodeSystem.getIndexOfNode(this, connectedNode.connectingLines), 1); //remove it from the other node's connectingLines as well
			}

			this.circle.animate({cx: cx, cy: cy}, this.defaultAnimationDuration, 'easeOut');
			this.text.animate({x: cx, y: cy}, this.defaultAnimationDuration, 'easeOut');
			
			this.x = cx;
			this.y = cy;

			for (var i = 0; i < nodesToConnect.length; i++) {
				nodeSystem.connectNodes(this, nodesToConnect[i]);
			}
		}
	}

	nodeSystem = {
		setCanvas: function(canvas) {
			this._mainCanvas = canvas;
		},

		createNode: function(x, y, size, text) {
			var newNode = new node(x, y, size, text);
			return newNode;
		},

		connectNodes: function(firstNode, secondNode) {
			var pathstring = "M " + firstNode.x + " " + firstNode.y + " L" + secondNode.x + " " + secondNode.y;
			var line = paper.path(pathstring);
			
			firstNode.connectingLines.push([secondNode, line]);
			secondNode.connectingLines.push([firstNode, line]);
			line.toBack();
		},

		getIndexOfNode: function(node, nodePathArray) {
			for (var i = 0; i < nodePathArray.length; i++) {
				if (nodePathArray[i][0] == node) {
					return i;
				}
			}

			return -1;
		}
	}
})();

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

// function createNode(level, nodeName, column) {
// 	// Defaults
// 	var nodeHeight = 50;
// 	var nodeWidth = 100;
// 	var padding = 20;
// 	var paddingBetweenLevels = 100;


// 	var centerX = parseInt($('body').css('width'))  / 2;
// 	var centerY = parseInt($('body').css('height')) / 2;


// 	var nodeLevelXPosition = centerX +  (column - 2) * (currentPhase.image.attrs.width/2 + 50 + paddingBetweenLevels);

// 	var nodeLevelCenter = centerY - nodeHeight / 2;


// 	var nodeProcessedCount = nodeObjects[level].length;
// 	var yDiff = parseInt( (nodeProcessedCount+1) /2) * (nodeHeight*2 + padding);
// 	if( nodeProcessedCount%2 == 0) {
// 		yDiff *= -1;
// 	}

// 	/** Set position **/
// 	var destX = nodeLevelXPosition;
// 	var destY = nodeLevelCenter + yDiff;

// 	/** Create line **/
// 	var line = paper.path("M" + centerX + " " + centerY + "L" + centerX + " " + centerY);
// 	line.attr({'stroke': '#DAEDE2', 'stroke-width': 2 });
// 	line.insertBefore(currentPhase.image);

// 	/** Load text **/
// 	var text = paper.text(centerX, centerY, nodeName);

// 	/** Load Circle **/
// 	var circle = paper.ellipse(centerX, centerY, 50, 50);

// 	// Move line with circle
// 	circle.onAnimation(function () {
// 		paper.getById(this.attrs.line_id).attr({path: "M" + centerX + " " + centerY + "L" + this.attrs.cx + " " + this.attrs.cy });
// 	});

// 	circle.attrs.line_id = line.id;
// 	circle.attrs.text_id = text.id;
// 	circle.attr({'fill': '#77C4D3', 'stroke': '#DAEDE2', 'stroke-width': 5});
// 	circle.insertBefore(text);


// 	// Animate Circle and text
// 	var duration = 250;
// 	circle.animate({cx: destX, cy: destY}, duration, 'easeOut');
// 	text.animate({x: destX, y: destY}, duration, 'easeOut');


// 	/** Add objects to model **/
//        nodeObjects['level1'].push(new nodeObject(circle, text, line, destX, destY));
// }