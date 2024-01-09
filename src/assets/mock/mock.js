import * as THREE from 'three';

const floors = ['A栋', 'B栋', 'C栋', 'D栋'];
const layers = ['1F', '2F', '3F', '4F', '5F', '6F', '7F', '8F', '9F', '10F'];
const rooms = ['101', '102', '103', '104'];

const parkData = {};

floors.forEach((v) => {
  parkData[v] = {};
  layers.forEach((k) => {
    parkData[v][k] = {};
    rooms.forEach((j) => {
      parkData[v][k][j] = {
        水: THREE.MathUtils.randInt(5, 20),
        电: THREE.MathUtils.randInt(200, 500)
      };
    });
  });
});

console.log(parkData);

const cameraUrls = {
  摄像头A: `movie/${THREE.MathUtils.randInt(1, 3)}.mp4`,
  摄像头B: `movie/${THREE.MathUtils.randInt(1, 3)}.mp4`,
  摄像头C: `movie/${THREE.MathUtils.randInt(1, 3)}.mp4`
};

const roomTexts = [
  {
    name: '摄像头',
    x: 0,
    y: 0.5,
    z: 0,
    class: 'camera-bg',
    type: '摄像头'
  },
  {
    name: '水管',
    x: 0,
    y: 0.5,
    z: 0,
    class: 'water-bg',
    type: '电'
  },
  {
    name: '电表',
    x: 0,
    y: 0.5,
    z: 0,
    class: 'electricity-bg',
    type: '电'
  }
];

export { parkData, roomTexts, cameraUrls };
