import * as THREE from 'three'
import $bus from '@/bus'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import TWEEN from 'three/examples/jsm/libs/tween.module.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { CSS3DRenderer, CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js';
const floorBaseMaterial = new THREE.MeshBasicMaterial({
  color: 0x00beff,
  transparent: true,
  opacity: 0.1,
  depthWrite: false
});
function deepClone(target) {
  return JSON.parse(JSON.stringify(target))
}
export default class initThree {
  constructor(id) {
    this.id = id;
    this.el = document.getElementById(this.id);
  }
  gltfLader = new GLTFLoader();
  cssRenderer = new CSS3DRenderer();
  buildLabels = []
  // el = document.getElementById(this.id);
  // 初始化场景
  initScene() {
    
    this.isInit = true;
    this.initCameraPosition = [-75, 90, 120];// 相机的初始位置
    this.floorManageCameraPosition = [0, 95, 125]// 点击楼层管理后，相机的位置。
    this.currentCameraPosition = [-75, 90, 120]; // 记录每次相机移动后位置
    this.width = this.el.offsetWidth;
    this.height = this.el.offsetHeight;
    this.scene = new THREE.Scene();
    this.renderer = new THREE.WebGLRenderer({
      antialias: true, //开启抗锯齿
      alpha: true // 开启透明
    });
    this.cssRenderer.setSize(this.width, this.height);
    this.cssRenderer.domElement.style.position = 'absolute'
    this.cssRenderer.domElement.style.top = 0
    this.cssRenderer.domElement.style.pointerEvents = 'none';
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.width, this.height);
    window.addEventListener('resize', () => {
      this.width = this.el.offsetWidth;
      this.height = this.el.offsetHeight;
      this.camera.aspect = this.width / this.height;
      this.renderer.setSize(this.width, this.height);
      this.camera.updateProjectionMatrix();
      if (this.cssRenderer) {
        this.cssRenderer.setSize(this.width, this.height);
      }
    })
    this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 0.1, 1000);
    this.camera.position.set(...this.initCameraPosition);
    this.camera.lookAt(0, 0, 0);
    let controls = new OrbitControls(this.camera, this.renderer.domElement);
    controls.enableDamping = true;
    controls.enableZoom = true;
    controls.autoRotate = false;
    controls.autoRotateSpeed = 0.5;
    controls.enablePan = true;
    controls.maxPolarAngle = Math.PI / 2.2;
    controls.addEventListener('end', () => {
      let cameraPosition = this.camera.position;
      this.currentCameraPosition = [cameraPosition.x, cameraPosition.y, cameraPosition.z];
    })
    this.controls = controls;
    let _this = this;
    this.el.appendChild(this.renderer.domElement);
    this.el.appendChild(this.cssRenderer.domElement)
    this.gltfLader.load('model/model.glb', (glb) => {
      this.mainModel = glb.scene;
      let allItem = [];
      glb.scene.traverse(i => {
        if (i.material) {
          i.initMaterial = i.material; // 设置初始材质
        }
        allItem.push(i)
      })
      this.allItem = allItem;
      this.scene.add(glb.scene);
    })
    function onMouseClick() { 
      const innermostModel = _this.findInnermostModel(event, _this.scene, _this.camera);
      console.log(event.target,'event.target')
      if (innermostModel) {
        console.log(innermostModel,'targetModel')
      }
    }
    this.el.addEventListener('click', onMouseClick, false);
    function animate() {
      _this.renderer.render(_this.scene, _this.camera);
      _this.cssRenderer.render(_this.scene, _this.camera);
      _this.controls.update();
      TWEEN.update();
      requestAnimationFrame(animate)
    }
    animate()
  }
  // 初始化灯光
  initLight() {
    const ambientLight = new THREE.AmbientLight('#6d78d0', 0.4);  //创建环境光，均匀照亮场景中的所有物体，没有方向，不能投射阴影
    this.scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight('#3e9ae0', 0.2); // 创建平行光
    directionalLight.position.set(-100, 100, -100);
    directionalLight.castShadow = true; //开启投射阴影
    this.scene.add(directionalLight);
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    directionalLight.shadow.camera.near = 10;
    directionalLight.shadow.camera.far = 300;
    directionalLight.shadow.camera.top = 100;
    directionalLight.shadow.camera.bottom = -100;
    directionalLight.shadow.camera.left = -100;
    directionalLight.shadow.camera.right = 100;
    directionalLight.shadow.bias = 0.05;
    directionalLight.shadow.normalBias = 0.05;
    // const helper = new THREE.CameraHelper(directionalLight.shadow.camera);
    // this.scene.add(helper);
  }
  // 点击楼层管理事件处理函数
  floorManage() {
    this.flyTo({
      position: [this.floorManageCameraPosition[0], this.floorManageCameraPosition[1], this.floorManageCameraPosition[2]],
      target: [0, 0, 0],
      done: () => { 
        this.isInit = false;
        this.toogleBuildText('add');
      }
    })
  }
  // 返回初始场景
  backFirstScene() {
    this.flyTo({
      position: [this.initCameraPosition[0], this.initCameraPosition[1], this.initCameraPosition[2]],
      target: [0, 0, 0],
      done: () => {
        this.resetSourceMaterial();
        this.toogleBuildText('distory');
        this.isInit = true;
      }
    })
  }
  // 获取世界坐标
  getWorldPosition(model) {
    this.scene.updateMatrixWorld(true);
    let globalPosition = new THREE.Vector3();
    return model.getWorldPosition(globalPosition);
  }
  toogleBuildText(act) { 
    if (act === 'add') {// 创建楼编号文本信息 
      this.mainModel.traverse(item => {
        if (item.name.startsWith('楼顶')) {
          const element = document.createElement('div');
          element.innerHTML = item.parent.name;
          element.className = 'top_label';
          element.style.cursor = 'pointer';
          element.style.color = 'white'; // 设置文字颜色
          element.style.fontSize = '16px'; // 设置文字大小
          element.onclick = () => {
            let buildLabel = element.innerHTML;
            this.changeOnterMaterial(buildLabel);
          }
          const label = new CSS3DObject(element);
          this.buildLabels.push(label)
          let positionObj = this.getWorldPosition(item);
          let { x, y, z } = positionObj
          label.scale.set(0.1, 0.1, 0.1)
          this.scene.add(label);// 直接向场景中添加,简单粗暴
          label.position.set(x, y + 3, z);
        }
      })
    } else {//销毁楼物编号文本
      this.buildLabels.forEach(label => {
        this.scene.remove(label)
      })
      this.buildLabels = [];
    }
  }
  topFly() {
    this.mainModel.traverse(model => {
      if (model.name === '楼顶') {
        model.position.set(0, 50, 0);
        let topPosition = this.getWorldPosition(model)
        console.log(topPosition)
        this.flyTo({
          position:[topPosition.x,topPosition.y-20,topPosition.z],
          controls: [topPosition.x, topPosition.y - 50, topPosition.z],
          duration:2000,
          done: () => { 
            console.log(this.controls.target)
          }
        })
      }
    })
  }
  // 点击楼栋编号,把其他模型设置为线性透明材质
  changeOnterMaterial(label) {
    this.mainModel.children.forEach(item => {
      if (item.name !== label) {
        item.traverse(i => {
          if (i.material) {
            i.material = floorBaseMaterial;
          }
        })
      } else {
        item.traverse(i => {
          if (i.material) {
            i.material = i.initMaterial;
          }
        })
      }
    })
  }
  // 恢复原始材质
  resetSourceMaterial() { 
    this.mainModel.children.forEach(item => {
      item.traverse(i => {
        if (i.material) {
          i.material = i.initMaterial;
        }
      })
    })
  }
  flyTo(option) {
    option.position = option.position || []; // 相机新的位置
    option.controls = option.controls || []; // 控制器新的中心点位置(围绕此点旋转等)
    option.duration = option.duration || 1000; // 飞行时间
    option.easing = option.easing || TWEEN.Easing.Linear.None;
    const curPosition = this.camera.position;
    const controlsTar = this.controls.target;
    const tween = new TWEEN.Tween({
      x1: curPosition.x, // 相机当前位置x
      y1: curPosition.y, // 相机当前位置y
      z1: curPosition.z, // 相机当前位置z
      x2: controlsTar.x, // 控制当前的中心点x
      y2: controlsTar.y, // 控制当前的中心点y
      z2: controlsTar.z // 控制当前的中心点z
    }).to({
      x1: option.position[0], // 新的相机位置x
      y1: option.position[1], // 新的相机位置y
      z1: option.position[2], // 新的相机位置z
      x2: option.controls[0], // 新的控制中心点位置x
      y2: option.controls[1], // 新的控制中心点位置x
      z2: option.controls[2] // 新的控制中心点位置x
    }, option.duration).easing(TWEEN.Easing.Linear.None); // TWEEN.Easing.Cubic.InOut //匀速
    tween.onUpdate(() => {
      this.controls.enabled = false;
      this.camera.position.set(tween._object.x1, tween._object.y1, tween._object.z1);
      this.controls.target.set(tween._object.x2, tween._object.y2, tween._object.z2);
      this.controls.update();
    });
    tween.onStart(() => {
      this.controls.enabled = false;
      if (option.start instanceof Function) {
        option.start();
      }
    });
    tween.onComplete(() => {
      this.controls.enabled = true;
      if (option.done instanceof Function) {
        option.done();
      }
    });
    tween.onStop(() => (option.stop instanceof Function ? option.stop() : ''));
    tween.start();
    // TWEEN.add(tween);
    // return tween;
  }
  findInnermostModel(event, scene, camera) {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // 计算鼠标在屏幕空间的位置
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // 设置射线的起点和方向
    raycaster.setFromCamera(mouse, camera);

    // 递归函数，用于检测每一层子模型
    function checkIntersections(objects) {
        const intersects = raycaster.intersectObjects(objects);

        if (intersects.length > 0) {
            // 找到相交的对象
            const selectedObject = intersects[0].object;

            // 如果有子模型，则递归调用
            if (selectedObject.children.length > 0) {
                return checkIntersections(selectedObject.children);
            } else {
                // 如果没有子模型，说明是最内层模型
                return selectedObject;
            }
        }

        // 没有相交的对象
        return null;
    }

    // 从场景的顶层开始检测
    return checkIntersections(scene.children);
  }
}