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