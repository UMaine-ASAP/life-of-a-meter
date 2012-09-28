String.prototype.splice = function(idx, rem, s ) {
    return (this.slice(0, idx) + s + this.slice(idx + Math.abs(rem)));
};


/**
 * Node Visualization
 *
 * Node-based visualization system
 *
 * This file defines the node, nodegroup, and nodeSystem objects. To use, nodeSystem needs to be initialized by calling nodeSystem.setCanvas() passing a reference to a Raphael object.
 *
 * @Requires raphael.js
 * @Requires jquery.js
 *
 * @Author Ross Trundy, Tim Westbaker
 * @Created 8-20-2012
 */

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


	/**
	 * Node
	 *
	 * Creates a node object
	 *
	 * @param 	int 		x 			starting x position
	 * @param 	int 		y 			starting y position
	 * @param 	int 		size 		size of node to create (radius of circle)
	 * @param 	string 		text 		Text to place in node
	 * @param 	function   	callback 	function to call when clicking node
	 *
	 * @return  object 		node
	 */
	var defaultCircleAttrs = {'fill': '#77C4D3', 'stroke': '#DAEDE2', 'stroke-width': 5};
	var defaultNodeSizePadding = 20;
	var nodeMinSize = 30;

	function guessNodeSize(text) {
		var tempText = nodeSystem._mainCanvas.text(0, 0, text);
		var initialSize = (tempText.getBBox().width / 2) + defaultNodeSizePadding;
		tempText.remove();
		return (nodeMinSize > initialSize ? nodeMinSize : initialSize);
	}

	function node(x, y, size, text, callback) {
		this.x = x; //the center X position of the node
		this.y = y; //the center Y position of the node
		var tempText = nodeSystem._mainCanvas.text(0, 0, text);
		this.size = guessNodeSize(text);

		//splits the node's text in half and joins it on a newline if it's unreasonably long
		if (this.size > 50) {
			tempText.remove();
			console.log("size > 100, fixing");
			//hacky fix -- just hyphenate it in the center
			var midSpace = text.length / 2;
			text = text.splice(midSpace, 0, "\n");

			var newTempText = nodeSystem._mainCanvas.text(0, 0, text);
			this.size = (newTempText.getBBox().width / 2) + defaultNodeSizePadding; //we probably won't need to do this more than once
			newTempText.remove();
		}

		tempText.remove();
		this.contents = text; //the text contents of the node, so that you don't have to go node.text.attrs.blahblahblah.text
		this.defaultAnimationDuration = 400; //default animation duration in ms
		this.connectingLines = [];
		this.clickCallback = callback;
		this.userData = {};

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
		this.animateTo = function(cx, cy, callback) {
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

			if (this.userData['physicsBody'] != undefined && this.userData['physicsBody'].m_body != undefined) {
				this.userData['physicsBody'].m_body.SetPosition({x: x, y: y - nodePhysics.worldHeight});
			}
			for (var i = 0; i < nodesToConnect.length; i++) {
				nodeSystem.connectNodes(this, nodesToConnect[i]);
			}

			if (callback != undefined) {
				callback(this);
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
				var thisIndex = nodeSystem.getIndexOfNode(this, this.connectingLines[i][0].connectingLines);

				if (thisIndex == -1) {
					console.log("removing node " + this.contents + ": connection with " + this.connectingLines[i][0].contents + " was not two-way");
					continue;
				}

				this.connectingLines[i][0].connectingLines[thisIndex][1].remove();
				this.connectingLines[i][0].connectingLines.splice(thisIndex, 1);
			}			

			// remove objects
			this.circle.remove();
			this.text.remove();

			nodePhysics.removeNode(this);
		}
	}

	/**
	 * Node System
	 *
	 * Defines the node management system. Used to create nodes, node groups
	 *
	 * Be sure to initialize by calling nodeSystem.setCanvas()
	 */
	nodeSystem = {
		nodeGroups: [],
		bottomLayer: undefined,

		setCanvas: function(canvas) {
			this._mainCanvas = canvas;
		},

		setBottomLayer: function(object) {
			this.bottomLayer = object;
		},

		createNode: function(x, y, size, text, callback) {
			var newNode = new node(x, y, size, text, callback);
			return newNode;
		},

		removeAllConnections: function(nodeGroup) {
			for (var i = 0; i < nodeGroup.length; i++) {
				for (var nodeLineGroup in nodeGroup.connectingLines) {
					nodeLineGroup[1].remove();
				}

				nodeGroup[i].connectingLines = [];
			}
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
			var line = paper.path(pathstring).attr({'stroke-width': 2});


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

		/**************************************************/
		/* Node Group functionality
		/**************************************************/

		/*****/
		/* Initialization
		/*****/
		createNodeGroupFromNodes: function(nodes) {
			var newNodeGroupID = this.nodeGroups.length;
			this.nodeGroups.push( nodes );
			return this.nodeGroups[newNodeGroupID];
		},

		addNodeToPhysics: function(node) {
			nodePhysics.addNode(node);
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
			var lastIReset = 0;
			var currentHeight = 0;
			var currentXOffset = 0;
			var nodeSize = 50;
			var totalNodeHeight = 50;
			var nodeOffsetOnNewColumn = 75;
			var nodeYOffset = 0;
			var resetNodeYOffset = false;

			for(var i=0; i< nodeNamesLength; i++) {
				if (resetNodeYOffset) nodeYOffset = 0;
				totalNodeHeight += nodeSize;



				if (totalNodeHeight > screenHeight - 100) //-100 so that we can give nodes a bit of padding
				{
					totalNodeHeight = 0;
					lastIReset = i;
					currentXOffset += nodeOffsetOnNewColumn;
				}

				if (totalNodeHeight < 100)
				{
					totalNodeHeight = 100;
				}

				// Set position based on layout type
				switch(layoutType) {
					case 'alignVertical':
						xPosition = screenWidth / 2 + nodeSize/2 + layoutAttrs.xOffset + currentXOffset;
						var yDiff = (i - lastIReset) * (nodeSize + layoutAttrs.yPadding);
						if( i % 2 == 1) {
							yDiff = -yDiff - nodeSize - layoutAttrs.yPadding;
						}
						yPosition = screenHeight / 2 + yDiff + layoutAttrs.yOffset + nodeYOffset;

						break;

					default:
						xPosition = screenWidth * Math.random();
						yPosition = screenHeight * Math.random();
						break;
					}

					// Add to group
				switch(displayMethod) {
					case 'animateFromCenter':
						node = this.createNode(screenWidth/2, screenHeight/2, nodeSize, nodeNames[i], callback);

						if (node.size * 2 > nodeOffsetOnNewColumn)
						{							
							nodeOffsetOnNewColumn = 50 + node.size * 2;
							console.log("increasing nodeOffsetOnNewColumn to " + nodeOffsetOnNewColumn);
						}

						totalNodeHeight += node.size;
						node.animateTo(xPosition, yPosition, this.addNodeToPhysics);
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

		/*****/
		/* Manipulate
		/*****/

		addNodeToGroup: function(node, nodeGroup) {
			nodeGroup.push( node );
		},

		animateNodesInGroup: function(nodeGroup, destX, destY) {
			var nodeGroupLength = nodeGroup.length;

			for(var i=0; i<nodeGroupLength; i++) {
				var newX = ( destX == 'keep') ? nodeGroup[i].x: destX;
				var newY = ( destY == 'keep') ? nodeGroup[i].y: destY;

				nodeGroup[i].animateTo(newX, newY);
			}
		},


		/*****/
		/* Access
		/*****/

		getNodeFromGroup: function(group, nodeID) {
			return group[nodeID];
		},

		/*****/
		/* Destruction
		/*****/

		removeAllNodeGroups: function() {
			var nodeGroupsLength = this.nodeGroups.length;
			console.log("Removing " + nodeGroupsLength + " node groups");
			for(var nodeGroupID=nodeGroupsLength-1; nodeGroupID>=0; nodeGroupID--) {
				this.removeNodeGroup(this.nodeGroups[nodeGroupID]);
			}
		},

		removeNodeGroup: function(nodeGroup) {
			console.log("removing node group: " + nodeGroup);

			var nodeGroupLength = nodeGroup.length;
			for(var i=nodeGroupLength-1; i>=0; i--) {
				nodeGroup[i].remove();
				nodeGroup.remove(i);
			}
			this.nodeGroups.remove(i);

		},

		removeAllButInGroup: function(nodeGroup, node) {
			var nodeGroupLength = nodeGroup.length;

			for(var i=nodeGroupLength-1; i>=0; i--) {
				if( node != nodeGroup[i] ) {
					nodeGroup[i].remove();
					nodeGroup.remove(i);

				}
			}
		},

		/*****/
		/* Inter-group functions
		/*****/

		connectNodesBetweenGroups: function(nodeGroup_1, nodeGroup_2) {
			var nodeGroupLength_1 = nodeGroup_1.length;
			var nodeGroupLength_2 = nodeGroup_2.length;

			for(var i1=0; i1<nodeGroupLength_1; i1++) {
				for(var i2=0; i2<nodeGroupLength_2; i2++) {
					nodeSystem.connectNodes(nodeGroup_1[i1], nodeGroup_2[i2] );
				}
			}
		}

	};
})();
