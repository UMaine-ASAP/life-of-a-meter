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



}); // End document.ready

