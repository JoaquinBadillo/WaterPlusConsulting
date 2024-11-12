import {
  WebGLRenderer,
  Scene,
  PerspectiveCamera,
  AmbientLight,
  DirectionalLight,
  Color,
  MeshBasicMaterial,
} from "three";
import { CSS2DRenderer } from "three/examples/jsm/renderers/CSS2DRenderer.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import ThreeGlobe from "three-globe";
import React, { useEffect } from "react";

import { GLOBE_SETTINGS } from "../constants";
import globeData from '@/assets/globe-data.json';
import countries from '@/assets/countries.json';

import type { GlobeInitParams, FrameData } from "@/types.ts";

export const initializeGlobe = ({ 
  containerRef, 
  globeData, 
  windowCenter,
  mousePosition,
  setOpenModal,
}: GlobeInitParams) => {
  const container = containerRef.current;
  if (!container) return;
  container.innerHTML = "";

  const scene = new Scene();

  const globe = new ThreeGlobe({ waitForGlobeReady: true, animateIn: true })
    .hexPolygonsData(globeData.features)
    .hexPolygonResolution(3)
    .hexPolygonMargin(1)
    .hexPolygonUseDots(true)
    .hexPolygonColor(() => GLOBE_SETTINGS.COLORS.polygon)
    .atmosphereAltitude(GLOBE_SETTINGS.atmosphereLevel)

  globe
    .htmlElementsData(Object.entries(countries.countriesCollection))
    .htmlLat(([, d]: any) => parseFloat(d.coordinates[0]))
    .htmlLng(([, d]: any) => parseFloat(d.coordinates[1]))
    .htmlAltitude(0.02)
    .htmlElement(([iso3, _d]: any) => {
      const el = document.createElement('button');
      el.innerHTML = iso3.toUpperCase();
      el.classList.add(
        'country-marker',
        'bg-gray-700',
        'rounded-lg',
        'hover:bg-blue-800',
        'text-white',
        'p-2',
        'hidden',
      );

      el.id = `label-${iso3}`
      el.addEventListener('click', (event) => {
        event.preventDefault();
        setOpenModal(iso3);
      });        
      return el;
    });

  const globeMaterial = new MeshBasicMaterial({
    color: new Color(GLOBE_SETTINGS.COLORS.globe),
  });
  globe.position.y = 0;
  globe.globeMaterial(globeMaterial);

  scene.add(globe);
  scene.add(new AmbientLight(new Color(GLOBE_SETTINGS.COLORS.ambientLight), 1));

  const camera = new PerspectiveCamera();


  const width = window.innerWidth >= 1024 ? window.innerWidth / 2 : window.innerWidth;
  const height = window.innerWidth >= 800 ? window.innerHeight : window.innerHeight * 0.85;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  const dLight1 = new DirectionalLight(
    new Color(GLOBE_SETTINGS.COLORS.emissionLight),
    2
  );
  dLight1.shadow.normalBias = 2;
  dLight1.position.set(-200, -100, 200);
  dLight1.castShadow = false;
  camera.add(dLight1);
  camera.position.z = (width >= 1024) ? 400 : 300;
  camera.position.y = (width >= 1024) ? 200 : 150;

  scene.add(camera);

  const renderers = [new WebGLRenderer(), new CSS2DRenderer()];

  renderers.forEach((r, idx) => {
    r.setSize(width, height);
    if (idx > 0) {
      r.domElement.style.position = "absolute";
      r.domElement.style.top = "0px";
      r.domElement.style.pointerEvents = "none";
    }
    container.appendChild(r.domElement);
  });


  const controls = new OrbitControls(camera, renderers[0].domElement);
  controls.enableDamping = true;
  controls.enablePan = false;
  controls.minDistance = 200;
  controls.maxDistance = 1000;
  controls.rotateSpeed = 0.4;
  controls.zoomSpeed = 1;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.3;

  globe.setPointOfView(camera.position, globe.position);
  controls.addEventListener("change", () =>
    globe.setPointOfView(camera.position, globe.position)
  );

  const onWindowResize = () => {
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    windowCenter.x = width / 1.5;
    windowCenter.y = height / 1.5;
    renderers.forEach((r) => r.setSize(width, height));
  };

  const onMouseMove = (event: {clientX: number, clientY: number}) => {
    mousePosition.x = event.clientX - windowCenter.x;
    mousePosition.y = event.clientY - windowCenter.y;
  };

  window.addEventListener("resize", onWindowResize, false);
  document.addEventListener("mousemove", onMouseMove);

  return { scene, camera, controls, globe, renderers };
};


export const useGlobe = (
  containerRef: React.MutableRefObject<any>,
  setFrameData: null | ((d: FrameData) => any),
  setGlobe: null | ((d: FrameData["globe"]) => any),
  setOpenModal: (iso3: string) => void,
) => {
  useEffect(() => {
    if (!containerRef.current || !setFrameData || !setGlobe || !setOpenModal)
      return;

    const width = window.innerWidth >= 1024 ? window.innerWidth / 2 : window.innerWidth;
    const height = window.innerWidth >= 1024 ? window.innerHeight : window.innerHeight * 0.85;
  
    const initData = initializeGlobe({
      containerRef,
      globeData,
      windowCenter: { x: width / 2, y: height / 2 },
      mousePosition: { x: 0, y: 0 },
      setOpenModal,
    });
  
    if (initData) {
      setFrameData(initData as FrameData)
      setGlobe(initData.globe)
    }
  }, [containerRef, setFrameData, setGlobe, setOpenModal]);
}

