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

	// Create transparency layer
	transparencyMask = paper.rect(0,0, "100%", "100%");

	transparencyMask.attr({'fill': 'EFEFEF', 'opacity': '0'});
	transparencyMask.hide();
	transparencyMask.click( closePhase );

	// Create default images at starting locations
	var phases = [];

	phases.push( new Phase(1, "images/Truck.JPG",  10,  10, 250, 200, openPhase) );
	phases.push( new Phase(2, "images/Truck.JPG", 400,  10, 250, 200, openPhase) );
	phases.push( new Phase(3, "images/Truck.JPG", 800, 100, 250, 200, openPhase) );


}); // End $(document).ready


/**
 * Load Default Description Box
 *
 * Replaces the description box with the initial description data
 *
 * @return void
 */
function loadDefaultDescriptionBox() {
	var instructions = $(xmlData).children('lifeOfMeter').children('instructions');

	var header 		= instructions.attr('name');
	var description = instructions.children('description').text();

	setDescriptionBox(header, description);
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
	for( node in nodeObjects['level1']) {
		nodeObjects['level1'][node].remove();
	}

	// Reset box
	loadDefaultDescriptionBox();

	// Move old image back
	if( currentPhase != undefined) {
		currentPhase.moveToOrigin();
	}
	currentPhase = undefined;
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
	transparencyMask.animate({'opacity': 0.3}, 500, 'linear');

	/** Load description box */
	var phase = $(xmlData).children('lifeOfMeter').children('phases').find("phase:nth-child(" + phaseID + ")");

	var phaseDescription = phase.children('description').text();
	var phaseName = phase.attr('name');

	setDescriptionBox(phaseName, phaseDescription);

	/** Load nodes */
	var nodes = phase.find('department');

	createLevel('level1', nodes, 3); // Position next level of nodes to right

} // End load Data and nodes



/**
 * Load Department Employees
 *
 * Loads and displays nodes underneath a particular department
 *
 * @param 	string 		department 		The department to find and display
 *
 * @return 	void
 */
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

