import * as THREE from "three";


const initialCameraPosition = new THREE.Vector3(0, 200, 350);
export function createGround(scene) {
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(2000, 2000),
    new THREE.MeshPhongMaterial({ color: 0x999999, depthWrite: false })
  );
  ground.rotation.x = -Math.PI / 2;

  ground.receiveShadow = true;
  scene.add(ground);

  const grid = new THREE.GridHelper(2000, 20, 0x000000, 0x000000);
  grid.material.opacity = 0.2;
  grid.material.transparent = true;
  scene.add(grid);
}

export function createScene() {
  const container = document.createElement("div");
  document.body.appendChild(container);

  const camera = new THREE.PerspectiveCamera(
    55,
    window.innerWidth / window.innerHeight,
    1,
    2000
  );
  camera.position.copy(initialCameraPosition);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xa0a0a0);
  return { scene, camera };
}
export function createLights(scene) {
  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 5);
  hemiLight.position.set(0, 300, 100);
  scene.add(hemiLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 2);
  dirLight.position.set(0, 300, 200);
  dirLight.castShadow = true;
  dirLight.shadow.camera.top = 180;
  dirLight.shadow.camera.bottom = -100;
  dirLight.shadow.camera.left = -120;
  dirLight.shadow.camera.right = 120;
  scene.add(dirLight);


  const dirLightPosition = {
    x: dirLight.position.x,
    y: dirLight.position.y,
    z: dirLight.position.z,
  };

  return { hemiLight, dirLight, dirLightPosition };
}