var dataDepartments;
var dataPhases;
var jobs;
var dataDepartmentPhases;

$.ajax({
	url: 'fetchDepartments.php'
}).success(function(data) {
	console.log("dataDepartments");
	dataDepartments = eval("(" + data + ")");
	console.log(dataDepartments);
	loaddataPhases();
});

var loaddataPhases = function()
{
	$.ajax({
		url: 'fetchPhases.php'
	}).success(function(data) {
		dataPhases = eval("(" + data + ")");
		console.log("dataPhases");
		console.log(dataPhases);
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

//associate dataDepartments with dataPhases
var buildRelations = function() 
{
	dataDepartmentPhases = [];

	for (var h = 0; h < dataDepartments.length; h++)
	{
		var departmentObject = dataDepartments[h];
		var phaseID = departmentObject['phase_id'];

		for (var i = 0; i < dataPhases.length; i++)
		{
			if (dataPhases[i]['id'] == phaseID)
			{
				dataDepartmentPhases.push([departmentObject, dataPhases[i]]);
			}
		}
	}

	console.log("DEPARTMENT dataPhases");
	console.log(dataDepartmentPhases);
}



/*var appData = {
	dataPhases: [
		{
			name: 'designspecs',
			description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
			tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
			quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
			consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse
			cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
			proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
			dataDepartments: [ 
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
			dataDepartments: [
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