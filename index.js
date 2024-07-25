import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { STLLoader } from "three/addons/loaders/STLLoader.js";

let visualData = {};

const RED = 0xff3333;
const GREEN = 0x00ff80;
const BLUE = 0x3399ff;

fetch("./e2/visualization_info.json")
  .then((response) => response.json())
  .then((data) => {
    visualData = data;
  })
  .catch((error) => console.error("Error loading JSON:", error));


const w = window.innerWidth;
const h = window.innerHeight;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(w, h);
document.body.appendChild(renderer.domElement);
const fov = 75;
const aspect = w / h;
const near = 0.1;
const far = 10000;

const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
// camera.position.set(4000, 0, -2000);
camera.lookAt(0, 0, 0);
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xa0a0a0);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.03;

const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff);
scene.add(hemiLight);

const loader = new STLLoader();
loader.load("/e2/output_mesh.stl", function (geometry) {
  const materialX = new THREE.MeshPhongMaterial({
    color: BLUE,
  });
  const materialY = new THREE.MeshPhongMaterial({
    color: RED,
  });
  const materialZ = new THREE.MeshPhongMaterial({
    color: GREEN,
  });

  const {x: numberX, y: numberY, z: numberZ} = visualData.n_items;
  // const numberX = 1000;
  // const numberY = 1000;
  // const numberZ = 1000;
  const { x: deltaX, y: deltaY, z: deltaZ } = visualData.deltas;
  const lines = visualData.lines;
  let positions = {
    x: 0,
    y: 0,
    z: 0,
  };

  for (let i = 0; i < numberX; i++) {
    // let positions = {
    //   x: 0,
    //   y: 0,
    //   z: 0,
    // };
    positions.y = 0

    // const mesh = new THREE.Mesh(geometry, materialX);
    // mesh.position.set(positions.x, 0, 0);
    // scene.add(mesh);
    // positions.x = positions.x + deltaX;
    for (let j = 0; j < numberY; j++) {
      positions.z = 0
      // const mesh = new THREE.Mesh(geometry, materialY);
      // mesh.position.set(0, positions.y, 0);
      // scene.add(mesh);
      // positions.y = positions.y + deltaY;
      for (let k = 0; k < numberZ; k++) {
        const mesh = new THREE.Mesh(geometry, materialZ);
        mesh.position.set(positions.x, positions.y, positions.z);
        scene.add(mesh);
        positions.z = positions.z + deltaZ;
      }
      positions.y = positions.y + deltaY
    }
    positions.x = positions.x + deltaX
  }



  lines.map((pointsArray) => {
    const point1 = new THREE.Vector3(
      pointsArray[0][0],
      pointsArray[0][1],
      pointsArray[0][2]
    );
    const point2 = new THREE.Vector3(
      pointsArray[1][0],
      pointsArray[1][1],
      pointsArray[1][2]
    );
    const points = [point1, point2];
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color: 0x0000ff });
    const line = new THREE.Line(geometry, material);
    scene.add(line);
  });
  camera.position.set(numberX * deltaX + 5000, 0, numberZ * deltaZ );
});

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

animate();

window.addEventListener("resize", () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
});
