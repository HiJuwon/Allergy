// Ported from original Metaball script by SATO Hiroyuki
// http://park12.wakwak.com/~shp/lc/et/en_aics_script.html
var rect = new Path.Rectangle({
    point: [0, 0],
    size: [view.size.width, view.size.height],
    strokeColor: 'white',
    selected: true
});
rect.sendToBack();
rect.fillColor = '#000000';

project.currentStyle = {
	fillColor: 'white',
};

var ballPositions = [[-10, 49], [307, 89], [501, 0], [821, 89], [913, 30], [903, 122], [38, 248], [215, 288], [420, 348], [491, 217], [683, 187], [195, 460], [-50, 480], [87, 562], [317, 547], [28, 720], [185, 761], [69, 916], [170, 1071], [307, 971], [377, 840], [457, 870], [501, 1042], [551, 410], [541, 550], [531, 652], [698, 547], [713, 329], [643, 781], [683, 870], [753, 1032], [854, 440], [821, 592], [1031, 217], [1041, 390], [1193, 20], [1203, 319], [903, 741], [1001, 991], [1073, 662], [1591, 20], [1398, 79], [1741, 119], [1920, 129], [1288, 207], [1571, 217], [1803, 309], [1308, 329], [1531, 348], [1661, 410], [1862, 440], [1193, 502], [1368, 540], [1243, 662], [1146, 821], [1111, 1061], [1203, 981], [1368, 840], [1388, 702], [1478, 609], [1458, 1051], [1551, 801], [1589, 599], [1741, 517], [1681, 916], [1751, 860], [1844, 1011], [1872, 712]];

var handle_len_rate = 2.4;
var circlePaths = [];
var radius = 40;
for (var i = 0, l = ballPositions.length; i < l; i++) {
	var circlePath = new Path.Circle({
		center: ballPositions[i],
		radius: 30
	});
	circlePaths.push(circlePath);
}

var largeCircle = new Path.Circle({
	center: [676, 433],
	radius: 80
});
circlePaths.push(largeCircle);

function onMouseMove(event) {
	largeCircle.position = event.point;
	generateConnections(circlePaths);
}

var connections = new Group();
function generateConnections(paths) {
	// Remove the last connection paths:
	connections.children = [];

	for (var i = 0, l = paths.length; i < l; i++) {
		for (var j = i - 1; j >= 0; j--) {
			var path = metaball(paths[i], paths[j], 0.5, handle_len_rate, 240);
			if (path) {
				//path.blendMode = 'difference'; //블렌딩 모드 건드려보기
				connections.appendTop(path);
				path.removeOnMove();
			}
		}
	}
}

generateConnections(circlePaths);

// ---------------------------------------------
function metaball(ball1, ball2, v, handle_len_rate, maxDistance) {
	var center1 = ball1.position;
	var center2 = ball2.position;
	var radius1 = ball1.bounds.width / 2;
	var radius2 = ball2.bounds.width / 2;
	var pi2 = Math.PI / 2;
	var d = center1.getDistance(center2);
	var u1, u2;

	if (radius1 == 0 || radius2 == 0)
		return;

	if (d > maxDistance || d <= Math.abs(radius1 - radius2)) {
		return;
	} else if (d < radius1 + radius2) { // case circles are overlapping
		u1 = Math.acos((radius1 * radius1 + d * d - radius2 * radius2) /
				(2 * radius1 * d));
		u2 = Math.acos((radius2 * radius2 + d * d - radius1 * radius1) /
				(2 * radius2 * d));
	} else {
		u1 = 0;
		u2 = 0;
	}

	var angle1 = (center2 - center1).getAngleInRadians();
	var angle2 = Math.acos((radius1 - radius2) / d);
	var angle1a = angle1 + u1 + (angle2 - u1) * v;
	var angle1b = angle1 - u1 - (angle2 - u1) * v;
	var angle2a = angle1 + Math.PI - u2 - (Math.PI - u2 - angle2) * v;
	var angle2b = angle1 - Math.PI + u2 + (Math.PI - u2 - angle2) * v;
	var p1a = center1 + getVector(angle1a, radius1);
	var p1b = center1 + getVector(angle1b, radius1);
	var p2a = center2 + getVector(angle2a, radius2);
	var p2b = center2 + getVector(angle2b, radius2);

	// define handle length by the distance between
	// both ends of the curve to draw
	var totalRadius = (radius1 + radius2);
	var d2 = Math.min(v * handle_len_rate, (p1a - p2a).length / totalRadius);

	// case circles are overlapping:
	d2 *= Math.min(1, d / (radius1 + radius2));

	radius1 *= d2;
	radius2 *= d2;

	var path = new Path({
		segments: [p1a, p2a, p2b, p1b],
		style: ball1.style,
		closed: true
	});
	var segments = path.segments;
	segments[0].handleOut = getVector(angle1a - pi2, radius1);
	segments[1].handleIn = getVector(angle2a + pi2, radius2);
	segments[2].handleOut = getVector(angle2b - pi2, radius2);
	segments[3].handleIn = getVector(angle1b + pi2, radius1);
	return path;
}

// ------------------------------------------------
function getVector(radians, length) {
	return new Point({
		// Convert radians to degrees:
		angle: radians * 180 / Math.PI,
		length: length
	});
}