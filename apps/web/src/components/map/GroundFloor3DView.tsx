'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GROUND_FLOOR_ROOMS, GroundFloorRoom, NavigationWaypoint, OUTER_PENTAGON_FOOTPRINT } from '../../services/groundFloorData';
import { RotateCcw, Compass, Box, Eye, Layers } from 'lucide-react';

interface GroundFloor3DViewProps {
  selectedRoom: GroundFloorRoom | null;
  onSelectRoom: (room: GroundFloorRoom) => void;
  activeRouteWaypoints?: NavigationWaypoint[];
  showOccupancyLayer?: boolean;
}

export function GroundFloor3DView({
  selectedRoom,
  onSelectRoom,
  activeRouteWaypoints = [],
  showOccupancyLayer = false,
}: GroundFloor3DViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const animationFrameId = useRef<number | null>(null);

  // Orbit & Pan state
  const isDragging = useRef(false);
  const isRightDragging = useRef(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });
  // Elevated angle (radius 105, elevated phi Math.PI / 3.4)
  const spherical = useRef({ radius: 105, theta: Math.PI / 4, phi: Math.PI / 3.4 });
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0));
  const currentLookAt = useRef(new THREE.Vector3(0, 0, 0));

  const roomMeshesRef = useRef<Map<string, THREE.Mesh>>(new Map());
  const roomLabelsRef = useRef<Map<string, THREE.Sprite>>(new Map());
  const routeLineRef = useRef<THREE.Object3D | null>(null);

  const [azimuthDegrees, setAzimuthDegrees] = useState(45);

  // Coordinate conversion: map 1000x900 canvas to Three.js centered coordinates
  const mapCoords = (x: number, y: number): [number, number] => {
    return [(x - 500) * 0.14, -(y - 480) * 0.14];
  };

  // Helper to generate crisp text sprite for room labels in 3D
  const createTextSprite = (text: string, subtext: string, colorHex: string) => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 100;
    const ctx = canvas.getContext('2d')!;

    // Rounded background pill
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.beginPath();
    ctx.roundRect(10, 10, 236, 80, 16);
    ctx.fill();

    // Border
    ctx.strokeStyle = colorHex;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(10, 10, 236, 80, 16);
    ctx.stroke();

    // Main text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 128, 40);

    // Sub text
    ctx.fillStyle = '#94a3b8';
    ctx.font = '16px system-ui, -apple-system, sans-serif';
    ctx.fillText(subtext, 128, 68);

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(10, 4, 1);
    return sprite;
  };

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060913); // Deep dark spatial navy
    scene.fog = new THREE.FogExp2(0x060913, 0.0035);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000);
    cameraRef.current = camera;
    updateCameraPosition();

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xdbeafe, 1.4);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 2.4);
    dirLight.position.set(60, 120, 60);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.bias = -0.0001;
    scene.add(dirLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.6);
    rimLight.position.set(-60, 50, -60);
    scene.add(rimLight);

    // 5. Floor Base Grid & Ground Slab
    const groundGeo = new THREE.PlaneGeometry(180, 180);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x0a101d,
      roughness: 0.85,
      metalness: 0.15,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.05;
    ground.receiveShadow = true;
    scene.add(ground);

    const grid = new THREE.GridHelper(160, 40, 0x1e293b, 0x0f172a);
    grid.position.y = 0.01;
    scene.add(grid);

    // 5b. Authoritative Irregular Pentagonal Outer Building Footprint Shell
    const outerShape = new THREE.Shape();
    OUTER_PENTAGON_FOOTPRINT.forEach((pt, idx) => {
      const [x, z] = mapCoords(pt.x, pt.y);
      if (idx === 0) outerShape.moveTo(x, z);
      else outerShape.lineTo(x, z);
    });
    outerShape.closePath();

    const outerFloorGeo = new THREE.ShapeGeometry(outerShape);
    const outerFloorMat = new THREE.MeshStandardMaterial({
      color: 0x090d1a,
      roughness: 0.9,
      metalness: 0.1,
    });
    const outerFloorMesh = new THREE.Mesh(outerFloorGeo, outerFloorMat);
    outerFloorMesh.rotation.x = -Math.PI / 2;
    outerFloorMesh.position.y = 0.02;
    outerFloorMesh.receiveShadow = true;
    scene.add(outerFloorMesh);

    // Outer thick pentagonal wall outline
    const outerWallGeo = new THREE.ExtrudeGeometry(outerShape, {
      depth: 4.2,
      bevelEnabled: true,
      bevelSegments: 2,
      bevelSize: 0.1,
      bevelThickness: 0.1,
    });
    const outerWallEdges = new THREE.EdgesGeometry(outerWallGeo);
    const outerWallLineMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      linewidth: 3,
      transparent: true,
      opacity: 0.9,
    });
    const outerWallWireframe = new THREE.LineSegments(outerWallEdges, outerWallLineMat);
    outerWallWireframe.rotation.x = -Math.PI / 2;
    scene.add(outerWallWireframe);

    // 6. Build Architectural Rooms
    GROUND_FLOOR_ROOMS.forEach((room) => {
      const shape = new THREE.Shape();
      room.polygon.forEach((pt, idx) => {
        const [x, z] = mapCoords(pt.x, pt.y);
        if (idx === 0) shape.moveTo(x, z);
        else shape.lineTo(x, z);
      });
      shape.closePath();

      // Floor tile
      const floorGeo = new THREE.ShapeGeometry(shape);
      const hexColor = new THREE.Color(room.color.badge);
      const floorMat = new THREE.MeshStandardMaterial({
        color: hexColor,
        roughness: 0.6,
        metalness: 0.2,
        transparent: true,
        opacity: room.type === 'CENTRAL_HUB' ? 0.25 : 0.4,
      });
      const floorMesh = new THREE.Mesh(floorGeo, floorMat);
      floorMesh.rotation.x = -Math.PI / 2;
      floorMesh.position.y = 0.05;
      floorMesh.receiveShadow = true;
      scene.add(floorMesh);

      // Extrude walls
      const wallHeight = room.type === 'CENTRAL_HUB' ? 0.8 : 3.8;
      const extrudeSettings = {
        depth: wallHeight,
        bevelEnabled: true,
        bevelSegments: 2,
        steps: 1,
        bevelSize: 0.08,
        bevelThickness: 0.08,
      };

      const wallGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
      const wallMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.5,
        metalness: 0.5,
        transparent: true,
        opacity: 0.78,
      });

      const wallMesh = new THREE.Mesh(wallGeo, wallMat);
      wallMesh.rotation.x = -Math.PI / 2;
      wallMesh.position.y = 0;
      wallMesh.castShadow = true;
      wallMesh.receiveShadow = true;
      wallMesh.userData = { roomId: room.id, roomData: room };

      scene.add(wallMesh);
      roomMeshesRef.current.set(room.id, wallMesh);

      // Wireframe / glowing edges
      const edges = new THREE.EdgesGeometry(wallGeo);
      const lineMat = new THREE.LineBasicMaterial({
        color: hexColor,
        transparent: true,
        opacity: 0.85,
      });
      const wireframe = new THREE.LineSegments(edges, lineMat);
      wireframe.rotation.x = -Math.PI / 2;
      scene.add(wireframe);

      // Furniture & features
      const [centerX, centerZ] = mapCoords(room.position.labelX, room.position.labelY);

      if (room.type === 'CENTRAL_HUB') {
        const planterGeo = new THREE.CylinderGeometry(2.5, 2.5, 1.2, 16);
        const planterMat = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.6 });
        const planter = new THREE.Mesh(planterGeo, planterMat);
        planter.position.set(centerX, 0.6, centerZ);
        planter.castShadow = true;
        scene.add(planter);

        const benchRingGeo = new THREE.TorusGeometry(5.2, 0.5, 8, 6);
        const benchRingMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.3 });
        const benchRing = new THREE.Mesh(benchRingGeo, benchRingMat);
        benchRing.rotation.x = -Math.PI / 2;
        benchRing.position.set(centerX, 0.3, centerZ);
        scene.add(benchRing);
      } else if (room.type === 'LABORATORY') {
        for (let row = -1; row <= 1; row += 2) {
          for (let col = -1; col <= 1; col += 2) {
            const deskGeo = new THREE.BoxGeometry(2.4, 0.9, 1.2);
            const deskMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.4 });
            const desk = new THREE.Mesh(deskGeo, deskMat);
            desk.position.set(centerX + col * 3.5, 0.45, centerZ + row * 2.5);
            desk.castShadow = true;
            scene.add(desk);

            const monGeo = new THREE.BoxGeometry(0.8, 0.6, 0.1);
            const monMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
            const mon = new THREE.Mesh(monGeo, monMat);
            mon.position.set(centerX + col * 3.5, 1.1, centerZ + row * 2.5);
            scene.add(mon);
          }
        }
      } else if (room.type === 'SEMINAR_HALL') {
        for (let tier = 1; tier <= 4; tier++) {
          const tierRadius = 4 + tier * 2.5;
          const arcGeo = new THREE.TorusGeometry(tierRadius, 0.45, 6, 16, Math.PI * 0.7);
          const arcMat = new THREE.MeshStandardMaterial({ color: 0xf43f5e, roughness: 0.5 });
          const arcMesh = new THREE.Mesh(arcGeo, arcMat);
          arcMesh.rotation.x = -Math.PI / 2;
          arcMesh.rotation.z = Math.PI * 0.65;
          arcMesh.position.set(centerX, 0.3 + tier * 0.35, centerZ);
          scene.add(arcMesh);
        }
        const stageGeo = new THREE.BoxGeometry(5, 0.4, 2);
        const stageMat = new THREE.MeshStandardMaterial({ color: 0xe11d48 });
        const stage = new THREE.Mesh(stageGeo, stageMat);
        stage.position.set(centerX, 0.2, centerZ - 5);
        scene.add(stage);
      } else if (room.type === 'STAFF_ROOM' || room.type === 'OFFICE') {
        const confGeo = new THREE.BoxGeometry(4.5, 0.8, 2.2);
        const confMat = new THREE.MeshStandardMaterial({ color: 0x34d399, metalness: 0.2 });
        const confTable = new THREE.Mesh(confGeo, confMat);
        confTable.position.set(centerX, 0.4, centerZ);
        confTable.castShadow = true;
        scene.add(confTable);
      } else if (room.type === 'STAIRS') {
        for (let step = 0; step < 5; step++) {
          const stepGeo = new THREE.BoxGeometry(2.5, 0.25, 0.6);
          const stepMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b });
          const stepMesh = new THREE.Mesh(stepGeo, stepMat);
          stepMesh.position.set(centerX, 0.15 + step * 0.25, centerZ - 1.2 + step * 0.6);
          scene.add(stepMesh);
        }
      }

      // Add Floating 3D Text Label
      const labelSprite = createTextSprite(room.name, `${room.areaM2} m²`, room.color.badge);
      labelSprite.position.set(centerX, wallHeight + 2.5, centerZ);
      scene.add(labelSprite);
      roomLabelsRef.current.set(room.id, labelSprite);
    });

    // 7. Animation Loop
    let clock = new THREE.Clock();
    const animate = () => {
      animationFrameId.current = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth camera lookAt interpolation
      currentLookAt.current.lerp(targetLookAt.current, 0.08);
      if (cameraRef.current) {
        cameraRef.current.lookAt(currentLookAt.current);
      }

      // Float room labels slightly
      roomLabelsRef.current.forEach((sprite, id) => {
        const isSel = selectedRoom?.id === id;
        const baseOffset = isSel ? 3.5 : 2.5;
        const currentY = (GROUND_FLOOR_ROOMS.find((r) => r.id === id)?.type === 'CENTRAL_HUB' ? 0.8 : 3.8) + baseOffset;
        sprite.position.y = currentY + Math.sin(elapsedTime * 2 + (id.charCodeAt(3) || 0)) * 0.2;
      });

      // Render
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    animate();

    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      renderer.dispose();
    };
  }, []);

  // Update camera position with vertical safety bounds
  const updateCameraPosition = () => {
    if (!cameraRef.current) return;
    const { radius, theta, phi } = spherical.current;
    const x = currentLookAt.current.x + radius * Math.sin(phi) * Math.sin(theta);
    const y = currentLookAt.current.y + radius * Math.cos(phi);
    const z = currentLookAt.current.z + radius * Math.sin(phi) * Math.cos(theta);
    cameraRef.current.position.set(x, y, z);
    cameraRef.current.lookAt(currentLookAt.current);

    const deg = Math.round((theta * 180) / Math.PI) % 360;
    setAzimuthDegrees(deg < 0 ? deg + 360 : deg);
  };

  // Synchronize Active Route in 3D
  useEffect(() => {
    if (!sceneRef.current) return;
    const scene = sceneRef.current;

    if (routeLineRef.current) {
      scene.remove(routeLineRef.current);
      routeLineRef.current = null;
    }

    if (activeRouteWaypoints.length > 1) {
      const group = new THREE.Group();
      const points: THREE.Vector3[] = activeRouteWaypoints.map((wp) => {
        const [x, z] = mapCoords(wp.x, wp.y);
        return new THREE.Vector3(x, 1.5, z);
      });

      const curve = new THREE.CatmullRomCurve3(points);
      const tubeGeo = new THREE.TubeGeometry(curve, 64, 0.45, 8, false);
      const tubeMat = new THREE.MeshBasicMaterial({
        color: 0x06b6d4, // Glowing Cyan
        wireframe: false,
        transparent: true,
        opacity: 0.95,
      });
      const tube = new THREE.Mesh(tubeGeo, tubeMat);
      group.add(tube);

      // Waypoint Pins
      points.forEach((pt, idx) => {
        const isEnd = idx === points.length - 1;
        const pinGeo = new THREE.SphereGeometry(idx === 0 || isEnd ? 1.0 : 0.45, 16, 16);
        const pinMat = new THREE.MeshBasicMaterial({
          color: isEnd ? 0x10b981 : 0x06b6d4,
        });
        const pin = new THREE.Mesh(pinGeo, pinMat);
        pin.position.copy(pt);
        group.add(pin);
      });

      scene.add(group);
      routeLineRef.current = group;
    }
  }, [activeRouteWaypoints]);

  // Synchronize Room Selection
  useEffect(() => {
    if (!selectedRoom || !sceneRef.current) return;

    roomMeshesRef.current.forEach((mesh, id) => {
      const mat = mesh.material as THREE.MeshStandardMaterial;
      if (id === selectedRoom.id) {
        mat.color.set(0x06b6d4); // Bright Cyan
        mat.opacity = 0.95;
        mat.emissive = new THREE.Color(0x0891b2);
        mat.emissiveIntensity = 0.5;
      } else {
        mat.color.set(0x1e293b);
        mat.opacity = 0.78;
        mat.emissive = new THREE.Color(0x000000);
        mat.emissiveIntensity = 0;
      }
    });

    const [cx, cz] = mapCoords(selectedRoom.position.labelX, selectedRoom.position.labelY);
    targetLookAt.current.set(cx, 1, cz);
    updateCameraPosition();
  }, [selectedRoom]);

  // 360° Mouse Orbit & Pan
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      isDragging.current = true;
    } else if (e.button === 2) {
      isRightDragging.current = true;
    }
    previousMousePosition.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const deltaX = e.clientX - previousMousePosition.current.x;
    const deltaY = e.clientY - previousMousePosition.current.y;

    if (isDragging.current) {
      // 360° Horizontal Orbit
      spherical.current.theta -= deltaX * 0.008;
      // Vertical angle safety clamp (keeps elevated bird's-eye view, prevents clipping below ground)
      spherical.current.phi = Math.max(0.15, Math.min(Math.PI / 2.35, spherical.current.phi - deltaY * 0.008));
      updateCameraPosition();
    } else if (isRightDragging.current) {
      const panSpeed = 0.08;
      const cos = Math.cos(spherical.current.theta);
      const sin = Math.sin(spherical.current.theta);
      targetLookAt.current.x -= (deltaX * cos - deltaY * sin) * panSpeed;
      targetLookAt.current.z -= (deltaX * sin + deltaY * cos) * panSpeed;
      updateCameraPosition();
    }

    previousMousePosition.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    isRightDragging.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    spherical.current.radius = Math.max(40, Math.min(180, spherical.current.radius + e.deltaY * 0.08));
    updateCameraPosition();
  };

  const handleClick = (e: React.MouseEvent) => {
    if (!containerRef.current || !cameraRef.current || !sceneRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, cameraRef.current);

    const meshes = Array.from(roomMeshesRef.current.values());
    const intersects = raycaster.intersectObjects(meshes, true);

    if (intersects.length > 0) {
      const hit = intersects[0].object;
      const roomData = hit.userData?.roomData as GroundFloorRoom;
      if (roomData) {
        onSelectRoom(roomData);
      }
    }
  };

  // Camera presets
  const setCameraTopView = () => {
    spherical.current.phi = 0.12;
    spherical.current.radius = 110;
    updateCameraPosition();
  };

  const setCameraFrontView = () => {
    spherical.current.theta = 0;
    spherical.current.phi = Math.PI / 2.8;
    spherical.current.radius = 105;
    updateCameraPosition();
  };

  const resetCamera = () => {
    spherical.current = { radius: 105, theta: Math.PI / 4, phi: Math.PI / 3.4 };
    targetLookAt.current.set(0, 0, 0);
    currentLookAt.current.set(0, 0, 0);
    updateCameraPosition();
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      onClick={handleClick}
      onContextMenu={(e) => e.preventDefault()}
      className="relative w-full h-full cursor-grab active:cursor-grabbing select-none overflow-hidden"
    >
      {/* 3D Camera Controls Overlay */}
      <div className="absolute top-16 left-4 z-20 flex flex-wrap items-center gap-2 pointer-events-auto bg-slate-900/85 backdrop-blur-md border border-slate-800 p-1.5 rounded-xl shadow-lg">
        <button
          onClick={resetCamera}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          title="Reset Camera View"
        >
          <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
          <span>Reset</span>
        </button>
        <div className="w-px h-4 bg-slate-800" />
        <button
          onClick={setCameraTopView}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
        >
          <Eye className="w-3.5 h-3.5 text-slate-400" />
          <span>Top View</span>
        </button>
        <button
          onClick={setCameraFrontView}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
        >
          <Box className="w-3.5 h-3.5 text-slate-400" />
          <span>Front View</span>
        </button>
      </div>

      {/* 360° Orbit Indicator Pill */}
      <div className="absolute bottom-4 left-4 z-20 pointer-events-none flex items-center gap-2 bg-slate-900/80 backdrop-blur-md border border-slate-800/80 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-400">
        <Compass className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: '10s' }} />
        <span>360° Orbit: {azimuthDegrees}°</span>
        <span className="text-[10px] text-slate-500 hidden sm:inline">• Drag to rotate, scroll to zoom</span>
      </div>
    </div>
  );
}
