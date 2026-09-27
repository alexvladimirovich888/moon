import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { LunarSector, SectorStatus } from '../../types/sector';
import moonAlbedoUrl from '../../assets/images/moon_albedo_map_1790530830128.jpg';
import { Maximize2, RotateCcw, Eye, Compass, ZoomIn, ZoomOut, CheckCircle, Clock, Compass as CompassIcon } from 'lucide-react';

interface MoonSceneProps {
  sectors: LunarSector[];
  selectedSector: LunarSector | null;
  onSelectSector: (sector: LunarSector | null) => void;
  filterStatus?: SectorStatus | 'all';
}

// Convert lunar latitude and longitude to 3D Cartesian coordinates on sphere
function latLonToVector3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return new THREE.Vector3(x, y, z);
}

// Fallback high-contrast procedural lunar texture in case of network latency
function createProceduralMoonCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Base lunar regolith gray
  ctx.fillStyle = '#83868c';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Dark lunar maria (volcanic basalt patches)
  const maria = [
    { x: 380, y: 220, rx: 110, ry: 90, color: '#383b42' },
    { x: 260, y: 190, rx: 150, ry: 130, color: '#32353a' },
    { x: 500, y: 190, rx: 90, ry: 80, color: '#3e4147' },
    { x: 620, y: 210, rx: 70, ry: 60, color: '#36393f' },
    { x: 330, y: 130, rx: 100, ry: 70, color: '#303338' },
    { x: 420, y: 320, rx: 80, ry: 60, color: '#3a3d44' },
    { x: 200, y: 280, rx: 120, ry: 90, color: '#33363c' },
  ];

  maria.forEach((m) => {
    const grad = ctx.createRadialGradient(m.x, m.y, m.rx * 0.1, m.x, m.y, m.rx);
    grad.addColorStop(0, m.color);
    grad.addColorStop(0.7, '#4e5158');
    grad.addColorStop(1, '#83868c');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(m.x, m.y, m.rx, m.ry, 0, 0, Math.PI * 2);
    ctx.fill();
  });

  // Impact craters with bright rims
  for (let i = 0; i < 220; i++) {
    const cx = Math.random() * canvas.width;
    const cy = Math.random() * canvas.height;
    const cr = 2 + Math.random() * 16;
    ctx.fillStyle = '#222428';
    ctx.beginPath();
    ctx.arc(cx, cy, cr, 0, Math.PI * 2);
    ctx.fill();

    // Bright rim
    ctx.strokeStyle = '#cdd0d8';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(cx, cy, cr, Math.PI * 0.8, Math.PI * 1.8);
    ctx.stroke();
  }

  return canvas;
}

export const MoonScene: React.FC<MoonSceneProps> = ({
  sectors,
  selectedSector,
  onSelectSector,
  filterStatus = 'all',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Mode states
  const [mapMode, setMapMode] = useState<boolean>(false);
  const [hoveredSector, setHoveredSector] = useState<LunarSector | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number; visible: boolean }>({
    x: 0,
    y: 0,
    visible: false,
  });

  // Three.js refs for animation & controls
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const moonMeshRef = useRef<THREE.Mesh | null>(null);
  const atmosphereRef = useRef<THREE.Mesh | null>(null);
  const gridGroupRef = useRef<THREE.Group | null>(null);
  const markersGroupRef = useRef<THREE.Group | null>(null);
  const markerMeshesMap = useRef<Map<string, THREE.Object3D>>(new Map());

  // Orbit & inertia state
  const isDragging = useRef<boolean>(false);
  const previousPointerPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const rotationVelocity = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const cameraDistance = useRef<number>(5.8);
  const targetDistance = useRef<number>(5.8);
  const targetCameraPos = useRef<THREE.Vector3 | null>(null);
  const targetLookAt = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  const currentLookAt = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  const isAutoRotating = useRef<boolean>(true);
  const idleTimer = useRef<number | null>(null);
  const animationFrameId = useRef<number | null>(null);

  const RADIUS = 2.4;

  // Initialize Three.js scene
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x040508);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000);
    camera.position.set(0, 0.8, 5.8);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    rendererRef.current = renderer;

    // 4. Starfield (1,800 stars)
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 1800;
    const starPositions = new Float32Array(starCount * 3);
    const starSizes = new Float32Array(starCount);

    for (let i = 0; i < starCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 40 + Math.random() * 50;

      const sinPhi = Math.sin(phi);
      starPositions[i * 3] = r * sinPhi * Math.cos(theta);
      starPositions[i * 3 + 1] = r * sinPhi * Math.sin(theta);
      starPositions[i * 3 + 2] = r * Math.cos(phi);

      starSizes[i] = Math.random() < 0.9 ? 1.0 : 2.2;
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeometry.setAttribute('size', new THREE.BufferAttribute(starSizes, 1));

    const starMaterial = new THREE.PointsMaterial({
      color: 0xd8e4f8,
      size: 1.2,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.75,
    });
    const starPoints = new THREE.Points(starGeometry, starMaterial);
    scene.add(starPoints);

    // 5. Lighting
    // Directional Sun light (sharp planetary contrast, key light)
    const sunLight = new THREE.DirectionalLight(0xfff8ee, 2.8);
    sunLight.position.set(12, 4, 9);
    scene.add(sunLight);

    // Subtle Earthshine fill light (cool blue-tinted fill from opposite direction)
    const earthshine = new THREE.DirectionalLight(0x284060, 0.45);
    earthshine.position.set(-8, -2, -6);
    scene.add(earthshine);

    // Ambient space illumination
    const ambientLight = new THREE.AmbientLight(0x0c1018, 0.35);
    scene.add(ambientLight);

    // 6. Moon Mesh
    const moonGeometry = new THREE.SphereGeometry(RADIUS, 64, 64);

    // Texture loading with high quality texture and procedural fallback
    const textureLoader = new THREE.TextureLoader();
    const proceduralCanvas = createProceduralMoonCanvas();
    const proceduralTexture = new THREE.CanvasTexture(proceduralCanvas);
    proceduralTexture.colorSpace = THREE.SRGBColorSpace;

    const moonMaterial = new THREE.MeshStandardMaterial({
      map: proceduralTexture,
      roughness: 0.92,
      metalness: 0.04,
      bumpScale: 0.04,
    });

    const moonMesh = new THREE.Mesh(moonGeometry, moonMaterial);
    scene.add(moonMesh);
    moonMeshRef.current = moonMesh;

    // Load actual high-resolution generated lunar albedo texture
    textureLoader.load(
      moonAlbedoUrl,
      (loadedTexture) => {
        loadedTexture.colorSpace = THREE.SRGBColorSpace;
        loadedTexture.wrapS = THREE.RepeatWrapping;
        loadedTexture.wrapT = THREE.ClampToEdgeWrapping;
        moonMaterial.map = loadedTexture;
        moonMaterial.bumpMap = loadedTexture;
        moonMaterial.needsUpdate = true;
      },
      undefined,
      (err) => {
        console.warn('Fallback procedural texture remains active', err);
      }
    );

    // 7. Subtle Atmospheric / Rim Fresnel Glow
    const atmosphereGeometry = new THREE.SphereGeometry(RADIUS * 1.018, 48, 48);
    const atmosphereMaterial = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vViewDir;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vViewDir = normalize(cameraPosition - worldPos.xyz);
          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        varying vec3 vViewDir;
        void main() {
          float rim = 1.0 - max(dot(vNormal, vViewDir), 0.0);
          rim = pow(rim, 3.8);
          gl_FragColor = vec4(0.35, 0.55, 0.85, rim * 0.32);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      depthWrite: false,
    });
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    scene.add(atmosphere);
    atmosphereRef.current = atmosphere;

    // 8. Celestial Grid Lines (Latitude & Longitude Map Mode)
    const gridGroup = new THREE.Group();
    gridGroup.visible = false;
    scene.add(gridGroup);
    gridGroupRef.current = gridGroup;

    const gridMaterial = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.18,
    });

    // Parallels (Latitude lines every 20 degrees)
    for (let lat = -80; lat <= 80; lat += 20) {
      const latPoints: THREE.Vector3[] = [];
      for (let lon = -180; lon <= 180; lon += 5) {
        latPoints.push(latLonToVector3(lat, lon, RADIUS * 1.002));
      }
      const latGeom = new THREE.BufferGeometry().setFromPoints(latPoints);
      const latLine = new THREE.Line(latGeom, gridMaterial);
      gridGroup.add(latLine);
    }

    // Meridians (Longitude lines every 30 degrees)
    for (let lon = -180; lon < 180; lon += 30) {
      const lonPoints: THREE.Vector3[] = [];
      for (let lat = -90; lat <= 90; lat += 3) {
        lonPoints.push(latLonToVector3(lat, lon, RADIUS * 1.002));
      }
      const lonGeom = new THREE.BufferGeometry().setFromPoints(lonPoints);
      const lonLine = new THREE.Line(lonGeom, gridMaterial);
      gridGroup.add(lonLine);
    }

    // 9. Sectors Group attached directly to moonMesh so they rotate with the Moon!
    const markersGroup = new THREE.Group();
    moonMesh.add(markersGroup);
    markersGroupRef.current = markersGroup;

    // Resize handler
    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // Animation Loop
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      // Smooth idle rotation
      if (isAutoRotating.current && moonMeshRef.current && !selectedSector) {
        moonMeshRef.current.rotation.y += delta * 0.04;
      }

      // Inertia damping on manual rotation
      if (!isDragging.current && moonMeshRef.current) {
        moonMeshRef.current.rotation.y += rotationVelocity.current.x;
        moonMeshRef.current.rotation.x += rotationVelocity.current.y;

        rotationVelocity.current.x *= 0.92;
        rotationVelocity.current.y *= 0.92;
      }

      // Smooth camera distance interpolation (Zoom)
      cameraDistance.current += (targetDistance.current - cameraDistance.current) * 0.1;

      // Smooth camera position and look-at interpolation when a sector is selected
      if (targetCameraPos.current) {
        camera.position.lerp(targetCameraPos.current, 0.08);
        currentLookAt.current.lerp(targetLookAt.current, 0.08);
        camera.lookAt(currentLookAt.current);
      } else {
        // Standard orbit camera orientation
        const camDir = camera.position.clone().normalize();
        camera.position.copy(camDir.multiplyScalar(cameraDistance.current));
        camera.lookAt(0, 0, 0);
      }

      // Pulsing pulse effects on acquired beacons
      if (markersGroupRef.current) {
        const time = clock.getElapsedTime();
        markersGroupRef.current.children.forEach((child) => {
          const ring = child.getObjectByName('pulseRing');
          if (ring) {
            const scale = 1 + Math.sin(time * 3 + (child.id % 5)) * 0.22;
            ring.scale.set(scale, scale, scale);
          }
        });
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      renderer.dispose();
      moonGeometry.dispose();
      moonMaterial.dispose();
      atmosphereGeometry.dispose();
      atmosphereMaterial.dispose();
      starGeometry.dispose();
      starMaterial.dispose();
    };
  }, []);

  // Update sectors on the 3D Moon
  useEffect(() => {
    const markersGroup = markersGroupRef.current;
    if (!markersGroup) return;

    // Clear previous markers
    while (markersGroup.children.length > 0) {
      const child = markersGroup.children[0];
      markersGroup.remove(child);
      if ((child as any).geometry) (child as any).geometry.dispose();
      if ((child as any).material) {
        if (Array.isArray((child as any).material)) {
          (child as any).material.forEach((m: any) => m.dispose());
        } else {
          (child as any).material.dispose();
        }
      }
    }
    markerMeshesMap.current.clear();

    // Rebuild sector markers based on filter
    sectors.forEach((sec) => {
      if (filterStatus !== 'all' && sec.status !== filterStatus) return;

      const sectorGroup = new THREE.Group();
      sectorGroup.userData = { sector: sec };

      const surfacePos = latLonToVector3(sec.latitude, sec.longitude, RADIUS * 1.006);
      sectorGroup.position.copy(surfacePos);

      // Orient marker perpendicular to the lunar surface
      sectorGroup.lookAt(surfacePos.clone().multiplyScalar(2));

      // Color scheme based on status
      let baseColor = 0xcbd5e1; // Available: platinum silver
      let glowColor = 0x38bdf8;
      if (sec.status === 'acquired') {
        baseColor = 0x22d3ee; // Acquired: cyan phosphor
        glowColor = 0x06b6d4;
      } else if (sec.status === 'reserved') {
        baseColor = 0xf59e0b; // Reserved: telemetry amber
        glowColor = 0xd97706;
      }

      const isSelected = selectedSector?.id === sec.id;
      const markerSize = isSelected ? 0.08 : 0.055;

      // 1. Center interactive focal disc
      const coreGeom = new THREE.CircleGeometry(markerSize, 24);
      const coreMat = new THREE.MeshBasicMaterial({
        color: isSelected ? 0xffffff : baseColor,
        side: THREE.DoubleSide,
        depthTest: true,
      });
      const coreMesh = new THREE.Mesh(coreGeom, coreMat);
      coreMesh.name = 'coreDisc';
      sectorGroup.add(coreMesh);

      // 2. Concentric boundary ring
      const ringGeom = new THREE.RingGeometry(markerSize * 1.3, markerSize * 1.55, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: baseColor,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: isSelected ? 0.95 : 0.65,
      });
      const ringMesh = new THREE.Mesh(ringGeom, ringMat);
      ringMesh.name = 'boundaryRing';
      sectorGroup.add(ringMesh);

      // 3. For Acquired or Selected: outer animated pulse ring
      if (sec.status === 'acquired' || isSelected) {
        const pulseGeom = new THREE.RingGeometry(markerSize * 1.9, markerSize * 2.15, 32);
        const pulseMat = new THREE.MeshBasicMaterial({
          color: glowColor,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.5,
        });
        const pulseMesh = new THREE.Mesh(pulseGeom, pulseMat);
        pulseMesh.name = 'pulseRing';
        sectorGroup.add(pulseMesh);

        // Subtle vertical beacon needle extending outwards
        const needleGeom = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(0, 0, 0.18),
        ]);
        const needleMat = new THREE.LineBasicMaterial({
          color: glowColor,
          transparent: true,
          opacity: 0.8,
        });
        const needle = new THREE.Line(needleGeom, needleMat);
        sectorGroup.add(needle);
      }

      // Invisible hit-test sphere for generous raycast clicking/hovering
      const hitGeom = new THREE.SphereGeometry(0.12, 8, 8);
      const hitMat = new THREE.MeshBasicMaterial({ visible: false });
      const hitMesh = new THREE.Mesh(hitGeom, hitMat);
      hitMesh.name = 'hitTarget';
      hitMesh.userData = { sector: sec };
      sectorGroup.add(hitMesh);

      markersGroup.add(sectorGroup);
      markerMeshesMap.current.set(sec.id, sectorGroup);
    });
  }, [sectors, filterStatus, selectedSector]);

  // Update map mode grid visibility
  useEffect(() => {
    if (gridGroupRef.current) {
      gridGroupRef.current.visible = mapMode;
    }
  }, [mapMode]);

  // Handle focus transition when a sector is selected
  useEffect(() => {
    if (!selectedSector || !moonMeshRef.current || !cameraRef.current) {
      targetCameraPos.current = null;
      targetLookAt.current.set(0, 0, 0);
      return;
    }

    // Stop auto-rotation while inspecting a sector
    isAutoRotating.current = false;

    // Calculate sector position in world space considering current moon rotation
    const localSectorPos = latLonToVector3(
      selectedSector.latitude,
      selectedSector.longitude,
      RADIUS * 1.01
    );
    const worldSectorPos = localSectorPos.clone().applyMatrix4(moonMeshRef.current.matrixWorld);

    // Target camera position: offset along the normal from the sector at comfortable inspection distance
    const normal = worldSectorPos.clone().normalize();
    const desiredCameraPos = normal.multiplyScalar(4.1);

    targetCameraPos.current = desiredCameraPos;
    targetLookAt.current = worldSectorPos;
  }, [selectedSector]);

  // Reset view to default orbit
  const handleResetView = useCallback(() => {
    onSelectSector(null);
    targetCameraPos.current = null;
    targetDistance.current = 5.8;
    targetLookAt.current.set(0, 0, 0);
    isAutoRotating.current = true;
  }, [onSelectSector]);

  // Zoom controls
  const handleZoom = (direction: 'in' | 'out') => {
    const delta = direction === 'in' ? -0.8 : 0.8;
    targetDistance.current = Math.max(3.4, Math.min(8.5, targetDistance.current + delta));
  };

  // Pointer drag for Moon rotation
  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    previousPointerPos.current = { x: e.clientX, y: e.clientY };
    rotationVelocity.current = { x: 0, y: 0 };
    isAutoRotating.current = false;

    if (idleTimer.current) window.clearTimeout(idleTimer.current);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const container = containerRef.current;
    const camera = cameraRef.current;
    const moonMesh = moonMeshRef.current;
    if (!container || !camera || !moonMesh) return;

    if (isDragging.current) {
      const deltaX = e.clientX - previousPointerPos.current.x;
      const deltaY = e.clientY - previousPointerPos.current.y;

      previousPointerPos.current = { x: e.clientX, y: e.clientY };

      const rotateSpeed = 0.005;
      moonMesh.rotation.y += deltaX * rotateSpeed;
      moonMesh.rotation.x += deltaY * rotateSpeed;

      // Track velocity for inertia
      rotationVelocity.current = {
        x: deltaX * rotateSpeed * 0.45,
        y: deltaY * rotateSpeed * 0.45,
      };

      // Hide hover tooltip while actively dragging
      if (tooltipPos.visible) {
        setTooltipPos((prev) => ({ ...prev, visible: false }));
      }
      return;
    }

    // Raycast hover check when not dragging
    const rect = container.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), camera);

    if (markersGroupRef.current) {
      const intersects = raycaster.intersectObjects(markersGroupRef.current.children, true);
      const hitTarget = intersects.find((hit) => hit.object.name === 'hitTarget');

      if (hitTarget && hitTarget.object.userData?.sector) {
        const sec: LunarSector = hitTarget.object.userData.sector;
        setHoveredSector(sec);
        setTooltipPos({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top - 16,
          visible: true,
        });
        container.style.cursor = 'pointer';
        return;
      }
    }

    // Hover check directly on Moon sphere for custom crosshair
    const moonIntersects = raycaster.intersectObject(moonMesh);
    if (moonIntersects.length > 0) {
      container.style.cursor = 'grab';
    } else {
      container.style.cursor = 'default';
    }

    if (hoveredSector) {
      setHoveredSector(null);
      setTooltipPos((prev) => ({ ...prev, visible: false }));
    }
  };

  const handlePointerUp = () => {
    isDragging.current = false;

    // Resume auto-rotation after 6s of inactivity if not inspecting a sector
    if (!selectedSector) {
      if (idleTimer.current) window.clearTimeout(idleTimer.current);
      idleTimer.current = window.setTimeout(() => {
        isAutoRotating.current = true;
      }, 5000);
    }
  };

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomDelta = e.deltaY * 0.003;
    targetDistance.current = Math.max(3.4, Math.min(8.5, targetDistance.current + zoomDelta));
  };

  // Click handler to select sector
  const handleClick = (e: React.MouseEvent) => {
    const container = containerRef.current;
    const camera = cameraRef.current;
    if (!container || !camera || !markersGroupRef.current) return;

    const rect = container.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), camera);

    const intersects = raycaster.intersectObjects(markersGroupRef.current.children, true);
    const hitTarget = intersects.find((hit) => hit.object.name === 'hitTarget');

    if (hitTarget && hitTarget.object.userData?.sector) {
      const sec: LunarSector = hitTarget.object.userData.sector;
      onSelectSector(sec);
      setTooltipPos((prev) => ({ ...prev, visible: false }));
    }
  };

  // Keyboard shortcut: ESC to clear selection
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedSector) {
        handleResetView();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedSector, handleResetView]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[76vh] md:h-[84vh] min-h-[520px] select-none touch-none overflow-hidden"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onWheel={handleWheel}
      onClick={handleClick}
    >
      {/* Three.js Canvas */}
      <canvas ref={canvasRef} className="w-full h-full block" />

      {/* Floating Hover Tooltip (Section 6: SECTOR 042 / 12.5 SOL / AVAILABLE) */}
      {tooltipPos.visible && hoveredSector && (
        <div
          style={{
            left: `${tooltipPos.x}px`,
            top: `${tooltipPos.y}px`,
            transform: 'translate(-50%, -100%)',
          }}
          className="pointer-events-none absolute z-30 px-3 py-2 bg-slate-950/90 backdrop-blur-md border border-white/15 rounded-lg shadow-2xl transition-all duration-75 text-left"
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs font-bold text-white tracking-wider">
              {hoveredSector.id}
            </span>
            <span
              className={`text-[10px] font-mono uppercase tracking-wider ${
                hoveredSector.status === 'acquired'
                  ? 'text-cyan-400'
                  : hoveredSector.status === 'reserved'
                  ? 'text-amber-400'
                  : 'text-slate-300'
              }`}
            >
              {hoveredSector.status}
            </span>
          </div>
          <div className="text-xs font-semibold text-slate-100 truncate max-w-[190px]">
            {hoveredSector.name}
          </div>
          <div className="flex items-center justify-between gap-4 mt-1 pt-1 border-t border-white/10 text-[11px] font-mono text-slate-400">
            <span>PRICE</span>
            <span className="text-white font-bold">{hoveredSector.priceSol} SOL</span>
          </div>
        </div>
      )}

      {/* Viewport Control Overlay (Bottom Left: HUD Controls) */}
      <div className="absolute bottom-5 left-6 z-20 flex flex-wrap items-center gap-2 pointer-events-auto">
        <button
          onClick={() => setMapMode(!mapMode)}
          aria-label="Toggle Coordinate Grid"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
            mapMode
              ? 'bg-cyan-950/70 border-cyan-500/50 text-cyan-200'
              : 'bg-black/60 border-white/10 text-slate-300 hover:text-white hover:border-white/20'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>{mapMode ? 'GRID ON' : 'MAP GRID'}</span>
        </button>

        <button
          onClick={handleResetView}
          aria-label="Reset Camera View"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-black/60 hover:bg-black/80 text-slate-300 hover:text-white border border-white/10 hover:border-white/20 rounded-lg text-xs font-medium transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>RESET VIEW</span>
        </button>

        <div className="flex items-center gap-1 bg-black/60 border border-white/10 rounded-lg p-0.5">
          <button
            onClick={() => handleZoom('in')}
            aria-label="Zoom In"
            className="p-1 text-slate-400 hover:text-white transition-colors"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <span className="w-px h-3 bg-white/10" />
          <button
            onClick={() => handleZoom('out')}
            aria-label="Zoom Out"
            className="p-1 text-slate-400 hover:text-white transition-colors"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Legend & Telemetry (Bottom Right) */}
      <div className="hidden sm:flex absolute bottom-5 right-6 z-20 items-center gap-4 px-3.5 py-2 bg-black/60 backdrop-blur-md border border-white/10 rounded-lg text-xs font-mono text-slate-300">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
          <span>ACQUIRED ({sectors.filter((s) => s.status === 'acquired').length})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span>RESERVED ({sectors.filter((s) => s.status === 'reserved').length})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-slate-400" />
          <span>AVAILABLE ({sectors.filter((s) => s.status === 'available').length})</span>
        </div>
      </div>

      {/* Inspection Notice if sector is selected */}
      {selectedSector && (
        <div className="absolute top-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-3 py-1.5 bg-black/70 backdrop-blur-md border border-cyan-500/40 rounded-full text-xs font-mono text-cyan-200 shadow-xl">
          <Eye className="w-3.5 h-3.5 text-cyan-400" />
          <span>INSPECTING {selectedSector.id}</span>
          <span className="text-slate-400">·</span>
          <span className="text-slate-400">ESC to return</span>
        </div>
      )}
    </div>
  );
};
