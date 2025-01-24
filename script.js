import * as THREE from "three";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { createGround, createScene, createLights } from "./scene";
import { loadData, currentPoints } from "./model";

let renderer, dirLight, hemiLight, mixer, loader, composer;
let modelColor, lightControls, dirLightPosition, radiusControls;
const { scene, camera } = createScene();
const colors = {
  red: true,
  yellow: true,
};
const loadingSpinner = document.getElementById("loading-spinner");
const clock = new THREE.Clock();

init();
animate();

function init() {
  loadingSpinner.style.display = "block";
  const lights = createLights(scene);

  createGround(scene);

  loadModel(() => {
    loadingSpinner.style.display = "none";
  });
  createRenderer();

  createControls();

  addGUI(loadingSpinner);
}

function loadModel(loading) {
  loader = new FBXLoader();
  loader.load(
    "/model/Panel5.fbx",
    (object) => {
      object.position.y = 108;

      object.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      scene.add(object);
      loader.object = object;
      if (loading) {
        loading();
      }
    },
    (xhr) => {},
    (error) => {
      console.error("Error:", error);
      alert("Failed to load model.");
      loadingSpinner.style.display = "none";
    }
  );
}

function createRenderer() {
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;

  const container = document.createElement("div");
  document.body.appendChild(container);
  container.appendChild(renderer.domElement);

  composer = new EffectComposer(renderer);
  composer.setSize(window.innerWidth, window.innerHeight);

  const renderScene = new RenderPass(scene, camera);
  composer.addPass(renderScene);

  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.5,
    0.8,
    0.1
  );
  bloomPass.threshold = 0.2;
  bloomPass.strength = 0.2;
  bloomPass.radius = 1;
  composer.addPass(bloomPass);

  window.addEventListener("resize", onWindowResize);
}

function createControls() {
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 100, 0);
  controls.update();
}

function addGUI(loadingSpinner) {
  const gui = new GUI();

  gui
    .add(
      {
        loadDataWrapper: async () => {
          await loadData(scene, loadingSpinner);
        },
      },
      "loadDataWrapper"
    )
    .name("Load Data");

  const colorFilterFolder = gui.addFolder("Filter");

  colorFilterFolder
    .add(colors, "red")
    .name("red")
    .onChange(function () {
      filterPoints();
    });
  colorFilterFolder
    .add(colors, "yellow")
    .name("yellow")
    .onChange(function () {
      filterPoints();
    });

  const zoomFilterFolder = gui.addFolder("Zoom");
  radiusControls = {
    radius: 0.8,
  };
  zoomFilterFolder.add(radiusControls, "radius", 0, 5).onChange(updateRadius);
  const labelsFolder = gui.addFolder("Labels");
  labelsFolder.add({ "Perfect Value": "6.44mm" }, "Perfect Value").disable();
  labelsFolder.add({ Warnings: "< 5mm" }, "Warnings").disable();
  labelsFolder.add({ Dangers: "< 4mm" }, "Dangers").disable();
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight); // Update composer size on window resize
}

function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();

  if (mixer) mixer.update(delta);

  composer.render();
}

function filterPoints() {
  const isRedChecked = colors.red;
  const isYellowChecked = colors.yellow;

  currentPoints.forEach((point) => {
    const isRedDot = point.material.color.r === 0.9734452903978066;
    const isYellowDot =
      point.material.color.r === 1 && point.material.color.g === 1;

    if (isRedChecked && isYellowChecked) {
      if (isRedDot || isYellowDot) {
        point.visible = true;
      }
    } else if (isRedChecked) {
      if (isRedDot) {
        point.visible = true;
      } else {
        point.visible = false;
      }
    } else if (isYellowChecked) {
      if (isYellowDot) {
        point.visible = true;
      } else {
        point.visible = false;
      }
    } else {
      point.visible = false;
    }
  });
}

function updateRadius() {
  currentPoints.forEach((point) => {
    point.geometry.boundingSphere.radius = radiusControls.radius;
    point.scale.set(
      radiusControls.radius,
      radiusControls.radius,
      radiusControls.radius
    );
  });
}
