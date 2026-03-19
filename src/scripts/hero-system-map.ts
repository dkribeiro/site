import * as THREE from "three";

export interface HeroSystemMapOptions {
	container: HTMLElement;
	reducedMotion: boolean;
}

export interface HeroSystemMapController {
	start: () => void;
	stop: () => void;
	resize: () => void;
	dispose: () => void;
}

interface NodeState {
	id: number;
	type: "service" | "gateway" | "queue" | "datastore";
	status: "healthy" | "warning" | "critical" | "recovering";
	basePosition: THREE.Vector3;
	position: THREE.Vector3;
	velocity: THREE.Vector3;
	cluster: number;
	load: number;
	spawnLevel: number;
	isReplica: boolean;
	failureTimer: number;
	hasFailed: boolean;
	state: "normal" | "jiggle" | "critical";
	stateTimer: number;
	cooldown: number;
	visibility: number;
}

interface EdgeState {
	from: number;
	to: number;
	flow: number;
	reroute: boolean;
}

interface GhostNode {
	position: THREE.Vector3;
	color: THREE.Color;
	alpha: number;
	fadeRate: number;
}

interface GhostEdge {
	from: THREE.Vector3;
	to: THREE.Vector3;
	color: THREE.Color;
	alpha: number;
	fadeRate: number;
}

type Mode = "healthy" | "load_spike" | "degradation" | "healing";

const COLORS = {
	healthy: new THREE.Color("#5d7868"),
	warning: new THREE.Color("#8c7754"),
	critical: new THREE.Color("#8c5757"),
	recovering: new THREE.Color("#536c7a"),
};

const JIGGLE_SECONDS = 2.0;
const CRITICAL_SECONDS = 0.65;
const NODE_FADE_SECONDS = 6.5;
const EDGE_FADE_SECONDS = 0.8;

function getQuality() {
	const mobile = window.innerWidth < 768;
	return {
		serviceCount: mobile ? 34 : 64,
		infraCount: mobile ? 8 : 12,
		maxEdgesPerNode: mobile ? 2 : 3,
		maxReplicas: mobile ? 14 : 28,
		boundsX: mobile ? 12.5 : 16,
		boundsY: mobile ? 7.2 : 8.6,
	};
}

export function createHeroSystemMap(
	options: HeroSystemMapOptions,
): HeroSystemMapController {
	const { container, reducedMotion } = options;
	const scene = new THREE.Scene();
	scene.fog = new THREE.FogExp2(0x0c0c0f, reducedMotion ? 0.02 : 0.012);

	const camera = new THREE.OrthographicCamera(-18, 18, 10, -10, 0.1, 100);
	camera.position.set(0, 0, 20);
	camera.lookAt(0, 0, 0);

	const renderer = new THREE.WebGLRenderer({
		alpha: true,
		antialias: true,
		powerPreference: "high-performance",
	});
	renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
	renderer.setClearColor(0x000000, 0);
	container.appendChild(renderer.domElement);

	const quality = getQuality();
	const clusterCount = 4;
	const clusters = Array.from({ length: clusterCount }, (_, i) => {
		const x = THREE.MathUtils.mapLinear(
			i,
			0,
			clusterCount - 1,
			-quality.boundsX * 0.58,
			quality.boundsX * 0.58,
		);
		const row = i % 2 === 0 ? 1 : -1;
		const y = row * quality.boundsY * 0.28 + (Math.random() - 0.5) * 1.2;
		return new THREE.Vector3(x, y, 0);
	});

	const nodes: NodeState[] = [];
	const edges: EdgeState[] = [];
const ghostNodes: GhostNode[] = [];
const ghostEdges: GhostEdge[] = [];

	let nodeId = 0;
	for (let i = 0; i < quality.serviceCount; i++) {
		const cluster = i % clusterCount;
		const center = clusters[cluster];
		nodes.push({
			id: nodeId++,
			type: "service",
			status: "healthy",
			basePosition: new THREE.Vector3(
				center.x + (Math.random() - 0.5) * 6.2,
				center.y + (Math.random() - 0.5) * 4.8,
				0,
			),
			position: new THREE.Vector3(
				center.x + (Math.random() - 0.5) * 6.2,
				center.y + (Math.random() - 0.5) * 4.8,
				0,
			),
			velocity: new THREE.Vector3(
				(Math.random() - 0.5) * 0.015,
				(Math.random() - 0.5) * 0.015,
				0,
			),
			cluster,
			load: Math.random() * 0.25 + 0.15,
			spawnLevel: 0,
			isReplica: false,
			failureTimer: 0,
			hasFailed: false,
			state: "normal",
			stateTimer: 0,
			cooldown: 0,
			visibility: 1,
		});
	}
	for (let i = 0; i < quality.infraCount; i++) {
		const cluster = i % clusterCount;
		const center = clusters[cluster];
		const type = (["gateway", "queue", "datastore"] as const)[i % 3];
		nodes.push({
			id: nodeId++,
			type,
			status: "healthy",
			basePosition: new THREE.Vector3(
				center.x + (Math.random() - 0.5) * 7.4,
				center.y + (Math.random() - 0.5) * 5.6,
				0,
			),
			position: new THREE.Vector3(
				center.x + (Math.random() - 0.5) * 7.4,
				center.y + (Math.random() - 0.5) * 5.6,
				0,
			),
			velocity: new THREE.Vector3((Math.random() - 0.5) * 0.01, (Math.random() - 0.5) * 0.01, 0),
			cluster,
			load: Math.random() * 0.18 + 0.08,
			spawnLevel: 0,
			isReplica: false,
			failureTimer: 0,
			hasFailed: false,
			state: "normal",
			stateTimer: 0,
			cooldown: 0,
			visibility: 1,
		});
	}

	for (let i = 0; i < nodes.length; i++) {
		let links = 0;
		for (let j = 0; j < nodes.length; j++) {
			if (i === j || links >= quality.maxEdgesPerNode) continue;
			const a = nodes[i];
			const b = nodes[j];
			if (a.cluster !== b.cluster && Math.random() > 0.07) continue;
			if (a.position.distanceToSquared(b.position) > 70) continue;
			if (a.type !== "service" && b.type !== "service" && Math.random() > 0.4) continue;
			edges.push({ from: i, to: j, flow: Math.random(), reroute: false });
			links++;
		}
	}

	const serviceGeometry = new THREE.PlaneGeometry(0.62, 0.38);
	const infraGeometry = new THREE.CircleGeometry(0.22, 18);
	const serviceMaterial = new THREE.MeshBasicMaterial({
		color: COLORS.healthy,
		transparent: true,
		opacity: 0.9,
	});
	const infraMaterial = new THREE.MeshBasicMaterial({
		color: COLORS.healthy,
		transparent: true,
		opacity: 0.85,
		blending: THREE.AdditiveBlending,
	});
	const serviceNodes = nodes.filter((n) => n.type === "service");
	const infraNodes = nodes.filter((n) => n.type !== "service");
	const serviceMesh = new THREE.InstancedMesh(
		serviceGeometry,
		serviceMaterial,
		Math.max(serviceNodes.length + quality.maxReplicas, 1),
	);
	const infraMesh = new THREE.InstancedMesh(
		infraGeometry,
		infraMaterial,
		Math.max(infraNodes.length, 1),
	);
	serviceMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
	infraMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
	scene.add(serviceMesh);
	scene.add(infraMesh);

	const maxGhostEdges = 640;
	const maxEdges = Math.max(edges.length + quality.maxReplicas * 2 + maxGhostEdges, 1);
	const linePositions = new Float32Array(maxEdges * 2 * 3);
	const lineColors = new Float32Array(maxEdges * 2 * 3);
	const lineGeom = new THREE.BufferGeometry();
	lineGeom.setAttribute("position", new THREE.BufferAttribute(linePositions, 3));
	lineGeom.setAttribute("color", new THREE.BufferAttribute(lineColors, 3));
	lineGeom.setDrawRange(0, 0);
	const lineMat = new THREE.LineBasicMaterial({
		vertexColors: true,
		transparent: true,
		opacity: reducedMotion ? 0.3 : 0.55,
		blending: THREE.AdditiveBlending,
	});
	const lines = new THREE.LineSegments(lineGeom, lineMat);
	scene.add(lines);

	const maxGhostNodes = 256;
	const ghostNodePositions = new Float32Array(maxGhostNodes * 3);
	const ghostNodeColors = new Float32Array(maxGhostNodes * 3);
	const ghostNodeGeom = new THREE.BufferGeometry();
	ghostNodeGeom.setAttribute("position", new THREE.BufferAttribute(ghostNodePositions, 3));
	ghostNodeGeom.setAttribute("color", new THREE.BufferAttribute(ghostNodeColors, 3));
	ghostNodeGeom.setDrawRange(0, 0);
	const ghostNodeMat = new THREE.PointsMaterial({
		size: 0.33,
		sizeAttenuation: true,
		vertexColors: true,
		transparent: true,
		opacity: 0.9,
		blending: THREE.AdditiveBlending,
		depthWrite: false,
	});
	const ghostPoints = new THREE.Points(ghostNodeGeom, ghostNodeMat);
	scene.add(ghostPoints);

	const mouseNdc = new THREE.Vector2(0, 0);
	const mouseWorld = new THREE.Vector3(999, 999, 0);
	let pointerActive = false;

	let rafId: number | null = null;
	let running = false;
	let disposed = false;
	let pulse = 0;
	let elapsedSeconds = 0;
	let lastFrameMs = 0;
	let mode: Mode = "healthy";
	let modeUntil = 0;
	let activeServiceCount = serviceNodes.length;

	const tempObj = new THREE.Object3D();

	function statusColor(status: NodeState["status"]) {
		return COLORS[status];
	}

	function setMode(next: Mode, duration: number) {
		mode = next;
		modeUntil = elapsedSeconds + duration;
	}

	function updateMode() {
		if (elapsedSeconds > modeUntil) {
			if (mode === "degradation") setMode("healing", reducedMotion ? 1.4 : 2.5);
			else setMode("healthy", reducedMotion ? 2.4 : 3.2);
		}
	}

	function addGhostForNode(
		nodeIndex: number,
		nodeAlpha = 1,
		nodeFadeSeconds = NODE_FADE_SECONDS,
		edgeFadeSeconds = EDGE_FADE_SECONDS,
	) {
		const node = nodes[nodeIndex];
		if (!node) return;
		ghostNodes.push({
			position: node.position.clone(),
			color: COLORS.critical.clone(),
			alpha: nodeAlpha,
			fadeRate: 1 / Math.max(0.001, nodeFadeSeconds),
		});

		for (let i = 0; i < edges.length; i++) {
			const e = edges[i];
			if (e.from !== nodeIndex && e.to !== nodeIndex) continue;
			const a = nodes[e.from];
			const b = nodes[e.to];
			if (!a || !b) continue;
			ghostEdges.push({
				from: a.position.clone(),
				to: b.position.clone(),
				color: COLORS.critical.clone(),
				alpha: nodeAlpha,
				fadeRate: 1 / Math.max(0.001, edgeFadeSeconds),
			});
		}
	}

	function respawnNode(node: NodeState) {
		// Replace near the failed node location (small local offset),
		// not across the whole cluster.
		const oldX = node.position.x;
		const oldY = node.position.y;
		const localOffset = node.type === "service" ? 0.95 : 1.2;
		node.basePosition.set(
			oldX + (Math.random() - 0.5) * localOffset,
			oldY + (Math.random() - 0.5) * localOffset,
			0,
		);
		node.position.copy(node.basePosition);
		node.velocity.set((Math.random() - 0.5) * 0.01, (Math.random() - 0.5) * 0.01, 0);
		node.load = 0.12;
		node.status = "recovering";
		node.failureTimer = 0;
		node.hasFailed = false;
		node.state = "normal";
		node.stateTimer = 0;
		node.cooldown = 1.2;
		node.visibility = 1;
	}

	function updateGhosts(dt: number) {
		for (let i = ghostNodes.length - 1; i >= 0; i--) {
			const g = ghostNodes[i];
			g.alpha -= g.fadeRate * dt;
			if (g.alpha <= 0) ghostNodes.splice(i, 1);
		}
		for (let i = ghostEdges.length - 1; i >= 0; i--) {
			const g = ghostEdges[i];
			g.alpha -= g.fadeRate * dt;
			if (g.alpha <= 0) ghostEdges.splice(i, 1);
		}
	}

	function updateNodes(elapsed: number, dt: number) {
		updateMode();
		for (let i = 0; i < clusters.length; i++) {
			const c = clusters[i];
			const t = elapsed * (reducedMotion ? 0.1 : 0.22) + i * 1.3;
			const baseX = THREE.MathUtils.mapLinear(
				i,
				0,
				clusters.length - 1,
				-quality.boundsX * 0.58,
				quality.boundsX * 0.58,
			);
			const row = i % 2 === 0 ? 1 : -1;
			const baseY = row * quality.boundsY * 0.28;
			c.x = baseX + Math.sin(t * 0.8) * 1.35;
			c.y = baseY + Math.cos(t * 1.1) * 1.05;
		}

		const hasMouse = pointerActive && mouseWorld.x < 900;
		const failureRadiusSq = 14;
		let hoveredNodeIndex = -1;
		if (hasMouse) {
			let bestDistSq = failureRadiusSq;
			for (let i = 0; i < nodes.length; i++) {
				const d = nodes[i].position.distanceToSquared(mouseWorld);
				if (d < bestDistSq) {
					bestDistSq = d;
					hoveredNodeIndex = i;
				}
			}
		}
		if (hasMouse && !reducedMotion) {
			setMode("degradation", 1.2);
		}

		const targetServices = serviceNodes.length;
		activeServiceCount = Math.round(
			THREE.MathUtils.lerp(activeServiceCount, targetServices, reducedMotion ? 0.04 : 0.12),
		);

		for (let i = 0; i < nodes.length; i++) {
			const n = nodes[i];
			// Keep each node orbiting around its own anchor, with gentle cluster drift.
			// This prevents all nodes in a cluster from collapsing into one point.
			const clusterDrift = clusters[n.cluster];
			const target = new THREE.Vector3(
				n.basePosition.x + clusterDrift.x * 0.18,
				n.basePosition.y + clusterDrift.y * 0.18,
				0,
			);
			const toCenter = target
				.clone()
				.sub(n.position)
				.multiplyScalar(reducedMotion ? 0.0038 : 0.0082);
			n.velocity.add(toCenter);

			// Hover now triggers local failure simulation (only near cursor):
			// 1) warning + jiggle, 2) failure, 3) replacement node.
			const nearPointer = i === hoveredNodeIndex;
			n.cooldown = Math.max(0, n.cooldown - dt);
			if (nearPointer && n.cooldown <= 0 && n.state === "normal") {
				n.state = "jiggle";
				n.stateTimer = 0;
			}

			// Node only progresses to failure while continuously hovered.
			// If cursor leaves before replacement, cancel and recover.
			if (!nearPointer && n.state !== "normal") {
				n.state = "normal";
				n.stateTimer = 0;
				n.status = "recovering";
				n.load = THREE.MathUtils.lerp(n.load, 0.25, reducedMotion ? 0.08 : 0.14);
				n.failureTimer = 0;
				n.visibility = 1;
			}

			if (n.state === "jiggle") {
				n.stateTimer += dt;
				n.status = "warning";
				const jiggle = reducedMotion ? 0.0035 : 0.016;
				n.velocity.x += (Math.random() - 0.5) * jiggle;
				n.velocity.y += (Math.random() - 0.5) * jiggle;
				if (n.stateTimer >= JIGGLE_SECONDS) {
					n.state = "critical";
					n.stateTimer = 0;
					n.status = "critical";
				}
			} else if (n.state === "critical") {
				n.stateTimer += dt;
				n.status = "critical";
				if (n.stateTimer >= CRITICAL_SECONDS) {
					// Spawn replacement quickly; old node/links fade independently as ghosts.
					addGhostForNode(i, 1, NODE_FADE_SECONDS, EDGE_FADE_SECONDS);
					respawnNode(n);
				}
			}

			if (mode === "healing") {
				n.load = THREE.MathUtils.lerp(n.load, 0.28, reducedMotion ? 0.04 : 0.08);
				if (n.status === "critical" || n.status === "warning") n.status = "recovering";
				else n.status = "healthy";
			} else if (mode === "healthy") {
				n.load = THREE.MathUtils.lerp(n.load, 0.25, reducedMotion ? 0.03 : 0.06);
				n.status = n.load < 0.5 ? "healthy" : "warning";
			}
			if (n.status === "recovering" && n.load < 0.45) n.status = "healthy";

			const maxSpeed = reducedMotion ? 0.02 : 0.055;
			if (n.velocity.length() > maxSpeed) n.velocity.setLength(maxSpeed);

			n.position.addScaledVector(n.velocity, dt * 60);
			n.velocity.multiplyScalar(reducedMotion ? 0.84 : 0.78);

			const bx = quality.boundsX;
			const by = quality.boundsY;
			n.position.x = THREE.MathUtils.clamp(n.position.x, -bx, bx);
			n.position.y = THREE.MathUtils.clamp(n.position.y, -by, by);
			n.position.z = 0;
		}

		// Local separation force so nodes do not overlap into dense "dot blobs".
		const minDist = 1.35;
		const minDistSq = minDist * minDist;
		for (let i = 0; i < nodes.length; i++) {
			for (let j = i + 1; j < nodes.length; j++) {
				const a = nodes[i];
				const b = nodes[j];
				const dx = a.position.x - b.position.x;
				const dy = a.position.y - b.position.y;
				const distSq = dx * dx + dy * dy;
				if (distSq <= 0.0001 || distSq >= minDistSq) continue;

				const dist = Math.sqrt(distSq);
				const overlap = (minDist - dist) / minDist;
				const nx = dx / dist;
				const ny = dy / dist;
				const push = overlap * (reducedMotion ? 0.012 : 0.034);

				a.velocity.x += nx * push;
				a.velocity.y += ny * push;
				b.velocity.x -= nx * push;
				b.velocity.y -= ny * push;
			}
		}
		updateGhosts(dt);
	}

	function refreshNodes() {
		let serviceIndex = 0;
		let infraIndex = 0;
		for (let i = 0; i < nodes.length; i++) {
			const n = nodes[i];
			const c = statusColor(n.status);
			const scalePulse = 1 + n.load * 0.12 + pulse * 0.04;
			tempObj.position.copy(n.position);
			if (n.type === "service") {
				if (serviceIndex >= activeServiceCount) continue;
				tempObj.scale.set(1.0 * scalePulse, 1.0 * scalePulse, 1);
				tempObj.updateMatrix();
				serviceMesh.setMatrixAt(serviceIndex, tempObj.matrix);
				serviceMesh.setColorAt(
					serviceIndex,
					new THREE.Color(c.r * n.visibility, c.g * n.visibility, c.b * n.visibility),
				);
				serviceIndex++;
			} else {
				tempObj.scale.set(1.0 * scalePulse, 1.0 * scalePulse, 1);
				tempObj.updateMatrix();
				infraMesh.setMatrixAt(infraIndex, tempObj.matrix);
				infraMesh.setColorAt(
					infraIndex,
					new THREE.Color(c.r * n.visibility, c.g * n.visibility, c.b * n.visibility),
				);
				infraIndex++;
			}
		}
		serviceMesh.count = serviceIndex;
		infraMesh.count = infraIndex;
		serviceMesh.instanceMatrix.needsUpdate = true;
		infraMesh.instanceMatrix.needsUpdate = true;
		if (serviceMesh.instanceColor) serviceMesh.instanceColor.needsUpdate = true;
		if (infraMesh.instanceColor) infraMesh.instanceColor.needsUpdate = true;
	}

	function refreshEdges() {
		let cursor = 0;
		for (let i = 0; i < edges.length; i++) {
			const e = edges[i];
			const a = nodes[e.from];
			const b = nodes[e.to];
			if (!a || !b) continue;
			if (a.type === "service" && e.from >= activeServiceCount) continue;

			const distSq = a.position.distanceToSquared(b.position);
			if (distSq > 150) continue;

			e.flow = (e.flow + (reducedMotion ? 0.003 : 0.01) * (1 + a.load + b.load)) % 1;
			e.reroute = mode === "degradation" && (a.status === "critical" || b.status === "critical");

			const pIdx = cursor * 6;
			linePositions[pIdx] = a.position.x;
			linePositions[pIdx + 1] = a.position.y;
			linePositions[pIdx + 2] = 0;
			linePositions[pIdx + 3] = b.position.x;
			linePositions[pIdx + 4] = b.position.y;
			linePositions[pIdx + 5] = 0;

			const flowBoost = 0.25 + (Math.sin((e.flow + pulse) * Math.PI * 2) * 0.5 + 0.5) * 0.75;
			const base = e.reroute ? COLORS.recovering : statusColor(a.status);
			const visibility = Math.min(a.visibility, b.visibility);
			const intensity = THREE.MathUtils.clamp(
				flowBoost * (reducedMotion ? 0.45 : 0.7) * visibility,
				0,
				1,
			);
			for (let k = 0; k < 6; k += 3) {
				lineColors[pIdx + k] = base.r * intensity;
				lineColors[pIdx + k + 1] = base.g * intensity;
				lineColors[pIdx + k + 2] = base.b * intensity;
			}
			cursor++;
			if (cursor >= maxEdges) break;
		}

		// Keep old (failed) edges fading for a few seconds after replacement.
		for (let i = 0; i < ghostEdges.length; i++) {
			if (cursor >= maxEdges) break;
			const e = ghostEdges[i];
			const pIdx = cursor * 6;
			linePositions[pIdx] = e.from.x;
			linePositions[pIdx + 1] = e.from.y;
			linePositions[pIdx + 2] = 0;
			linePositions[pIdx + 3] = e.to.x;
			linePositions[pIdx + 4] = e.to.y;
			linePositions[pIdx + 5] = 0;

			const intensity = THREE.MathUtils.clamp(e.alpha * 0.9, 0, 1);
			for (let k = 0; k < 6; k += 3) {
				lineColors[pIdx + k] = e.color.r * intensity;
				lineColors[pIdx + k + 1] = e.color.g * intensity;
				lineColors[pIdx + k + 2] = e.color.b * intensity;
			}
			cursor++;
		}

		lineGeom.setDrawRange(0, cursor * 2);
		(lineGeom.attributes.position as THREE.BufferAttribute).needsUpdate = true;
		(lineGeom.attributes.color as THREE.BufferAttribute).needsUpdate = true;
	}

	function refreshGhostNodes() {
		const count = Math.min(ghostNodes.length, maxGhostNodes);
		for (let i = 0; i < count; i++) {
			const g = ghostNodes[i];
			const idx = i * 3;
			ghostNodePositions[idx] = g.position.x;
			ghostNodePositions[idx + 1] = g.position.y;
			ghostNodePositions[idx + 2] = 0;
			ghostNodeColors[idx] = g.color.r * g.alpha;
			ghostNodeColors[idx + 1] = g.color.g * g.alpha;
			ghostNodeColors[idx + 2] = g.color.b * g.alpha;
		}
		ghostNodeGeom.setDrawRange(0, count);
		(ghostNodeGeom.attributes.position as THREE.BufferAttribute).needsUpdate = true;
		(ghostNodeGeom.attributes.color as THREE.BufferAttribute).needsUpdate = true;
	}

	function frame() {
		if (!running || disposed) return;
		const now = performance.now();
		if (lastFrameMs === 0) lastFrameMs = now;
		const dt = Math.min((now - lastFrameMs) / 1000, 0.033);
		lastFrameMs = now;
		elapsedSeconds += dt;

		pulse = reducedMotion ? 0.2 : Math.sin(elapsedSeconds * 2.4) * 0.5 + 0.5;
		camera.position.x = THREE.MathUtils.lerp(camera.position.x, mouseNdc.x * 0.35, 0.02);
		camera.position.y = THREE.MathUtils.lerp(camera.position.y, mouseNdc.y * 0.2, 0.02);
		camera.lookAt(0, 0, 0);

		updateNodes(elapsedSeconds, dt);
		refreshNodes();
		refreshEdges();
		refreshGhostNodes();
		renderer.render(scene, camera);

		rafId = requestAnimationFrame(frame);
	}

	function onPointerMove(event: PointerEvent) {
		const rect = container.getBoundingClientRect();
		const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
		const y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
		mouseNdc.set(THREE.MathUtils.clamp(x, -1, 1), THREE.MathUtils.clamp(y, -1, 1));
		const worldX = (x * camera.right) / 1.0;
		const worldY = (y * camera.top) / 1.0;
		mouseWorld.set(worldX, worldY, 0);
		pointerActive = true;
	}

	function onPointerLeave() {
		mouseNdc.set(0, 0);
		mouseWorld.set(999, 999, 0);
		pointerActive = false;
	}

	function resize() {
		if (disposed) return;
		const rect = container.getBoundingClientRect();
		const width = Math.max(1, rect.width);
		const height = Math.max(1, rect.height);
		const aspect = width / height;
		const h = 10;
		camera.left = -h * aspect;
		camera.right = h * aspect;
		camera.top = h;
		camera.bottom = -h;
		camera.updateProjectionMatrix();
		renderer.setSize(width, height, false);
	}

	function start() {
		if (disposed || running) return;
		running = true;
		lastFrameMs = performance.now();
		rafId = requestAnimationFrame(frame);
	}

	function stop() {
		running = false;
		if (rafId != null) cancelAnimationFrame(rafId);
		rafId = null;
	}

	function dispose() {
		if (disposed) return;
		disposed = true;
		stop();
		container.removeEventListener("pointermove", onPointerMove);
		container.removeEventListener("pointerleave", onPointerLeave);
		serviceGeometry.dispose();
		serviceMaterial.dispose();
		infraGeometry.dispose();
		infraMaterial.dispose();
		ghostNodeGeom.dispose();
		ghostNodeMat.dispose();
		lineGeom.dispose();
		lineMat.dispose();
		renderer.dispose();
		if (renderer.domElement.parentElement === container) {
			container.removeChild(renderer.domElement);
		}
	}

	container.addEventListener("pointermove", onPointerMove);
	container.addEventListener("pointerleave", onPointerLeave);

	resize();
	refreshNodes();
	refreshEdges();
	renderer.render(scene, camera);

	if (reducedMotion) {
		// In reduced motion mode render static topology only.
		stop();
	} else {
		start();
	}

	return { start, stop, resize, dispose };
}

