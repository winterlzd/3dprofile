import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { orbitCamera, panCamera, worldAtPointer, fitDistance } from '../src/camera.js';

function createCamera() {
  const camera = new THREE.PerspectiveCamera(38, 1440 / 900, 1, 15000);
  camera.position.set(45, 70, 1850);
  camera.lookAt(0, 0, 0);
  camera.updateMatrixWorld();
  return camera;
}

test('middle-drag keeps any pressed pivot at exactly the same screen position', () => {
  for (const pivot of [new THREE.Vector3(0, 0, 0), new THREE.Vector3(400, 300, 18), new THREE.Vector3(-500,-300,40)]) {
    const camera = createCamera();
    const initial = pivot.clone().project(camera);
    const distance = camera.position.distanceTo(pivot);
    for (let i = 0; i < 40; i++) {
      orbitCamera(camera, pivot, i%2? -6:4, i%3? 2:-3);
      const projected = pivot.clone().project(camera);
      assert.ok(initial.distanceTo(projected) < 1e-10, 'pivot must not drift on screen');
      assert.ok(Math.abs(camera.position.distanceTo(pivot)-distance) < 1e-8);
    }
  }
});

test('pointer ray hits the requested panel depth and projects back to the pointer', () => {
  const camera = createCamera();
  const bounds = {left:20,top:15,width:1440,height:900};
  for(const [x,y,z] of [[140,230,0],[690,345,28],[1020,705,105]]) {
    const point = worldAtPointer(camera,x,y,bounds,z);
    assert.ok(point);
    assert.ok(Math.abs(point.z-z)<1e-10);
    const projected=point.clone().project(camera);
    assert.ok(Math.abs((projected.x+1)/2*bounds.width+bounds.left-x)<1e-8);
    assert.ok(Math.abs((1-projected.y)/2*bounds.height+bounds.top-y)<1e-8);
  }
});

test('left drag moves along screen axes without changing orientation',()=>{
  const camera=createCamera();
  const quaternion=camera.quaternion.clone();
  const before=new THREE.Vector3(20,10,0).project(camera);
  panCamera(camera,100,50,2);
  const after=new THREE.Vector3(20,10,0).project(camera);
  assert.ok(after.x>before.x);
  assert.ok(after.y<before.y);
  assert.ok(quaternion.angleTo(camera.quaternion)<1e-10);
});

test('orbit refuses to flip text panels backwards',()=>{
  const camera=createCamera();
  for(let i=0;i<100;i++) orbitCamera(camera,new THREE.Vector3(),30,5);
  const facing=new THREE.Vector3(0,0,1).applyQuaternion(camera.quaternion);
  assert.ok(facing.z>=.28);
  assert.ok(Number.isFinite(camera.position.length()));
});

test('fit distance accommodates both wide desktops and narrow phones',()=>{
  const camera=createCamera();
  for(const [w,h] of [[1440,900],[390,844],[768,1024]]) {
    const distance=fitDistance(camera,1250,1100,w,h);
    const visibleHeight=2*distance*Math.tan(THREE.MathUtils.degToRad(camera.fov/2));
    assert.ok(visibleHeight>=1100-1e-8);
    assert.ok(visibleHeight*w/h>=1250-1e-8);
  }
});
