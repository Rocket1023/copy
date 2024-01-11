<template>
  <div class="main">
    <div id="screen" class="screen"></div>
    <div class="btn_wrapper">
      <el-button type="primary" @click="backFirstScene">初始场景</el-button>
      <el-button  type="primary" @click="floorManage">楼层管理</el-button>
      <el-button  type="primary">水力监测</el-button>
      <el-button  type="primary">电力监测</el-button>
      <el-button @click="topFly"  type="danger">楼顶上天</el-button>
    </div>
  </div>
</template>
<script>
import * as THREE from 'three'
import $bus from '@/bus'
import initThree from './initThree'
let app 
export default {
  props: {

  },
  components: {

  },
  data () {
    return {

    }
  },
  created () {

  },
  mounted () {
    app = new initThree('screen');
    app.initScene();
    app.initLight();
    window.addEventListener('resize',this.windowResize);
    //  $bus.$on('createFloorButton',this.createFloorButton)
  },
  methods: {
    windowResize() {
      
    },
    floorManage() {
      app.floorManage()
    },
    backFirstScene() {
      app.backFirstScene()
    },
    topFly(){
      app.topFly()
    },
    createFloorButton() {
      console.log('createFloorButton');
    }
  },
}
</script>
<style scoped lang="less" scoped>
  .main{
    width: 100%;
    height: 100%;
    position: relative;
    .screen {
      width: 100%;
      height: 100%;
      position: fixed;
      left:0;
      top: 0;
      background-color:#000;
    }
    .btn_wrapper {
      width: 100%;
      height: 10%;
      // background-color: lime;
      display: flex;
      align-items: center;
      justify-content: center;
      position: fixed;
      left: 0;
      bottom: 0;
    }
  }
</style>
