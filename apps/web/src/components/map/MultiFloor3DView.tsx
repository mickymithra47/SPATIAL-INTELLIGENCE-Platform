'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  FloorLevel,
  CampusRoomEntity,
  MultiFloorWaypoint,
  getEntitiesForFloor,
  ALL_CAMPUS_ENTITIES,
} from '../../services/campusMultiFloorData';
import { RotateCcw, Compass, Box, Eye, Layers } from 'lucide-react';

interface MultiFloor3DViewProps {
  activeFloor: FloorLevel;
  selectedEntity: CampusRoomEntity | null;
  onSelectEntity: (entity: CampusRoomEntity) => void;
  activeRouteWaypoints?: MultiFloorWaypoint[];
  blockedWaypoints?: string[];
  viewAllFloorsStacked?: boolean;
}

export function MultiFloor3DView({
  activeFloor,
  selectedEntity,
  onSelectEntity,
  activeRouteWaypoints = [],
  blockedWaypoints = [],
  viewAllFloorsStacked = false,
}: MultiFloor3DViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const animationFrameId = useRef<number | null>(null);

  // Orbit & Pan state
  const isDragging = useRef(false);
  const isRightDragging = useRef(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });
  const spherical = useRef({ radius: 110, theta: Math.PI / 4, phi: Math.PI / 3.4 });
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0));
  const currentLookAt = useRef(new THREE.Vector3(0, 0, 0));

  const roomMeshesRef = useRef<Map<string, THREE.Mesh>>(new Map());
  const roomLabelsRef = useRef<Map<string, THREE.Sprite>>(new Map());
  const routeLineRef = useRef<THREE.Object3D | null>(null);

  const [azimuthDegrees, setAzimuthDegrees] = useState(45);

  const mapCoords = (x: number, y: number): [number, number] => {
    return [(x - 500) * 0.14, -(y - 480) * 0.14];
  };

  const getFloorElevation = (floor: FloorLevel): number => {
    if (!viewAllFloorsStacked) return 0;
    switch (floor) {
      case 'GROUND': return 0;
      case 'FIRST': return 8;
      case 'SECOND': return 16;
      case 'TERRACE': return 24;
    }
  };

  const createTextSprite = (text: string, subtext: string, colorHex: string) => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 96;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
    ctx.beginPath();
    ctx.roundRect(8, 8, 240, 80, 14);
    ctx.fill();

    ctx.strokeStyle = colorHex;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(8, 8, 240, 80, 14);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 128, 38);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '15px system-ui, sans-serif';
    ctx.fillText(subtext, 128, 66);

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(9.5, 3.8, 1);
    return sprite;
  };

  const buildScene = () => {
    if (!sceneRef.current) return;
    const scene = sceneRef.current;

    // Clear old meshes
    roomMeshesRef.current.clear();
    roomLabelsRef.current.clear();
    while (scene.children.length > 0) {
      scene.remove(scene.children[0]);
    }

    // Lights
    const ambientLight = new THREE.AmbientLight(0xdbeafe, 1.4);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 2.4);
    dirLight.position.set(60, 120, 60);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.6);
    rimLight.position.set(-60, 50, -60);
    scene.add(rimLight);

    // Ground Base Slab
    const groundGeo = new THREE.PlaneGeometry(180, 180);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x0a101d, roughness: 0.85 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.05;
    scene.add(ground);

    const grid = new THREE.GridHelper(160, 40, 0x1e293b, 0x0f172a);
    grid.position.y = 0.01;
    scene.add(grid);

    // Determine rooms to render
    const roomsToRender = viewAllFloorsStacked
      ? ALL_CAMPUS_ENTITIES
      : getEntitiesForFloor(activeFloor);

    roomsToRender.forEach((room) => {
      const elevation = getFloorElevation(room.floor);
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
      floorMesh.position.y = elevation + 0.05;
      scene.add(floorMesh);

      // Walls
      const wallHeight = room.type === 'CENTRAL_HUB' ? 0.8 : room.floor === 'TERRACE' ? 2.5 : 3.8;
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
      wallMesh.position.y = elevation;
      wallMesh.userData = { roomId: room.id, roomData: room };
      scene.add(wallMesh);
      roomMeshesRef.current.set(room.id, wallMesh);

      // Glowing Edges
      const edges = new THREE.EdgesGeometry(wallGeo);
      const lineMat = new THREE.LineBasicMaterial({ color: hexColor, transparent: true, opacity: 0.85 });
      const wireframe = new THREE.LineSegments(edges, lineMat);
      wireframe.rotation.x = -Math.PI / 2;
      wireframe.position.y = elevation;
      scene.add(wireframe);

      // Interior items
      const [centerX, centerZ] = mapCoords(room.position.labelX, room.position.labelY);

      // Add 3D text sprite
      const labelSprite = createTextSprite(
        room.refLabel || room.name,
        `(${room.areaM2} m² · ${room.capacity} cap)`,
        room.color.badge
      );
      labelSprite.position.set(centerX, elevation + wallHeight + 2.4, centerZ);
      scene.add(labelSprite);
      roomLabelsRef.current.set(room.id, labelSprite);
    });
  };

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060913);
    scene.fog = new THREE.FogExp2(0x060913, 0.0035);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000);
    cameraRef.current = camera;
    updateCameraPosition();

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    rendererRef.current = renderer;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    buildScene();

    let clock = new THREE.Clock();
    const animate = () => {
      animationFrameId.current = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      currentLookAt.current.lerp(targetLookAt.current, 0.08);
      if (cameraRef.current) {
        cameraRef.current.lookAt(currentLookAt.current);
      }

      roomLabelsRef.current.forEach((sprite, id) => {
        const room = ALL_CAMPUS_ENTITIES.find((r) => r.id === id);
        const elev = room ? getFloorElevation(room.floor) : 0;
        const baseH = (room?.type === 'CENTRAL_HUB' ? 0.8 : 3.8) + 2.4;
        sprite.position.y = elev + baseH + Math.sin(elapsedTime * 2 + (id.charCodeAt(3) || 0)) * 0.15;
      });

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

  // Rebuild scene when activeFloor or viewAllFloorsStacked changes
  useEffect(() => {
    buildScene();
  }, [activeFloor, viewAllFloorsStacked]);

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

  // Synchronize 3D Route
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
        const y = getFloorElevation(wp.floor) + 1.6;
        return new THREE.Vector3(x, y, z);
      });

      const curve = new THREE.CatmullRomCurve3(points);
      const tubeGeo = new THREE.TubeGeometry(curve, 64, 0.45, 8, false);
      const tubeMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.95 });
      const tube = new THREE.Mesh(tubeGeo, tubeMat);
      group.add(tube);

      points.forEach((pt, idx) => {
        const isEnd = idx === points.length - 1;
        const pinGeo = new THREE.SphereGeometry(idx === 0 || isEnd ? 1.0 : 0.45, 16, 16);
        const pinMat = new THREE.MeshBasicMaterial({ color: isEnd ? 0x10b981 : 0x06b6d4 });
        const pin = new THREE.Mesh(pinGeo, pinMat);
        pin.position.copy(pt);
        group.add(pin);
      });

      scene.add(group);
      routeLineRef.current = group;
    }
  }, [activeRouteWaypoints, activeFloor, viewAllFloorsStacked]);

  // Synchronize Selection Highlight
  useEffect(() => {
    if (!selectedEntity || !sceneRef.current) return;

    roomMeshesRef.current.forEach((mesh, id) => {
      const mat = mesh.material as THREE.MeshStandardMaterial;
      if (id === selectedEntity.id) {
        mat.color.set(0x06b6d4);
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

    const [cx, cz] = mapCoords(selectedEntity.position.labelX, selectedEntity.position.labelY);
    const elev = getFloorElevation(selectedEntity.floor);
    targetLookAt.current.set(cx, elev + 1, cz);
    updateCameraPosition();
  }, [selectedEntity]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) isDragging.current = true;
    else if (e.button === 2) isRightDragging.current = true;
    previousMousePosition.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const deltaX = e.clientX - previousMousePosition.current.x;
    const deltaY = e.clientY - previousMousePosition.current.y;

    if (isDragging.current) {
      spherical.current.theta -= deltaX * 0.008;
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
    spherical.current.radius = Math.max(40, Math.min(220, spherical.current.radius + e.deltaY * 0.08));
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
      const roomData = hit.userData?.roomData as CampusRoomEntity;
      if (roomData) {
        onSelectEntity(roomData);
      }
    }
  };

  const resetCamera = () => {
    spherical.current = { radius: 110, theta: Math.PI / 4, phi: Math.PI / 3.4 };
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
      {/* 3D Camera Controls */}
      <div className="absolute top-16 left-4 z-20 flex flex-wrap items-center gap-1.5 pointer-events-auto bg-slate-900/90 backdrop-blur-md border border-slate-800 p-1.5 rounded-xl shadow-lg">
        <button
          onClick={resetCamera}
          className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          title="Reset Camera"
        >
          <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
          <span>Reset</span>
        </button>
        <div className="w-px h-3.5 bg-slate-800" />
        <button
          onClick={() => {
            spherical.current.phi = 0.12;
            spherical.current.radius = 110;
            updateCameraPosition();
          }}
          className="px-2 py-1 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
        >
          Top
        </button>
        <button
          onClick={() => {
            spherical.current.theta = 0;
            spherical.current.phi = Math.PI / 2.8;
            spherical.current.radius = 105;
            updateCameraPosition();
          }}
          className="px-2 py-1 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
        >
          Front
        </button>
      </div>

      {/* 360° Orbit Indicator */}
      <div className="absolute bottom-4 left-4 z-20 pointer-events-none flex items-center gap-2 bg-slate-900/80 backdrop-blur-md border border-slate-800/80 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-400">
        <Compass className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: '10s' }} />
        <span>360° WebGL Orbit: {azimuthDegrees}°</span>
        <span className="text-[10px] text-slate-500 hidden sm:inline">• Drag to rotate, scroll to zoom</span>
      </div>
    </div>
  );
}
