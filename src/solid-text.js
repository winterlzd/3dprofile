import * as THREE from 'three';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

// ExtrudeGeometry creates a material group for every glyph contour. Reorder
// its unindexed triangles so a whole line needs two draw calls, not hundreds.
export function consolidateMaterialGroups(geometry) {
  if(geometry.index||geometry.groups.length<=2)return geometry;
  const groups=[...geometry.groups].sort((a,b)=>a.materialIndex-b.materialIndex);
  for(const [name,attribute]of Object.entries(geometry.attributes)) {
    const array=new attribute.array.constructor(attribute.array.length);let offset=0;
    for(const group of groups) {
      const start=group.start*attribute.itemSize,end=(group.start+group.count)*attribute.itemSize;
      array.set(attribute.array.subarray(start,end),offset);offset+=end-start;
    }
    geometry.setAttribute(name,new THREE.BufferAttribute(array,attribute.itemSize,attribute.normalized));
  }
  geometry.clearGroups();let offset=0;
  for(const index of [...new Set(groups.map(group=>group.materialIndex))]) {
    const count=groups.filter(group=>group.materialIndex===index).reduce((sum,group)=>sum+group.count,0);
    geometry.addGroup(offset,count,index);offset+=count;
  }
  return geometry;
}

export function textWidth(font, text, size) {
  let width=0;
  for(const char of text) width+=(font.data.glyphs[char] || font.data.glyphs['?']).ha * size / font.data.resolution;
  return width;
}

export function wrapText(font, text, size, maxWidth) {
  const lines=[];
  for(const paragraph of text.replace(/<br\s*\/?>/g,'\n').split('\n')) {
    let line='';
    for(const char of paragraph) {
      if(line && textWidth(font,line+char,size)>maxWidth) {
        const space=line.lastIndexOf(' ');
        if(space>line.length*.35) {
          lines.push(line.slice(0,space));
          line=line.slice(space+1)+char;
        } else {lines.push(line);line=char===' '?'':char;}
      } else line+=char;
    }
    lines.push(line.trimEnd());
  }
  return lines;
}

export class SolidTextFactory {
  constructor(font,materials) {this.font=font;this.materials=materials;this.cache=new Map();}
  create(text,{size=18,depth=2,maxWidth=Infinity,lineHeight=size*1.6,color='ink',align='left'}={}) {
    const group=new THREE.Group();
    const lines=wrapText(this.font,text,size,maxWidth);
    const front=this.materials[color] || this.materials.ink;
    for(let i=0;i<lines.length;i++) {
      if(!lines[i].trim()) continue;
      const key=`${size}/${depth}/${lines[i]}`;
      let geometry=this.cache.get(key);
      if(!geometry) {
        geometry=new TextGeometry(lines[i],{
          font:this.font,size,depth,curveSegments:size>=40?5:2,
          bevelEnabled:size>=40,bevelThickness:.35,bevelSize:.22,bevelSegments:1,
        });
        consolidateMaterialGroups(geometry);
        geometry.computeBoundingBox();
        this.cache.set(key,geometry);
      }
      const mesh=new THREE.Mesh(geometry,[front,this.materials.textSide]);
      mesh.position.set(align==='center'?-textWidth(this.font,lines[i],size)/2:0,-i*lineHeight,0);
      mesh.castShadow=size>=35;
      group.add(mesh);
    }
    group.userData.text=text.replace(/<br\s*\/?>/g,'\n');
    group.userData.lines=lines;
    group.userData.textDepth=depth;
    group.userData.height=(lines.length-1)*lineHeight+size;
    return group;
  }
  dispose() {for(const geometry of this.cache.values())geometry.dispose();this.cache.clear();}
}
