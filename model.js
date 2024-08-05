import * as THREE from "three";
const apiUrl = "http://localhost:3001/getDumpPoints";

export async function fetchPoints() {
  try {
    const response = await fetch(apiUrl, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    return data;
  } catch (error) {
    console.error("Error making the request:", error.message);
  }
}

export async function sendPoints(dataToSend) {
  const apiUrl = "http://localhost:3001/setGridMarkers";

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(dataToSend),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    console.log("Success:", data);
  } catch (error) {
    console.error("Error:", error);
  }
}

const jsonData = [
  {
    index: 1,
    x: 0,
    y: 0,
    z: 0,
  },
];

export let currentPoints = []; 

export async function loadData(scene,loadingSpinner) {
  clearDots(scene, currentPoints);
  loadingSpinner.style.display = 'block';
  await sendPoints(jsonData);
  const dotGeometry = new THREE.SphereGeometry(0.8, 32, 16);
  try {
  const points = await fetchPoints();
  console.log(points);

  const offsetX = -22;
  const offsetY = -1.5;
  const offsetZ = 0.3;
  const scaleY = 100;
  const scaleX = 117;

  function createDot(point) {
    let color = point.color;
    if ((color === "#FF0000")) {
      color = "#FC0000";
    }
    const dotMaterial = new THREE.MeshPhongMaterial({ color });

    const dot = new THREE.Mesh(dotGeometry, dotMaterial);
    const x = point.x * scaleX + offsetX;
    const y = point.y * scaleY + offsetY;
    const z = point.z === 0 ? point.z + 3 : point.z + offsetZ;

    dot.position.set(x, y, z);
    scene.add(dot);
    currentPoints.push(dot);
  }

  points.forEach((point) => {
    createDot(point);
  });
  loadingSpinner.style.display = 'none';
  } catch (error) {
    console.error("Error:", error);
    loadingSpinner.style.display = 'none';
    alert('Cannot load a data.');
  }
}

function clearDots(scene, points) {
  points.forEach((dot) => {
    scene.remove(dot);
  });
}