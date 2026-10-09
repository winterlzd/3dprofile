import * as THREE from 'three';

export function pixelWorldScale(camera, target, height) {
  return 2 * camera.position.distanceTo(target) * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) / height;
}

// Rotate camera position and orientation by the same world-space quaternion.
// This preserves the pressed pivot's screen position, even when it is off center.
export function orbitCamera(camera, pivot, deltaX, deltaY, sensitivity = 0.004) {
  const cameraRight = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
  const cameraUp = new THREE.Vector3(0, 1, 0).applyQuaternion(camera.quaternion);
  const yaw = new THREE.Quaternion().setFromAxisAngle(cameraUp, -deltaX * sensitivity);
  const pitch = new THREE.Quaternion().setFromAxisAngle(cameraRight, -deltaY * sensitivity);
  const rotation = yaw.multiply(pitch);
  const next = camera.quaternion.clone().premultiply(rotation);
  const normal = new THREE.Vector3(0, 0, 1).applyQuaternion(next);
  // Keep the front of the text panels readable and prevent turning underneath.
  if (normal.z < 0.28) return false;
  camera.position.sub(pivot).applyQuaternion(rotation).add(pivot);
  camera.quaternion.copy(next);
  camera.updateMatrixWorld();
  return true;
}

export function panCamera(camera, deltaX, deltaY, scale) {
  const offset = new THREE.Vector3(-deltaX * scale, deltaY * scale, 0).applyQuaternion(camera.quaternion);
  camera.position.add(offset);
  camera.updateMatrixWorld();
  return offset;
}

export function worldAtPointer(camera, clientX, clientY, bounds, planeZ = 0) {
  const ndc = new THREE.Vector2((clientX - bounds.left) / bounds.width * 2 - 1, -(clientY - bounds.top) / bounds.height * 2 + 1);
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(ndc, camera);
  return raycaster.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 0, 1), -planeZ), new THREE.Vector3());
}

export function fitDistance(camera, worldWidth, worldHeight, viewportWidth, viewportHeight) {
  const tan = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
  return Math.max(worldHeight / (2 * tan), worldWidth / (2 * tan * viewportWidth / viewportHeight));
}
