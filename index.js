import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { STLLoader } from "three/addons/loaders/STLLoader.js";

let visualData = {};

fetch("./e1/visualization_info.json")
  .then((response) => response.json())
  .then((data) => {
    visualData = data;
  })
  .catch((error) => console.error("Error loading JSON:", error));

const w = window.innerWidth;
const h = window.innerHeight;

const RED = 0xFF3333;
const GREEN = 0x00ff80;
const BLUE = 0x3399FF;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(w, h);
document.body.appendChild(renderer.domElement);
const fov = 75;
const aspect = w / h;
const near = 0.1;
const far = 5000;

const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.position.z = 2;
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xA0A0A0);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.03;

// const geo = new THREE.BoxGeometry(1, 1, 1);
// const mat = new THREE.MeshStandardMaterial({
//   color: 0xffffff,
//   flatShading: true,
// //   wireframe: true,
//   // wireframeLinewidth: 3
// });

const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff);

// const light = new THREE.DirectionalLight(0xffffff, 1);
// light.position.set(5, 5, 5).normalize();
// scene.add(light);
// const mesh = new THREE.Mesh(geo, mat);
// scene.add(mesh);
// scene.add( line );
scene.add(hemiLight);
camera.position.z = 200;

function animate(t = 0) {
  requestAnimationFrame(animate);
  // mesh.rotation.y = t * 0.0001
  controls.update();
  renderer.render(scene, camera);
  camera.rotateX(0.001)
}

const loader = new STLLoader();
loader.load("/e1/output_mesh.stl", function (geometry) {
  const materialX = new THREE.MeshPhongMaterial({
    color: BLUE,
  });
  const materialY = new THREE.MeshPhongMaterial({
    color: RED,
  });
  const materialZ = new THREE.MeshPhongMaterial({
    color: GREEN,
  });

  const numberX = visualData.n_items.x;
  const numberY = visualData.n_items.y;
  const numberZ = visualData.n_items.z;
  const {x: deltaX, y: deltaY, z: deltaZ} = visualData.deltas

  const exampleMesh =  new THREE.Mesh(geometry, materialX);
  const worldScale = new THREE.Vector3();
//   exampleMesh.parent.updateMatrixWorld()
  exampleMesh.geometry.computeBoundingBox();

  // Get the bounding box
  const boundingBox = exampleMesh.geometry.boundingBox;
  
  // Calculate the dimensions
  const size = new THREE.Vector3();
  boundingBox.getSize(size);
  
  // Now size.x, size.y, and size.z contain the dimensions
  console.log(`Size: x=${size.x}, y=${size.y}, z=${size.z}`);

  let positions = {
    x : 0,
    y : 0,
    z : 0,
  }

  for(let i = 0; i < numberX; i++){
    const mesh  = new  THREE.Mesh(geometry, materialX);
    mesh.scale.set(0.2,0.2,0.2)
    mesh.position.set(positions.x, 0 , 0)
    scene.add(mesh)
    positions.x = positions.x  + deltaX * 0.2;
  }

  for(let j = 0; j < numberY; j++){
    const mesh  = new  THREE.Mesh(geometry, materialY);
    mesh.scale.set(0.2,0.2,0.2)
    mesh.position.set(0, positions.y , 0)
    scene.add(mesh)
    positions.y = positions.y  + deltaY * 0.2;
  }
  for(let k = 0; k < numberZ; k++){
    const mesh  = new  THREE.Mesh(geometry, materialZ);
    mesh.scale.set(0.2,0.2,0.2)
    mesh.position.set(0, 0 , positions.z)
    scene.add(mesh)
    positions.z = positions.z + deltaZ * 0.2;
  }
    // const mesh1 = new THREE.Mesh(geometry, materialX);
    // const mesh2 = new THREE.Mesh(geometry, materialX);
  //   mesh2.scale.set(0.1,0.1,0.1)
    // mesh2.position.set(69,0,0)
    // scene.add(mesh1);
    // scene.add(mesh2);
});

animate();

window.addEventListener("resize", () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
});
