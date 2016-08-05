import THREE from 'three';

export default function FirstPersonControls(camera, renderer, container) {
	var PI_2 = Math.PI / 2;

	this.x = 0.0;
	this.y = 0.0;
	this.movement = [0, 0];
	this.front = -Math.PI / 2;

	let enabled = false;
	let dirty = false;
	const that = this;

	updateCamera();

	var onMouseMove = function ( event ) {
		if (!enabled)
			return;

		var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
		var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

		that.y -= movementX * 0.002;
		that.x -= movementY * 0.002;

		that.x = Math.max( - PI_2, Math.min( PI_2, that.x ) );
		updateCamera();
	};

	document.addEventListener('mousemove', onMouseMove, false );

	container.addEventListener('click', function() {
		document.body.requestPointerLock();
	});

	document.addEventListener('pointerlockchange', function(e) {
		enabled = document.pointerLockElement == document.body;
	}, false);

	window.addEventListener('keydown', onKeyDown, false);
	window.addEventListener('keyup', onKeyUp, false);
    window.addEventListener('dpadvaluechanged', onDpadValueChanged, false);
	window.addEventListener('gamepadbuttonpressed', onButtonPressed, false);

	function onKeyDown(event) {
		if (event.keyCode == 90 || event.keyCode == 38) { // Z or Up
			that.movement[0] = -1;
		}
		if (event.keyCode == 83 || event.keyCode == 40) { // S or Down
			that.movement[0] = 1;
		}
		if (event.keyCode == 81 || event.keyCode == 37) { // Q or Left
			that.movement[1] = -1;
		}
		if (event.keyCode == 68 || event.keyCode == 39) { // D or Right
			that.movement[1] = 1;
		}
	}

	function onKeyUp(event) {
		if (event.keyCode == 90 || event.keyCode == 83 || event.keyCode == 38 || event.keyCode == 40) { // Z | S | Up | Down
			that.movement[0] = 0;
		}
		if (event.keyCode == 81 || event.keyCode == 68 || event.keyCode == 37 || event.keyCode == 39) { // Q | D | Left | Right
			that.movement[1] = 0;
		}
	}

	function onButtonPressed(event) {
		if (event.detail.name == 'leftShoulder' && event.detail.isPressed) {
			that.y += Math.PI / 2.0;
			dirty = true;
		}
		else if (event.detail.name == 'rightShoulder' && event.detail.isPressed) {
			that.y -= Math.PI / 2.0;
			dirty = true;
		}
	}
    
    function onDpadValueChanged(event) {
        that.movement[0] = event.detail.y * 0.75;
        that.movement[1] = event.detail.x * 0.5;
    }

	this.update = function(dt) {
		if (that.movement[0] != 0 || that.movement[1] != 0 || dirty) {
			let dir;
			if (enabled) {
				dir = new THREE.Vector3(that.movement[0], 0, -that.movement[1]).applyAxisAngle(new THREE.Vector3(0, 1, 0), that.y + that.front);
			} else {
				that.y -= dt * that.movement[1] * 2.0;
				dir = new THREE.Vector3(that.movement[0], 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), that.y + that.front);
			}
			const pos = camera.position.clone();
			const d2 = dir.clone();
			d2.multiplyScalar(0.01538);
			pos.add(d2);
			const dy = Math.abs(renderer.getHeight(pos.x, pos.z) + 0.08 - pos.y);
			if (dy < 0.02) {
				dir.multiplyScalar(dt * 0.2);
				camera.position.add(dir);
				camera.position.y = renderer.getHeight(camera.position.x, camera.position.z) + 0.08;
			}
			updateCamera();
			dirty = false;
		}
	};

	this.setFront = function(angle) {
		that.front = angle;
	};

	function updateCamera() {
		camera.quaternion.setFromEuler(new THREE.Euler(that.x, that.y, 0.0, 'YXZ'));
	}
};
