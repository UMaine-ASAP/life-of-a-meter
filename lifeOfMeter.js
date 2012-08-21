/**
 * Life of a Meter
 *
 * Javascript functionality using the raphael framework
 *
 * Tim Westbaker 8-16-2012
 */


/*************/
/* Globals
/*************/
var activeNode = null; 	// the "active" node -- the one in the center of the screen

var nodeObjects = []; 	// Stores references to nodes in visualization

var xmlData; 			// xml data storing data
var paper; 				// Raphael.js object
var currentPhase; 		// Phase currently selected. Undefined otherwise.
var transparencyMask;	// Raphael transparency object used to hide the rest of the screen when an object has been selected


var phaseNodeGroup;
var departmentNodeGroup;
var jobpositionNodeGroup;

/*************/
/* Helper Functions
/*************/
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

$(document).ready(function(){
	
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

    		loadDefaultDescriptionBox();
    	}
	});

	/*************/
	/* Initialization
	/*************/

	//Raphael Setup
	paper = Raphael("container", "100%", "100%"); // Set canvas to fullscreen - requires waiting for document.ready
	nodeSystem.setCanvas(paper);

	// Create transparency layer
	transparencyMask = paper.rect(0,0, "100%", "100%");

	transparencyMask.attr({'fill': '#333', 'opacity': '0'});
	transparencyMask.hide();
	transparencyMask.click( closePhase );

	nodeSystem.setBottomLayer(transparencyMask);

	// Create default images at starting locations
	paper.image("images/overview.png", 0, 0, 1024, 798);

	var phases = [];

	var xOffset = -211;
	var yOffset = -170;

	 var phaseData = [	
		{
		 src: 'nDesignSpecs.png', 
		 x: 223,
		 y: 295,
		 width: 230,
		 height: 200
		},
		{
		 src: 'nPurchaseApproval.png', 
		 x: 451,
		 y: 296,
		 width: 231,
		 height: 191
		},
		{
		 src: 'nPurchaseOrder.png', 
		 x: 638,
		 y: 299,
		 width: 96,
		 height: 181
		},
		{
		 src: 'nReceiveMeters.png', 
		 x: 733,
		 y: 311,
		 width: 228,
		 height: 163
		},
		{
		 src: 'nDelivery.png', 
		 x: 641,
		 y: 556,
		 width: 242,
		 height: 134
		},
		{
		 src: 'nMeterInstall.png', 
		 x: 232,
		 y: 538,
		 width: 349,
		 height: 217
		},
	 	{
		 src: 'nAMITrouble.png', 
		 x: 260,
		 y: 768,
		 width: 240,
		 height: 182
		},
		{
		 src: 'nMaintenance.png', 
		 x: 534,
		 y: 809,
		 width: 101,
		 height: 124
		},
		{
		 src: 'nTesting.png', 
		 x: 796,
		 y: 792,
		 width: 82,
		 height: 120
		},
		{
		 src: 'nRetire.png',
		 x: 1153,
		 y: 772,
		 width: 81,
		 height: 134
		},
	];

	for(var i=0; i<phaseData.length; i++) {
		var phaseAttr = phaseData[i];
		phases.push( new Phase(i + 1, "images/" + phaseAttr.src, phaseAttr.x + xOffset, phaseAttr.y + yOffset, phaseAttr.width, phaseAttr.height, phaseClick) );
	}

}); // End $(document).ready


/**
 * Load Default Description Box
 *
 * Replaces the description box with the initial description data
 *
 * @return void
 */
function loadDefaultDescriptionBox() {
	// var instructions = $(xmlData).children('lifeOfMeter').children('instructions');

	// var header 		= instructions.attr('name');
	// var description = instructions.children('description').text();
	$('#description-box').css('display','none');
//	setDescriptionBox(header, description);
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

/**
 * Close Phase
 *
 * Removes currently displayed phase and returns app to its start state
 *
 * @return void
 */
function closePhase() {

	console.log("closing phase");

	// hide transparency mask
	transparencyMask.animate({'opacity': 0.0}, 500, 'linear');
	transparencyMask.hide();

	//destroy nodes
	nodeSystem.removeAllNodeGroups();

	// Reset box
	loadDefaultDescriptionBox();

	// Move old image back
	if( currentPhase != undefined) {
		currentPhase.moveToOrigin();
	}
	currentPhase = undefined;
}

function phaseClick(phase) {
        // Make sure there isn't something already in the center or not located in left
        if( currentPhase && !( currentPhase && phase.location == 'left') ) return;

        // In left
        if( currentPhase && phase.location == 'left') {
			// Remove old nodes            
            nodeSystem.removeNodeGroup( departmentNodeGroup );
            nodeSystem.removeNodeGroup( jobpositionNodeGroup );

            var departmentNames = data_mapNameToArray( data_getDepartments(currentPhase.id) );

            departmentNodeGroup = nodeSystem.createNodeGroup(departmentNames, 'alignVertical', onClick_Department_Node, {type: 'center', xOffset: currentPhase.width/2 + 50}, 'animateFromCenter');

			/** Load description box */
			var phaseData  	 = data_getPhase(currentPhase.id);
			var phaseDetails = data_getDetails(phaseData);

			setDescriptionBox(phaseDetails.name, phaseDetails.description);


        	// Move back to center
	        phase.moveToCenter( function() { 
	            nodeSystem.connectNodesBetweenGroups(phaseNodeGroup, departmentNodeGroup);
    	        currentPhase.toFront();
			});

            return;
        }

        // No phase loaded. Load selected phase
        currentPhase = phase;

        // Animate image to center of page
        phase.moveToCenter( function() { openPhase(phase); });
}


/*************************/
/* Data Access
/*************************/
function data_getPhase(phaseID) {
	return $(xmlData).children('lifeOfMeter').children('phases').find("phase[order='" + phaseID + "']");
}

function data_getDepartments(phaseID) {
	var phase = data_getPhase(phaseID);
	return phase.find('department');
}

function data_getDepartment(phaseID, department) {
	var phase = data_getPhase(phaseID);
	return phase.children('departments').children("department[name='" + department + "']");
}

function data_getJobPositions(phaseID, department) {
	var department = data_getDepartment(phaseID, department);
	return department.find('positions');	
}

function data_getDetails(xml_object) {
	return {
			'description': xml_object.children('description').text(),
			'name': 	xml_object.attr('name'),
	};
}

function data_mapNameToArray(xml_objects) {
	var result = [];
	xml_objects.each( function() {
		result.push( $(this).attr('name') );
	});
	return result;
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
    console.log("loading phase with ID: " + phaseID);

	// Order objects
	transparencyMask.toFront();
	currentPhase.toFront();

	// Display transparency
	transparencyMask.show();
	transparencyMask.animate({'opacity': 0.8}, 500, 'linear');

	/** Load description box */
	var phaseData 	 = data_getPhase(phaseID);
	var phaseDetails = data_getDetails(phaseData);

	setDescriptionBox(phaseDetails.name, phaseDetails.description);

	/** Load Department Names */
	departmentNames = data_mapNameToArray( data_getDepartments(phaseID) );

	// Create node for image
	phaseNodeGroup = nodeSystem.createNodeGroupFromNodes([currentPhase.node] );//nodeSystem.createNodeGroup([''], 'alignVertical', undefined, {});

	departmentNodeGroup = nodeSystem.createNodeGroup(departmentNames, 'alignVertical', onClick_Department_Node, {type: 'center', xOffset: currentPhase.width/2 + 50}, 'animateFromCenter');


	nodeSystem.connectNodesBetweenGroups(phaseNodeGroup, departmentNodeGroup);

 	// Put phase on front
	currentPhase.toFront();

	activeNode = currentPhase.node;

} // End load Data and nodes


function onClick_Department_Node(node) {
	// don't process the same node twice!
	if( activeNode == node ) return;
	activeNode = node;

	console.log("node clicked! " + node.contents);

	/** Load description box */
	var department 	 	  = data_getDepartment(currentPhase.id, node.contents);
	var departmentDetails = data_getDetails(department);

	setDescriptionBox(departmentDetails.name, departmentDetails.description);


	// Move current phase and nodeGroup to left column
	currentPhase.moveToLeft( function() {
			//currentPhase.connectNode(node);
			nodeSystem.connectNodesBetweenGroups(phaseNodeGroup, departmentNodeGroup);
			nodeSystem.connectNodesBetweenGroups(departmentNodeGroup, jobpositionNodeGroup);	

    	    currentPhase.toFront();
	});

	// Move right column to center
	var screenDim = getScreenDimensions();

	nodeSystem.removeAllButInGroup(departmentNodeGroup, node);	
	nodeSystem.animateNodesInGroup(departmentNodeGroup, screenDim.width/2, screenDim.height/2);

	// Create next group
	var jobPositions = data_getJobPositions(currentPhase.id, department.id);
	jobpositionNodeGroup = nodeSystem.createNodeGroup(jobPositions, 'alignVertical', onClick_JobPosition_Node,  {type: 'center', xOffset: currentPhase.width/2 + 50 + 100 + 50}, 'animateFromCenter');

	// create lines again

}

function onClick_JobPosition_Node(node) {
	// don't process the same node twice!
	if( activeNode == node ) return;
	activeNode = node;


}



/**
 * Load Department Employees
 *
 * Loads and displays nodes underneath a particular department
 *
 * @param 	string 		department 		The department to find and display
 *
 * @return 	void
 */


