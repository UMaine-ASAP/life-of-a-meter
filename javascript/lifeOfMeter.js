/**
 * Life of a Meter
 *
 * Visual representation interconnecting Bangor Hydro Electric company's departments through the metaphor of the life cycle of a meter.
 *
 * This file initializes and runs the visualization.
 *
 * @Requires raphael.js
 * @Requires jquery.js
 * @Requires nodeVisualization.js
 * @Requires phase.js
 *
 * @Author Tim Westbaker
 * @Created 8-16-2012
 */


/*****************************************/
/* Globals
/*****************************************/

var paper; 					// Raphael.js object

// Data
var xmlData; 				// xml data storing data

// Objects
var transparencyMask;		// Raphael transparency object used to hide the rest of the screen when an object has been selected
var allPhases; 				// All phases

// Node groups
var phaseNodeGroup;
var departmentNodeGroup;
var jobpositionNodeGroup;

// Selected nodes
var activePhase; 			// Phase currently selected. Undefined otherwise.
var activeDepartmentNode;  	// Department currently selected. Undefined otherwise.
var activeJobPositionNode; 	// Job Position currently selected. Undefined otherwise.
var activeNode; 			// the "active" node -- the one in the center of the screen

var animation_speed = 0;


/*****************************************/
/* Helper Functions
/*****************************************/

function getScreenDimensions() {
	var width  = parseInt( $('body').css('width') );
	var height = parseInt( $('body').css('height') );

	return {'width': width, 'height': height};	
}

// Array Remove - By John Resig (MIT Licensed)
Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};


// Implement index of, especially for IE
if (!Array.prototype.indexOf) { 
    Array.prototype.indexOf = function(obj, start) {
         for (var i = (start || 0), j = this.length; i < j; i++) {
             if (this[i] === obj) { return i; }
         }
         return -1;
    }
}

/*****************************************/
/* Setup
/*****************************************/

$(document).ready(function(){
	
	/*************/
	/* Read remote xml
	/*************/
	// $.ajax({
 //    	type: "GET",
 //    	url: "data.xml",
 //    	dataType: "xml",
 //    	success: function(xml){     		
 //    		xmlData = xml;

 //    	}
	// });

	$.ajax({
		url: 'data.php',
		dataType: 'xml'
	}).success(function(xml) {
		log("Loaded xml data from server");
		xmlData = xml;
		log(xml);
		loadDefaultDescriptionBox();
	}).fail(function(msg) {
		log("data load failed: " + msg);
	});


	/*************/
	/* Initialization
	/*************/

	/** Raphael Setup */
	paper = Raphael("container", "100%", "100%"); // Set canvas to fullscreen - requires waiting for document.ready

	/** Create transparency layer */
//	transparencyMask = paper.rect(0,0, "100%", "100%");
	transparencyMask = paper.image("images/transparent_mask.png", 0, 0, 1000, 773);
//	transparencyMask.attr({'fill': '#333', 'opacity': '0'});
	transparencyMask.hide();
	transparencyMask.click( closePhase );

	/** Initialize node system */
	nodeSystem.setCanvas(paper);
	nodeSystem.setBottomLayer(transparencyMask);

	/** Create default images at starting locations */

	// Set big picture at bottom
	paper.image("images/overview.png", 0, 0, 1000, 773);


	// Set default phases and positions
	var scale = 1;//8346 × 6445
	var phaseData = [	
			{ src: 'map/subregions-01.png',  alt_img: 'Smart Meter Step by Step (design Specs).JPG', alt_image_aspect: 2472 / 800, id: 1,  x: -103.5, y: 9, width: 229,  height: 200 },
			{ src: 'map/subregions-02.png',  alt_img: '', alt_image_aspect: 0, id: 2,  x: 124,  y: 9, width: 296,  height: 200 },
			{ src: 'map/subregions-03.png',  alt_img: 'Meter (receive meters.modules).jpg', alt_image_aspect: 2048/1536, id: 3,  x: 462,  y: 9, width: 432,  height: 200 },

			{ src: 'map/subregions-04.png',  alt_img: '', alt_image_aspect: 0, id: 4,  x: 327,  y: 216, width: 456, height: 187 },
			{ src: 'map/subregions-05.png',  alt_img: '', alt_image_aspect: 0, id: 5,  x: -100.5,    y: 217, width: 393, height: 209 },

			{ src: 'map/subregions-06.png',  alt_img: '', alt_image_aspect: 0, id: 6,  x: 43.5,  y: 442, width: 345, height: 254 },
	 	 	{ src: 'map/subregions-07.png',  alt_img: '', alt_image_aspect: 0, id: 7,  x: 461,  y: 460, width: 264, height: 198 },
	 	 	{ src: 'map/subregions-08.png',  alt_img: '', alt_image_aspect: 0, id: 8,  x: 760,  y: 547, width: 123, height: 145 }

	 	 	/*** Image transparencies ***/
			// { src: 'map/transparent-with-border.png',  alt_img: 'Smart Meter Step by Step (design Specs).JPG', alt_image_aspect: 2472 / 800, id: 1,  x: 0,    y: 68, width: 184,  height: 156 },
			// { src: 'transparent-with-border.png',  alt_img: '', alt_image_aspect: 0, id: 2,  x: 182,  y: 68, width: 227,  height: 156 },
			// { src: 'transparent-with-border.png',  alt_img: 'Meter (receive meters.modules).jpg', alt_image_aspect: 2048/1536, id: 3,  x: 439,  y: 68, width: 353,  height: 156 },
			// { src: 'transparent-with-border.png',  alt_img: '', alt_image_aspect: 0, id: 4,  x: 341,  y: 231, width: 414, height: 156 },
			// { src: 'transparent-with-border.png',  alt_img: '', alt_image_aspect: 0, id: 5,  x: 0,    y: 231, width: 310, height: 165 },
			// { src: 'transparent-with-border.png',  alt_img: '', alt_image_aspect: 0, id: 6,  x: 120,  y: 410, width: 269, height: 202 },
	 	//  	{ src: 'transparent-with-border.png',  alt_img: '', alt_image_aspect: 0, id: 7,  x: 447,  y: 429, width: 213, height: 154 },
	 	//  	{ src: 'transparent-with-border.png',  alt_img: '', alt_image_aspect: 0, id: 7,  x: 677,  y: 482, width: 114, height: 130 }

			// { src: 'nMaintenance.png',  	id: 8,  x: 534,  y: 809, width: 101, height: 124 },
			// { src: 'nTesting.png',  		id: 9,  x: 796,  y: 792, width: 82,  height: 120 },
			// { src: 'nRetire.png', 			id: 10, x: 1153, y: 772, width: 81,  height: 134 }
		];

	allPhases = [];
	xOffset = 103.5;
	yOffset = 76.55;
	for(var i=0; i<phaseData.length; i++) {
		var phaseAttr = phaseData[i];
		allPhases.push( new Phase(phaseAttr.id, "images/" + phaseAttr.src, phaseAttr.x+xOffset, phaseAttr.y+yOffset, phaseAttr.width, phaseAttr.height, "images/alt/" + phaseAttr.alt_img, phaseAttr.alt_image_aspect, phaseClick) );
	}

}); // End $(document).ready


/*****************************************/
/* App Logic
/*****************************************/


/*************/
/* App Logic - Helpers
/*************/

/**
 * Load Default Description Box
 *
 * Replaces the description box with the initial description data
 *
 * @return void
 */
function loadDefaultDescriptionBox() {
	$('#description-box').css('display','none');
}


/**
 * Set Description Box
 *
 * Changes the description box title and description to the values set
 *
 * @param 	string 	title 			Display title
 * @param 	string	description 	Display description
 *
 * @return 	void
 */
function setDescriptionBox(title, description) {
	$('#description-box').css('display','block');

	$('#description-title').html( title );
	$('#description-content').html( description );
}


/*************/
/* App Logic - Controllers
/*************/


/**
 * Close Phase
 *
 * Removes currently displayed phase and returns app to its start state
 *
 * @return void
 */
function closePhase() {
	// hide transparency mask
	//transparencyMask.animate({'opacity': 0.0}, 500, 'linear');
	transparencyMask.hide();

	//destroy nodes
	nodeSystem.removeAllNodeGroups();

	// Reset box
	loadDefaultDescriptionBox();

	// Move old image back
	if( activePhase != undefined) {
		activePhase.moveToOrigin();
	}

	activePhase 		= undefined;
	activeDepartmentNode 	= undefined;
	activeJobPositionNode 	= undefined;
}


/**
 * Phase Click
 *
 * Called when a phase is clicked.
 *
 * If there is no active phase, loads the phase. Otherwise if the phase is not in the center, returns to the center.
 *
 * @param object 	phase 	The phase clicked on
 *
 * @return void
 */
function phaseClick(phase) {
    // There is an active phase and it is not in the center
	if ( !activePhase && phase.location == 'origin') {
    	// No phase loaded. Load selected phase
    	activePhase = phase;

    	// Animate image to center of page
	    phase.moveToCenter( function() { openPhase(phase); });

    } else if( activePhase && phase.location != 'center') {
		// Remove old nodes            
		activeDepartmentNode  = undefined;
		activeJobPositionNode = undefined;

        nodeSystem.removeNodeGroup( departmentNodeGroup );
        nodeSystem.removeNodeGroup( jobpositionNodeGroup );

        var departmentNames = data_mapNameToArray( data_getDepartments(activePhase.id) );

        departmentNodeGroup = nodeSystem.createNodeGroup(departmentNames, 'alignVertical', DepartmentNodeClick, {type: 'center', xOffset: activePhase.width/2 + 50}, 'animateFromCenter');

		/** Load description box */
		var phaseData  	 = data_getPhase(activePhase.id);
		var phaseDetails = data_getDetails(phaseData);

		setDescriptionBox(phaseDetails.name, phaseDetails.description);


    	// Move back to center
	    phase.moveToCenter( function() { 
	        nodeSystem.connectNodesBetweenGroups(phaseNodeGroup, departmentNodeGroup);
            activePhase.toFront();
		});

    }
}


/**
 * Open Phase
 *
 * Loads and displays newly selected phase
 *
 * @param 	object 		phase 		The phase object to load
 *
 * @return 	void
 */
function openPhase(phase) {
	var phaseID = phase.id;		
	// Order objects
	transparencyMask.toFront();
	activePhase.toFront();

	// Display transparency
	transparencyMask.show();
//	transparencyMask.animate({'opacity': 0.8}, 500, 'linear');

	/** Load description box */
	var phaseData 	 = data_getPhase(phaseID);
	var phaseDetails = data_getDetails(phaseData);

	setDescriptionBox(phaseDetails.name, phaseDetails.description);

	/** Load Department Names */
	departmentNames = data_mapNameToArray( data_getDepartments(phaseID) );

	// Create node for image
	phaseNodeGroup = nodeSystem.createNodeGroupFromNodes([activePhase.node] );

	departmentNodeGroup = nodeSystem.createNodeGroup(departmentNames, 'alignVertical', DepartmentNodeClick, {type: 'center', xOffset: activePhase.width/2 + 50}, 'animateFromCenter');


	nodeSystem.connectNodesBetweenGroups(phaseNodeGroup, departmentNodeGroup);

 	// Put phase on front
	activePhase.toFront();

	activeNode = activePhase.node;

} // OpenPhase


/**
 * Department Node Click
 *
 * When clicking a department, load department and shift nodes around
 * 
 * @param object 	node 	The clicked node
 *
 * @return void
 */
function DepartmentNodeClick(node) {
	// don't process the same node twice!
	if( activeNode == node ) return;
	activeNode = node;
	activeDepartmentNode = node;
log(node.contents);
	/** Load description box */
	var department 	 	  = data_getDepartment(activePhase.id, node.contents);
	var departmentDetails = data_getDetails(department);

	setDescriptionBox(departmentDetails.name, departmentDetails.description);


	/** Move center to left column */
	activePhase.moveToLeft( function() {
			nodeSystem.removeAllConnections(phaseNodeGroup);
			activePhase.connectNode(node);
			nodeSystem.connectNodesBetweenGroups(phaseNodeGroup, departmentNodeGroup);
			nodeSystem.connectNodesBetweenGroups(departmentNodeGroup, jobpositionNodeGroup);

    	    activePhase.toFront();
	});

	/** Move right column to center */
	var screenDim = getScreenDimensions();

	nodeSystem.removeAllButInGroup(departmentNodeGroup, node);
	nodeSystem.animateNodesInGroup(departmentNodeGroup, screenDim.width/2, screenDim.height/2);

	/** Right Column */
	if( activeJobPositionNode ) {
		activeJobPositionNode = null;
		nodeSystem.removeNodeGroup(jobpositionNodeGroup);
	}
	var data = data_getJobPositions(activePhase.id, node.contents);
	var jobPositions = data_mapNameToArray( data );

	jobpositionNodeGroup = nodeSystem.createNodeGroup(jobPositions, 'alignVertical', JobPositionNodeClick,  {type: 'center', xOffset: activePhase.width/2 + 50 + 100 + 50}, 'animateFromCenter');

}


/**
 * Job Position Node Click
 *
 * When clicking a job position node, load job position and shift nodes around
 * 
 * @param object 	node 	The clicked node
 *
 * @return void
 */
function JobPositionNodeClick(node) {
	// don't process the same node twice!
	if( activeNode == null ) return;
	activeNode = node;
	activeJobPositionNode = node;

	var screenDim = getScreenDimensions();

	/** Load description box */
	var position 	 	  = data_getJobPosition(activePhase.id, activeDepartmentNode.contents, node.contents);
	var positionDetails   = data_getDetails(position);

	setDescriptionBox(positionDetails.name, positionDetails.description);	

	/** Move Left column to origin */
	nodeSystem.removeAllConnections(phaseNodeGroup);
	activePhase.moveToOrigin();
	//activePhase.behindObject(transparencyMask);
	activePhase.afterObject(transparencyMask);

	/** Move Center column to left */
	nodeSystem.animateNodesInGroup(departmentNodeGroup, screenDim.width/2 - 300, 'keep');	

	/** Move right column to center */
	var screenDim = getScreenDimensions();

	nodeSystem.removeAllButInGroup(jobpositionNodeGroup, node);
	nodeSystem.animateNodesInGroup(jobpositionNodeGroup, screenDim.width/2, screenDim.height/2);

	// There is no right column
}


/*************/
/* App Logic - Data
/*************/
function cleanName(text)
{
	return text.replace("\n", "");
}

function data_getPhase(phaseID) {
	return $(xmlData).children('lifeOfMeter').children('phases').find("phase[order='" + phaseID + "']");
}

function data_getDepartments(phaseID) {
	var phase = data_getPhase(phaseID);
	return phase.find('department');
}

function data_getDepartment(phaseID, department) {
	department = cleanName(department);
	var phase = data_getPhase(phaseID);
	return phase.children('departments').children("department[name='" + department + "']");
}

function data_getJobPositions(phaseID, department) {
	var department = data_getDepartment(phaseID, department);
	return department.find('position');	
}

function data_getJobPosition(phaseID, department, position) {
	var department = data_getDepartment(phaseID, department);
	return department.children('positions').children("position[name='" + position + "']");
}

// Get description and name for specific, singular data object (phase, department, or job position)
function data_getDetails(xml_object) {
	return {
			'description': xml_object.children('description').text(),
			'name': 	xml_object.attr('name')
	};
}

function data_mapNameToArray(xml_objects) {
	var result = [];
	xml_objects.each( function() {
		result.push( $(this).attr('name') );
	});
	return result;
}
