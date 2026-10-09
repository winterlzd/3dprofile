import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { wrapText, textWidth, consolidateMaterialGroups } from '../src/solid-text.js';
import { defaultLayout, validSavedTransform, loadSavedLayout } from '../src/spatial-layout.js';
import { translations } from '../src/i18n.js';

const font=new FontLoader().parse(JSON.parse(fs.readFileSync(new URL('../public/fonts/noto-cjk-subset.json',import.meta.url))));

test('font subset covers every visible character in all three languages',()=>{
  for(const copy of Object.values(translations))for(const value of Object.values(copy)){
    for(const char of value.replace(/<br>/g,'').replace(/\n/g,''))assert.ok(char in font.data.glyphs,`Missing glyph: ${char}`);
  }
});

test('Latin and CJK glyph contours keep holes inside their outer contours',()=>{
  for(const char of ['A','B','e','o','刘','劉','振','冬','語']){
    for(const shape of font.generateShapes(char,80)){
      const outer=Math.abs(THREE.ShapeUtils.area(shape.getPoints(6)));
      for(const hole of shape.holes)assert.ok(Math.abs(THREE.ShapeUtils.area(hole.getPoints(6)))<outer,`${char} has an inverted outline`);
    }
  }
});

test('visible text is a solid geometry with front, back, and side faces',()=>{
  for(const text of ['刘振冬','Zhendong Liu','劉 振冬']){
    const geometry=new TextGeometry(text,{font,size:35,depth:7,bevelEnabled:false,curveSegments:3});
    geometry.computeBoundingBox();
    assert.equal(geometry.boundingBox.max.z-geometry.boundingBox.min.z,7);
    assert.ok(geometry.groups.some(group=>group.materialIndex===0));
    assert.ok(geometry.groups.some(group=>group.materialIndex===1));
    assert.ok(geometry.attributes.position.count>100);
    geometry.dispose();
  }
});

test('3D paragraphs wrap within their solid board in every language',()=>{
  for(const copy of Object.values(translations))for(const key of ['openSolidDesc','aboutBody','programmingDesc']){
    const lines=wrapText(font,copy[key],17,380);
    assert.ok(lines.length>1);
    assert.ok(lines.every(line=>textWidth(font,line,17)<=380.001));
    assert.equal(lines.join('').replace(/\s/g,''),copy[key].replace(/\s/g,''));
  }
});

test('batching glyph contours preserves every triangle and limits draw groups',()=>{
  const geometry=new TextGeometry('中文日本語，三维文字具有厚度。',{font,size:18,depth:2,bevelEnabled:false,curveSegments:2});
  const count=geometry.attributes.position.count;
  const originalGroups=geometry.groups.length;
  geometry.computeBoundingBox();const bounds=geometry.boundingBox.clone();
  consolidateMaterialGroups(geometry);geometry.computeBoundingBox();
  assert.equal(geometry.attributes.position.count,count);
  assert.ok(originalGroups>20);
  assert.equal(geometry.groups.length,2);
  assert.equal(geometry.groups.reduce((sum,group)=>sum+group.count,0),count);
  assert.deepEqual(geometry.boundingBox,bounds);
  geometry.dispose();
});

test('entities occupy multiple depths, heights, and orientations',()=>{
  const values=Object.values(defaultLayout);
  assert.ok(new Set(values.map(v=>v.position[2])).size>15);
  assert.ok(Math.max(...values.map(v=>v.position[2]))-Math.min(...values.map(v=>v.position[2]))>1800);
  assert.ok(values.some(v=>v.rotation[1]>.4)&&values.some(v=>v.rotation[1]<-.3));
  assert.ok(values.every(validSavedTransform));
});

test('saved object positions survive readback and malformed values are ignored',()=>{
  const transformed={position:[230,-145,520],rotation:[.1,.3,-.2]};
  const mock={getItem:()=>JSON.stringify({identity:transformed,intro:{position:[null,0,0],rotation:[0,0,0]},unknown:transformed})};
  assert.deepEqual(loadSavedLayout(mock),{identity:transformed});
  assert.deepEqual(loadSavedLayout({getItem:()=>'{invalid'}),{});
  assert.deepEqual(loadSavedLayout({getItem:()=>{throw new Error('private mode');}}),{});
});
