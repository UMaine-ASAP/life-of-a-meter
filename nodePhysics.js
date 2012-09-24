var nodePhysics = {
	activeNodes: [],
	timeStep: 1.0 / 30.0,
	velocityIterations: 10.0,
	positionIterations: 4.0,

	init: function(worldHeight, worldWidth, gravity, doSleep) {
		this.worldHeight = worldHeight;
		this.worldWidth = worldWidth;
		this.gravity = gravity;
		this.doSleep = doSleep;

		this.world = new b2World(gravity, doSleep);
		console.log("successfully initialized b2world");

		var fixDef = new b2FixtureDef;
		fixDef.density = .5;
		fixDef.friction = 0.4;
		fixDef.restitution = 0.5;

		var bodyDef = new b2BodyDef;
		bodyDef.type = b2Body.b2_staticBody;
		
		fixDef.shape = new b2PolygonShape;
		fixDef.shape.SetAsBox(this.worldWidth / 2, 2);
		
		bodyDef.position.Set(this.worldWidth / 2, 0);
		
		this.world.CreateBody(bodyDef).CreateFixture(fixDef);
		
		bodyDef.position.Set(this.worldWidth / 2, this.worldHeight - 2);
		this.world.CreateBody(bodyDef).CreateFixture(fixDef);

		interval = window.setInterval(this.physicsStep, (1000.0 / 30.0)); //target update rate of 60x/sec
	},

	addNode: function(node) {
		var bodyDef = new b2BodyDef;
		var fixDef = new b2FixtureDef;

		fixDef.density = 0.5;
		fixDef.friction = 0.1;
		fixDef.restitution = 0.2; //might need to increase restitution a bit more

		bodyDef.type = b2Body.b2_dynamicBody;
		fixDef.shape = new b2CircleShape(node.size);

		bodyDef.position.x = node.x;
		bodyDef.position.y = node.y;

		var nodeBody = this.world.CreateBody(bodyDef).CreateFixture(fixDef);
		if (node.userData == undefined) {
			node.userData = {'physicsBody': nodeBody};
		}
		else {
			node.userData['physicsBody'] = nodeBody;
		}

		this.activeNodes.push(node);
	},

	removeNode: function(node) {
		this.activeNodes.splice(this.activeNodes.indexOf(node), 1);
	},

	//instantaneously update a node's position (without calling its animateTo)
	updateNodePosition: function(node, x, y) {
		node.circle.attr({cx: x, cy: y});
		node.text.attr({x: x, y: y});
		node.x = x;
		node.y = y;
	},

	updateNodes: function() {
		for (var i = 0; i < this.activeNodes.length; i++) {
			var physicsNode = this.activeNodes[i];
			if (physicsNode.userData['physicsBody'] == undefined || physicsNode.userData == undefined) {
				continue;
			}

			var body = physicsNode.userData['physicsBody'].m_body;

			if (body != undefined) {
				var position = body.GetPosition();
				//canvas Y coordinates are flipped (vs world y)
				var flippedY = this.worldHeight - position.y;

				var fixtureList = body.GetFixtureList();

				if (!fixtureList) {
					continue;
				}

				if (position.x == physicsNode.x && position.y == physicsNode.y) {
					continue; //we don't need to update things that haven't moved
				}

				this.updateNodePosition(physicsNode, position.x, flippedY);
			}
		}
	},

	physicsStep: function() {
		//uncomment these to re-enable physics
		//nodePhysics.world.Step(nodePhysics.timeStep, nodePhysics.velocityIterations, nodePhysics.positionIterations);
		//nodePhysics.updateNodes();
	}
}

$(document).ready(function() {
	var worldHeight = $('#container').height();
	var worldWidth = $('#container').width();

	var gravity = new b2Vec2(-.1, -20); //we don't want gravity
	var doSleep = true; //bodies that come to rest should not stay active

	console.log("initializing world with worldHeight " + worldHeight + " and worldWidth " + worldWidth);
	nodePhysics.init(worldHeight, worldWidth, gravity, doSleep);

});