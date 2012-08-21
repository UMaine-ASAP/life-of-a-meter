var nodeSystem = {};

(function() {

	function graphNode(contents) {
		this.contents = contents;
		this.edgesFrom = [];
		this.edgesTo = [];
	}

	function connectNodes(fromNode, toNode) {
		if (fromNode.edgesTo.indexOf(toNode) != -1) {
			fromNode.edgesTo.push(toNode);
			toNode.edgesFrom.push(fromNode);
		}
	}

	var defaultCircleAttrs = {'fill': '#77C4D3', 'stroke': '#DAEDE2', 'stroke-width': 5};

	function node(x, y, size, text, callback) {
		this.x = x; //the center X position of the node
		this.y = y; //the center Y position of the node
		this.size = size; //the diameter of the node
		this.contents = text; //the text contents of the node, so that you don't have to go node.text.attrs.blahblahblah.text
		this.defaultAnimationDuration = 400; //default animation duration in ms
		this.connectingLines = [];
		this.clickCallback = callback;

		var thisNode = this;

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

		this.toFront = function() {
			this.circle.toFront();
			this.text.toFront();
		};

		//function that animates the node from one position to another
		this.animateTo = function(cx, cy) {
			var nodesToConnect = [];
			var indexesToRemove = [];
			var targetIndexesToRemove = [];

			if (this.connectingLines.length > 0) {

				for (var i = 0; i < this.connectingLines.length; i++) {
					var x = this.connectingLines[i];

					var connectedNode = x[0];
					var connectedPath = x[1];

					//fade out the line
					connectedPath.remove();

					nodesToConnect.push(connectedNode);
					indexesToRemove.push(this.connectingLines.indexOf(x));
					targetIndexesToRemove.push([connectedNode, nodeSystem.getIndexOfNode(this, connectedNode.connectingLines)]);
				}



				var newConnections = [];
				for (var i = 0; i < this.connectingLines.length; i++) {
					if (indexesToRemove.indexOf(i) != -1) {
						continue;
					}

					newConnections.push(this.connectingLines[i]);
				}

				var targetNewConnections = [];
				for (var i = 0; i < connectedNode.connectingLines.length; i++) {
					if (targetIndexesToRemove.indexOf(i) != -1) {
						continue;
					}
					targetNewConnections.push(connectedNode.connectingLines[i]);
				}

				this.connectingLines = newConnections;
				connectedNode.connectingLines = targetNewConnections;
			}
	


			this.circle.animate({cx: cx, cy: cy}, this.defaultAnimationDuration, 'easeOut');
			this.text.animate({x: cx, y: cy}, this.defaultAnimationDuration, 'easeOut');
			
			this.x = cx;
			this.y = cy;

			for (var i = 0; i < nodesToConnect.length; i++) {
				nodeSystem.connectNodes(this, nodesToConnect[i]);
			}
		};

		this.onClick = function() {
			if(thisNode.clickCallback)
				thisNode.clickCallback( thisNode );
		};

		this.circle.click( thisNode.onClick );
		this.text.click( thisNode.onClick );

		this.remove = function() {
			// removing connecting lines
			for (var i = 0; i < this.connectingLines.length; i++) {
				this.connectingLines[i][1].remove();
			}			
			// remove objects
			this.circle.remove();
			this.text.remove();
		}
	}

	nodeSystem = {
		nodeGroups: [],
		bottomLayer: undefined,

		setBottomLayer: function(object) {
			this.bottomLayer = object;
		},

		setCanvas: function(canvas) {
			this._mainCanvas = canvas;
		},

		createNode: function(x, y, size, text, callback) {
			var newNode = new node(x, y, size, text, callback);
			return newNode;
		},

		connectNodes: function(firstNode, secondNode) {
			for (var i = 0; i < firstNode.connectingLines.length; i++) {
				if (firstNode.connectingLines[i][0] == secondNode) {
					return;
				}
			}

			for (var i = 0; i < secondNode.connectingLines.length; i++) {
				if (secondNode.connectingLines[i][0] == firstNode) {
					return;
				}
			}

			var pathstring = "M " + firstNode.x + " " + firstNode.y + " L" + secondNode.x + " " + secondNode.y;
			var line = paper.path(pathstring);


			firstNode.connectingLines.push([secondNode, line]);
			secondNode.connectingLines.push([firstNode, line]);

			var front = paper.set();
			front.push(firstNode.circle, secondNode.circle);
			line.insertAfter(this.bottomLayer);
		},

		getIndexOfNode: function(node, nodePathArray) {
			for (var i = 0; i < nodePathArray.length; i++) {
				if (nodePathArray[i][0] == node) {
					return i;
				}
			}

			return -1;
		},

		getNodeFromGroup: function(group, nodeID) {
			return group[nodeID];
		},

		removeAllNodeGroups: function() {
			var nodeGroupsLength = this.nodeGroups.length;
			console.log("Removing " + nodeGroupsLength + " node groups");
			for(var nodeGroupID=nodeGroupsLength-1; nodeGroupID>=0; nodeGroupID--) {
				this.removeNodeGroup(this.nodeGroups[nodeGroupID]);
			}
		},

		removeNodeGroup: function(nodeGroup) {
			console.log("removing node group: " + nodeGroup);
//			var nodeGroup = this.nodeGroups[nodeGroupID];
			var nodeGroupLength = nodeGroup.length;
			for(var i=nodeGroupLength-1; i>=0; i--) {
				nodeGroup[i].remove();
				nodeGroup.remove(i);
			}
			this.nodeGroups.remove(i);

		},

		createNodeGroupFromNodes: function(nodes) {
			var newNodeGroupID = this.nodeGroups.length;
			this.nodeGroups.push( nodes );
			return this.nodeGroups[newNodeGroupID];
		},

		createNodeGroup: function(nodeNames, layoutType, callback, layoutAttrs, displayMethod) {
			displayMethod = displayMethod || 'normal';

			// Create new node group
			var newNodeGroupID = this.nodeGroups.length;
			this.nodeGroups.push([]);


			var screenWidth  = parseInt( $('body').css('width') );
			var screenHeight = parseInt( $('body').css('height') );

			// Load default attributes
			switch(layoutType) {
				case 'alignVertical':
				layoutAttrs.xOffset  = layoutAttrs.xOffset  || 0;
				layoutAttrs.yOffset  = layoutAttrs.yOffset  || 0;
				layoutAttrs.yPadding = layoutAttrs.yPadding || 10;
				break;
			}

			// Create nodes
			var node;
			var xPosition;
			var yPosition;
			var nodeNamesLength = nodeNames.length;

			var nodeSize = 50;

			for(var i=0; i< nodeNamesLength; i++) {

				// Set position based on layout type
				switch(layoutType) {
					case 'alignVertical':
						xPosition = screenWidth  / 2 + nodeSize/2 +  layoutAttrs.xOffset;
						var yDiff = i * (nodeSize + layoutAttrs.yPadding);
						if( i % 2 == 1) {
							yDiff = -yDiff - nodeSize - layoutAttrs.yPadding;
						}
						yPosition = screenHeight / 2 + yDiff  + layoutAttrs.yOffset;
					break;

					default:
						xPosition = screenWidth  * Math.random();
						yPosition = screenHeight * Math.random();
					break;
				}

				// Add to group
				switch(displayMethod) {
					case 'animateFromCenter':
						node = this.createNode(screenWidth/2, screenHeight/2, nodeSize, nodeNames[i], callback);
						node.animateTo(xPosition, yPosition);
					break;

					case 'normal':
					default:
						node = this.createNode(xPosition, yPosition, nodeSize, nodeNames[i], callback);
					break;
				}

				this.addNodeToGroup(node, this.nodeGroups[newNodeGroupID]);
			}
			return this.nodeGroups[newNodeGroupID];
		},

		connectNodesBetweenGroups: function(nodeGroup_1, nodeGroup_2) {
//			var nodeGroup_1 = this.nodeGroups[nodeGroupID_1];
			var nodeGroupLength_1 = nodeGroup_1.length;

//			var nodeGroup_2 = this.nodeGroups[nodeGroupID_2];
			var nodeGroupLength_2 = nodeGroup_2.length;
			console.log("attempting connection: nodegroup1-length: " + nodeGroupLength_1 +  " nodegroup2-length: " + nodeGroupLength_2);

			for(var i1=0; i1<nodeGroupLength_1; i1++) {
				for(var i2=0; i2<nodeGroupLength_2; i2++) {
					console.log('connecting nodes node1: ' + nodeGroup_1[i1].contents + " node2: " + nodeGroup_2[i2].contents );
					nodeSystem.connectNodes(nodeGroup_1[i1], nodeGroup_2[i2] );
				}
			}
		},

		removeAllButInGroup: function(nodeGroup, node) {
//			var nodeGroup = this.nodeGroups[nodeGroupID];
			var nodeGroupLength = nodeGroup.length;

			for(var i=nodeGroupLength-1; i>=0; i--) {
				if( node != nodeGroup[i] ) {
					nodeGroup[i].remove();
					nodeGroup.remove(i);

				}
			}
		},

		animateNodesInGroup: function(nodeGroup, destX, destY) {
//			var nodeGroup 		= this.nodeGroups[nodeGroupID];
			var nodeGroupLength = nodeGroup.length;

			for(var i=0; i<nodeGroupLength; i++) {
				var newX = ( destX == 'keep') ? nodeGroup[i].x: destX;
				var newY = ( destY == 'keep') ? nodeGroup[i].y: destY;

				nodeGroup[i].animateTo(newX, newY);
			}
		},

		addNodeToGroup: function(node, nodeGroup) {
			console.log("Adding node " + node + " to nodeGroup " + nodeGroup);
			nodeGroup.push( node );
		},
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
function createLevel(level, nodeNames, column) {
	nodeObjects[level] = [];
	nodeNames.each( function() { 
		createNode(level, $(this).attr('name'), column);
	});		
}