var departments;
var phases;
var jobs;
var departmentPhases;

$.ajax({
	url: 'fetchdepartments.php'
}).success(function(data) {
	console.log("DEPARTMENTS");
	departments = eval("(" + data + ")");
	console.log(departments);
	loadPhases();
});

var loadPhases = function()
{
	$.ajax({
		url: 'fetchphases.php'
	}).success(function(data) {
		phases = eval("(" + data + ")");
		console.log("PHASES");
		console.log(phases);
		loadJobs();
	});
}

var loadJobs = function()
{
	$.ajax({
		url: 'fetchjobs.php'
	}).success(function(data) {
		console.log("JOBS");
		jobs = eval("(" + data + ")");
		console.log(jobs);
		buildRelations();
	});
}

//associate departments with phases
var buildRelations = function() 
{
	departmentPhases = [];

	for (var h = 0; h < departments.length; h++)
	{
		var departmentObject = departments[h];
		var phaseID = departmentObject['phase_id'];

		for (var i = 0; i < phases.length; i++)
		{
			if (phases[i]['id'] == phaseID)
			{
				departmentPhases.push([departmentObject, phases[i]]);
			}
		}
	}

	console.log("DEPARTMENT PHASES");
	console.log(departmentPhases);
}



/*var appData = {
	phases: [
		{
			name: 'designspecs',
			description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
			tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
			quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
			consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse
			cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
			proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
			departments: [ 
				{
					name: 'Legal (purchase contracts)',
					description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
					tempor incididunt ut labore et dolore magna aliqua.',
					Employees: [
						{
							name: '',
							position: ''
						}
					]
				},
				{
					name: 'HR (Hiring and Management of Employees',
					description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
					tempor incididunt ut labore et dolore magna aliqua.',
					Employees: [
						{
							name: '',
							position: ''
						}
					]
				},
				{
					name: 'Meter Tech',
					description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
					tempor incididunt ut labore et dolore magna aliqua.',
					Employees: [
						{
							name: '',
							position: ''
						}
					]
				},
				{
					name: 'Strategy',
					description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
					tempor incididunt ut labore et dolore magna aliqua.',
					Employees: [
						{
							name: '',
							position: ''
						}
					]
				},
				{
					name: 'Communications (public education)',
					description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
						tempor incididunt ut labore et dolore magna aliqua.',
					Employees: [
						{
							name: '',
							position: ''
						}
					]
				},
			]
		},
		{
			name: 'Purchase Approval',
			description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
			tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
			quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
			consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse
			cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
			proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
			departments: [
				{
					name: 'Legal (purchase contracts)',
					description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
					tempor incididunt ut labore et dolore magna aliqua.',
					Employees: [
						{
							name: '',
							position: ''
						}
					]
				},
			]
		},
	]
};
*/