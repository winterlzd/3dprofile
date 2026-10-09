import * as THREE from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { SolidTextFactory } from './solid-text.js';
import { buildContent, projects, GITHUB, YOUTUBE } from './content.js';
import { translations } from './i18n.js';
import { defaultLayout, loadSavedLayout } from './spatial-layout.js';
import { orbitCamera, panCamera, pixelWorldScale, worldAtPointer, fitDistance } from './camera.js';

const LIGHT={ink:0x293b2d,muted:0x73816b,paper:0xf4f3e8,sage:0xd0dfba,sand:0xe3d8bf,charcoal:0x334932,accent:0x83a567,onDark:0xe0edce,textSide:0x59714b,edge:0xa3b295,floor:0xeceee4,grid:0xb9c4a7};
const DARK={ink:0xe4eed6,muted:0xa1b28d,paper:0x2a372a,sage:0x405b34,sand:0x504934,charcoal:0x253d28,accent:0xa8cc83,onDark:0xe4eed6,textSide:0x748960,edge:0x738b59,floor:0x1b291e,grid:0x3d5639};

function roundedShape(width,height,radius=9) {
  const x=-width/2,y=-height/2;
  const shape=new THREE.Shape();
  shape.moveTo(x+radius,y);shape.lineTo(x+width-radius,y);
  shape.quadraticCurveTo(x+width,y,x+width,y+radius);shape.lineTo(x+width,y+height-radius);
  shape.quadraticCurveTo(x+width,y+height,x+width-radius,y+height);shape.lineTo(x+radius,y+height);
  shape.quadraticCurveTo(x,y+height,x,y+height-radius);shape.lineTo(x,y+radius);
  shape.quadraticCurveTo(x,y,x+radius,y);return shape;
}

export class PortfolioScene {
  constructor(onViewChange) {
    this.viewport=document.getElementById('viewport');
    this.scene=new THREE.Scene();
    this.camera=new THREE.PerspectiveCamera(38,1,1,18000);
    this.target=new THREE.Vector3();this.pivot=new THREE.Vector3();
    this.raycaster=new THREE.Raycaster();this.entities=new Map();this.pointers=new Map();
    this.onViewChange=onViewChange;this.activeView='home';this.projectIndex=0;this.aboutIndex=0;this.homeIndex=0;
    this.language='zh';this.copy=translations.zh;this.panels=[];this.materials={};
    this.reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
    this.lastFrame=0;this.disposed=false;this.ready=false;this.dirty=true;
    try {this.saved=loadSavedLayout(localStorage);}catch{this.saved={};}
    this.createAccessibleContent();
    this.createLoading();
    try {
      this.renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});
      this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));
      this.renderer.setClearColor(0x000000,0);
      this.renderer.outputColorSpace=THREE.SRGBColorSpace;
      this.renderer.toneMapping=THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure=1.25;
      this.renderer.shadowMap.enabled=true;
      this.renderer.shadowMap.type=THREE.PCFSoftShadowMap;
      document.getElementById('webgl-layer').appendChild(this.renderer.domElement);
      this.renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();this.useFallback();});
      this.createEnvironment();this.resize();this.bindInteractions();
      this.resizeObserver=new ResizeObserver(()=>this.resize());this.resizeObserver.observe(this.viewport);
      document.addEventListener('visibilitychange',()=>{
        if(!document.hidden&&!this.disposed){this.dirty=true;requestAnimationFrame(t=>this.render(t));}
      });
      fetch('/fonts/noto-cjk-subset.json').then(response=>{
        if(!response.ok)throw new Error('Font unavailable');return response.json();
      }).then(data=>{
        if(this.disposed)return;
        this.font=new FontLoader().parse(data);
        this.text=new SolidTextFactory(this.font,this.materials);
        this.buildEntities();this.ready=true;
        document.getElementById('scene-loading').hidden=true;
        this.viewport.dataset.ready='true';this.focusView('home',true);
        requestAnimationFrame(t=>this.render(t));
      }).catch(error=>{console.warn('3D font unavailable',error);this.useFallback();});
    }catch(error){console.warn('3D rendering unavailable',error);this.useFallback();}
  }

  createAccessibleContent() {
    const container=document.getElementById('content-layer');
    for(const definition of buildContent()) {
      const el=document.createElement('div');
      el.className=`spatial-panel sr-only ${definition.className}`;el.id=definition.id;
      el.innerHTML=definition.html;
      container.appendChild(el);this.panels.push({el,definition});
    }
    // DOM text supports screen readers and a readable WebGL fallback. Visible
    // content is generated below with TextGeometry and solid meshes only.
    const state=document.createElement('div');state.id='scene-state';state.className='sr-only';
    container.appendChild(state);
  }

  createLoading() {
    const el=document.createElement('div');el.id='scene-loading';el.className='scene-loading';
    el.innerHTML='<span class="loading-shape"></span><span data-i18n="loading"></span>';
    document.body.appendChild(el);
  }

  createEnvironment() {
    for(const [key,color]of Object.entries(LIGHT)) {
      this.materials[key]=new THREE.MeshStandardMaterial({color,roughness:key==='paper'?.82:.54,metalness:.015});
    }
    this.edgeMaterial=new THREE.LineBasicMaterial({color:LIGHT.edge,transparent:true,opacity:.5});
    this.scene.add(new THREE.AmbientLight(0xffffff,1.8));
    const key=new THREE.DirectionalLight(0xfff9e9,2.9);key.position.set(-850,1400,2200);
    key.castShadow=true;key.shadow.mapSize.set(1024,1024);
    key.shadow.camera.left=-2200;key.shadow.camera.right=2200;key.shadow.camera.top=1800;key.shadow.camera.bottom=-1800;
    key.shadow.camera.far=6500;key.shadow.bias=-.001;this.scene.add(key);
    const fill=new THREE.DirectionalLight(0xcadcbc,.8);fill.position.set(1500,200,600);this.scene.add(fill);
    this.floor=new THREE.Mesh(new THREE.PlaneGeometry(10000,10000),this.materials.floor);
    this.floor.rotation.x=-Math.PI/2;this.floor.position.y=-1370;this.floor.receiveShadow=true;this.scene.add(this.floor);
    this.grid=new THREE.GridHelper(10000,100,0xaabf91,0xaabf91);this.grid.position.y=-1368;
    this.grid.material.transparent=true;this.grid.material.opacity=.2;this.scene.add(this.grid);
    this.sculpture=new THREE.Group();this.sculpture.position.set(160,25,-140);
    const cube=new THREE.Mesh(new THREE.BoxGeometry(108,108,108),this.materials.sage);cube.rotation.set(.35,.5,.2);
    cube.castShadow=true;this.sculpture.add(cube);
    const outline=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(160,160,160)),this.edgeMaterial);
    outline.rotation.copy(cube.rotation);this.sculpture.add(outline);
    const ring=new THREE.Mesh(new THREE.TorusGeometry(133,1.8,6,100),this.materials.accent);ring.rotation.set(.2,-.4,.35);
    this.sculpture.add(ring);this.scene.add(this.sculpture);this.updateTheme();
  }

  setLanguage(language) {
    this.language=language;this.copy=translations[language];
    if(this.ready){this.buildEntities();this.dirty=true;this.updateInspector();}
  }

  updateTheme() {
    const palette=document.documentElement.dataset.theme==='dark'?DARK:LIGHT;
    for(const [key,material]of Object.entries(this.materials))material.color.set(palette[key]);
    this.edgeMaterial?.color.set(palette.edge);
    if(this.grid){this.grid.material.color.set(palette.grid);}
    this.scene.fog=new THREE.FogExp2(document.documentElement.dataset.theme==='dark'?0x172017:0xf2f1eb,.000105);
    this.dirty=true;
  }

  releaseEntity(group) {
    group.traverse(object=>{
      // Text geometries are cached and shared; factory owns their lifecycle.
      if(object.geometry&&!object.userData.cachedText)object.geometry.dispose();
      if(object.userData.ownMaterial)object.material.dispose();
    });
    this.scene.remove(group);
  }

  buildEntities() {
    const transforms={};
    for(const [id,group]of this.entities) {
      transforms[id]={position:group.position.toArray(),rotation:group.rotation.toArray().slice(0,3)};
      this.releaseEntity(group);
    }
    this.entities.clear();this.currentTransforms=transforms;
    const c=this.copy;
    let g=this.entity('identity',740,350,'paper',c.name);
    this.label(g,c.student,-333,133,17,'muted');
    this.label(g,c.name,-333,28,this.language==='en'?64:80,'ink',9);
    this.label(g,c.nameRoman,-330,-13,12,'muted');
    this.label(g,c.headline,-330,-79,39,'ink',5,{lineHeight:51});
    this.rule(g,640,-148);

    g=this.entity('intro',575,260,'paper',c.navAbout);
    this.label(g,'LEARN. BUILD. REPEAT.',-253,98,11,'muted');
    this.label(g,c.intro,-253,54,18,'ink',2,{maxWidth:500,lineHeight:28});
    this.label(g,c.universityShort,-253,-73,15,'muted');
    this.label(g,c.classYear,-253,-98,12,'muted');

    projects.forEach((project,index)=>this.buildProject(project,index));

    g=this.entity('about',620,490,'paper',c.navAbout);
    this.label(g,c.aboutEyebrow,-273,209,12,'muted');
    this.label(g,c.aboutTitle,-273,144,35,'ink',4,{maxWidth:560,lineHeight:49});
    this.label(g,c.aboutBody,-273,12,18,'ink',2,{maxWidth:546,lineHeight:29});
    this.label(g,'Zhendong.',-273,-210,25,'muted',3);
    this.addPride(g,219,-204,5);

    g=this.entity('practice',565,335,'sand',c.systems);
    this.label(g,'LIFE, WITH A LITTLE AUTOMATION.',-246,131,11,'muted');
    this.label(g,c.aboutBody2,-246,82,18,'ink',2,{maxWidth:490,lineHeight:29});
    this.label(g,'MINECRAFT / LINUX / AI AGENTS',-246,-140,12,'muted');

    const skills=[['programming','programmingDesc','C / C++ / PYTHON'],['hardware','hardwareDesc','STM32 / RP2350'],['modeling','modelingDesc','SOLIDWORKS / FUSION / FREECAD'],['systems','systemsDesc','LINUX / AI AGENTS']];
    skills.forEach(([title,description,tags],index)=>{
      const group=this.entity(`skill-${index}`,465,335,index%2?'sage':'paper',c[title]);
      this.label(group,`TOOLBOX / 0${index+1}`,-198,129,12,'muted');
      this.label(group,c[title],-198,73,this.language==='ja'?23:29,'ink',3,{maxWidth:400});
      this.label(group,c[description],-198,12,17,'ink',2,{maxWidth:395,lineHeight:27});
      this.label(group,tags,-198,-139,10,'muted');
    });

    [1,2,3].forEach((index)=>{
      const group=this.entity(`journey-${index-1}`,465,305,index===3?'sage':'paper',c[`journey${index}Time`]);
      this.label(group,c[`journey${index}Time`],-197,113,12,'muted');
      this.label(group,c[`journey${index}Title`],-197,61,25,'ink',3,{maxWidth:394,lineHeight:34});
      this.label(group,c[`journey${index}Desc`],-197,-4,17,'ink',2,{maxWidth:394,lineHeight:26});
    });

    this.buildSocial('github','GitHub','@winterlzd',GITHUB);
    this.buildSocial('youtube','YouTube','@刘振冬-x7w',YOUTUBE);
    g=this.entity('footer',650,93,'sage',c.pride);
    this.label(g,c.pride,-285,2,19,'ink',3);
    this.addPride(g,254,-3,8);
    this.viewport.dataset.entityCount=String(this.entities.size);
    this.viewport.dataset.solidText='TextGeometry';
    this.syncState();
    if(this.selectedId){this.selection?.removeFromParent();this.selection?.dispose();this.createSelection();}
    this.scene.updateMatrixWorld(true);
  }

  entity(id,width,height,color,label) {
    const group=new THREE.Group();group.userData={id,width,height,label,color};
    const definition=this.currentTransforms[id] || this.saved[id] || defaultLayout[id];
    group.position.fromArray(definition.position);group.rotation.set(...definition.rotation);
    const geometry=new THREE.ExtrudeGeometry(roundedShape(width,height),{depth:24,bevelEnabled:true,bevelSegments:2,bevelSize:3,bevelThickness:2,curveSegments:4,steps:1});
    geometry.translate(0,0,-24);
    const body=new THREE.Mesh(geometry,this.materials[color]);body.castShadow=true;body.receiveShadow=true;group.add(body);
    const border=new THREE.LineSegments(new THREE.EdgesGeometry(geometry,35),this.edgeMaterial);group.add(border);
    this.scene.add(group);this.entities.set(id,group);return group;
  }

  label(group,text,x,y,size=18,color='ink',depth=2,options={}) {
    const textGroup=this.text.create(text,{size,color,depth,...options});
    textGroup.position.set(x,y,3);
    textGroup.traverse(object=>{if(object.isMesh)object.userData.cachedText=true;});
    group.add(textGroup);return textGroup;
  }

  rule(group,width,y) {
    const mesh=new THREE.Mesh(new THREE.BoxGeometry(width,.8,1),this.materials.edge);mesh.position.set(0,y,2);group.add(mesh);
  }

  buildProject(project,index) {
    const c=this.copy;const group=this.entity(`project-${index}`,450,482,project.color,project.name);
    const labelColor=project.color==='charcoal'?'onDark':'ink';
    const mutedColor=project.color==='charcoal'?'onDark':'muted';
    this.label(group,`0${index+1} / ${c[project.category]}`,-192,208,11,mutedColor);
    this.projectSculpture(group,project.visual);
    this.rule(group,382,15);
    this.label(group,project.name,-192,-31,30,labelColor,5);
    this.label(group,c[project.description],-192,-74,17,labelColor,2,{maxWidth:380,lineHeight:25});
    this.label(group,project.tags.join(' / '),-192,-216,10,mutedColor);
    const link=this.label(group,c.source,101,-215,12,labelColor,2);
    link.userData.action={url:`${GITHUB}/${project.slug}`};
    const hit=new THREE.Mesh(new THREE.BoxGeometry(106,34,6),this.materials[project.color]);
    hit.position.set(145,-211,1);hit.userData.action=link.userData.action;group.add(hit);
    // Put the source text ahead of its solid, clickable link base.
    link.position.z=8;
  }

  projectSculpture(group,type) {
    const art=new THREE.Group();art.position.set(0,106,25);group.add(art);
    if(type==='matrix') {
      const heart=['01100110','11111111','11111111','01111110','00111100','00011000'];
      heart.forEach((row,y)=>[...row].forEach((value,x)=>{
        if(value==='0')return;
        const dot=new THREE.Mesh(new THREE.BoxGeometry(13,13,8),this.materials.onDark);
        dot.position.set((x-3.5)*17,(2.5-y)*17,3);art.add(dot);
      }));art.rotation.z=.05;
    } else if(type==='cad') {
      const shape=roundedShape(122,88,4),hole=new THREE.Path();hole.absarc(0,0,22,0,Math.PI*2,true);shape.holes.push(hole);
      const geometry=new THREE.ExtrudeGeometry(shape,{depth:45,bevelEnabled:false,curveSegments:24});geometry.center();
      const solid=new THREE.Mesh(geometry,this.materials.accent);solid.castShadow=true;art.add(solid);
      art.add(new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(157,115,74)),this.edgeMaterial));
      art.rotation.set(.55,.38,-.13);
    } else if(type==='car') {
      const chassis=new THREE.Mesh(new THREE.BoxGeometry(112,93,18),this.materials.sage);art.add(chassis);
      [-1,1].forEach(side=>{
        const tire=new THREE.Mesh(new THREE.CylinderGeometry(29,29,20,18),this.materials.charcoal);
        tire.rotation.z=Math.PI/2;tire.position.set(side*69,0,0);art.add(tire);
      });
      const chip=new THREE.Mesh(new THREE.BoxGeometry(48,40,8),this.materials.charcoal);chip.position.z=14;art.add(chip);
      art.rotation.set(.35,.2,-.09);
    } else if(type==='chip') {
      const chip=new THREE.Mesh(new THREE.BoxGeometry(100,100,15),this.materials.charcoal);art.add(chip);
      for(let i=0;i<8;i++)for(const side of [-1,1]) {
        const pin=new THREE.Mesh(new THREE.BoxGeometry(15,5,4),this.materials.accent);pin.position.set(side*59,(i-3.5)*11,0);art.add(pin);
        const pin2=new THREE.Mesh(new THREE.BoxGeometry(5,15,4),this.materials.accent);pin2.position.set((i-3.5)*11,side*59,0);art.add(pin2);
      }
      this.label(art,'STM32',-31,4,17,'onDark',2);art.rotation.z=.12;
    } else if(type==='ros') {
      const box=new THREE.Mesh(new THREE.BoxGeometry(222,116,10),this.materials.charcoal);art.add(box);
      const label=this.label(art,'$ docker compose up',-101,29,12,'onDark',1.7);label.position.z=7;
      const label2=this.label(art,'$ ros2 run turtlesim',-101,-8,12,'onDark',1.7);label2.position.z=7;
      art.rotation.set(.03,-.05,.035);
    } else {
      const box=new THREE.Mesh(new THREE.BoxGeometry(202,89,15),this.materials.sage);art.add(box);
      const label=this.label(art,'Hello, world.',-85,-4,21,'ink',2.5);label.position.z=10;
      art.rotation.set(.05,.1,-.08);
    }
  }

  buildSocial(id,title,handle,url) {
    const group=this.entity(id,id==='github'?247:276,109,'sage',title);
    group.userData.action={url};
    this.label(group,title,-group.userData.width/2+25,6,29,'ink',5);
    this.label(group,handle,-group.userData.width/2+26,-25,12,'muted',2);
    const arrow=this.label(group,'↗',group.userData.width/2-39,2,26,'ink',4);
    arrow.userData.action={url};
    if(id==='github')this.addPride(group,group.userData.width/2-41,-30,4);
  }

  addPride(group,x,y,size) {
    [0xc78383,0xd6a66e,0xd3c67b,0x8aa58b,0x879fbc,0xa291b2].forEach((color,index)=>{
      const material=new THREE.MeshStandardMaterial({color,roughness:.75});
      const block=new THREE.Mesh(new THREE.BoxGeometry(size,size*.4,2.2),material);
      block.userData.ownMaterial=true;block.position.set(x+(index-2.5)*size,y,5);group.add(block);
    });
  }

  resize() {
    if(this.flat||!this.renderer)return;
    const width=this.viewport.clientWidth,height=this.viewport.clientHeight;
    this.mobile=width<=600;document.body.classList.toggle('mobile-scene',this.mobile);
    this.camera.aspect=width/height;this.camera.updateProjectionMatrix();this.renderer.setSize(width,height);
    if(this.ready)this.focusView(this.activeView,true);
    this.dirty=true;
  }

  focusView(view,immediate=false) {
    this.activeView=view;this.onViewChange?.(view);
    if(this.flat){document.getElementById({home:'hero',work:'work-heading',about:'about',connect:'connect'}[view])?.scrollIntoView({behavior:'smooth'});return;}
    if(!this.ready)return;
    if(view==='work')return this.focusEntity(`project-${this.projectIndex}`,immediate);
    if(view==='about')return this.focusEntity(['about','practice','skill-0','skill-1','skill-2','skill-3','journey-0','journey-1','journey-2'][this.aboutIndex],immediate);
    if(view==='connect')return this.focusEntity('github',immediate);
    const box=new THREE.Box3();
    const ids=view==='overview'?[...this.entities.keys()]:['identity','intro','project-0','github','youtube'];
    this.scene.updateMatrixWorld(true);
    ids.forEach(id=>box.expandByObject(this.entities.get(id)));
    const center=box.getCenter(new THREE.Vector3()),size=box.getSize(new THREE.Vector3());
    if(this.mobile&&view==='home')return this.focusEntity(['identity','intro','github','youtube'][this.homeIndex],immediate);
    this.moveCamera(center,size.x*1.12,size.y*1.13,new THREE.Vector3(.08,.055,1),immediate);
  }

  focusEntity(id,immediate=false) {
    const group=this.entities.get(id);if(!group)return;
    const width=this.viewport.clientWidth,height=this.viewport.clientHeight;
    const normal=new THREE.Vector3(.07,.045,1).applyQuaternion(group.quaternion).normalize();
    const w=group.userData.width*(this.mobile?1.12:1.5),h=group.userData.height*(this.mobile?1.16:1.32);
    this.moveCamera(group.position.clone(),w,h,normal,immediate);
    this.focusedId=id;this.viewport.dataset.focused=id;
    const page=this.activeView==='work'?[this.projectIndex,6]:this.activeView==='about'?[this.aboutIndex,9]:[this.homeIndex,4];
    document.getElementById('object-page')?.replaceChildren(document.createTextNode(`${String(page[0]+1).padStart(2,'0')} / ${String(page[1]).padStart(2,'0')}`));
  }

  moveCamera(center,worldWidth,worldHeight,direction,immediate) {
    const width=this.viewport.clientWidth,height=this.viewport.clientHeight;
    const usableWidth=Math.max(width-(this.mobile?24:130),width*.6);
    const usableHeight=Math.max(height-(this.mobile?240:235),height*.5);
    const distance=fitDistance(this.camera,worldWidth*width/usableWidth,worldHeight*height/usableHeight,width,height);
    this.homeDistance=distance;
    const position=center.clone().addScaledVector(direction.normalize(),distance);
    const look=this.camera.clone();look.position.copy(position);look.lookAt(center);
    // The content sits between the header and bottom HUD, rather than behind it.
    const shift=(this.mobile?30:27)*2*distance*Math.tan(THREE.MathUtils.degToRad(this.camera.fov/2))/height;
    const vertical=new THREE.Vector3(0,1,0).applyQuaternion(look.quaternion).multiplyScalar(-shift);
    position.add(vertical);const target=center.clone().add(vertical);
    if(immediate||this.reducedMotion.matches) {
      this.camera.position.copy(position);this.camera.quaternion.copy(look.quaternion);this.target.copy(target);this.transition=null;
    } else {
      this.transition={start:performance.now(),duration:750,from:this.camera.position.clone(),to:position,fromQ:this.camera.quaternion.clone(),toQ:look.quaternion.clone(),fromTarget:this.target.clone(),toTarget:target};
    }
    this.camera.updateMatrixWorld();this.dirty=true;this.updateZoom();
  }

  pick(x,y) {
    const bounds=this.viewport.getBoundingClientRect();
    this.raycaster.setFromCamera(new THREE.Vector2((x-bounds.left)/bounds.width*2-1,-(y-bounds.top)/bounds.height*2+1),this.camera);
    const hit=this.raycaster.intersectObjects([...this.entities.values()],true)[0];
    if(!hit)return null;
    let ancestor=hit.object,action=null;
    while(ancestor&&!ancestor.userData.id){action ||= ancestor.userData.action;ancestor=ancestor.parent;}
    if(!ancestor)return null;
    return {entity:ancestor,point:hit.point,action:action||ancestor.userData.action};
  }

  bindInteractions() {
    this.viewport.addEventListener('pointerdown',e=>this.pointerDown(e));
    this.viewport.addEventListener('pointermove',e=>this.pointerMove(e));
    this.viewport.addEventListener('pointerup',e=>this.pointerUp(e));
    this.viewport.addEventListener('pointercancel',e=>this.pointerUp(e,true));
    this.viewport.addEventListener('lostpointercapture',e=>this.pointerUp(e,true));
    this.viewport.addEventListener('auxclick',e=>{if(e.button===1)e.preventDefault();});
    this.viewport.addEventListener('contextmenu',e=>e.preventDefault());
    this.viewport.addEventListener('wheel',e=>{
      if(this.flat)return;e.preventDefault();this.zoom(Math.exp(THREE.MathUtils.clamp(e.deltaY,-100,100)*.002),e.clientX,e.clientY);
    },{passive:false});
    this.viewport.addEventListener('dblclick',e=>{
      if(this.flat)return;const hit=this.pick(e.clientX,e.clientY);if(hit&&!hit.action)this.focusEntity(hit.entity.userData.id);
    });
    document.addEventListener('keydown',e=>this.keyDown(e));
    document.addEventListener('focusin',e=>{
      if(this.flat||!this.ready)return;
      const panel=this.panels.find(p=>p.el.contains(e.target));if(!panel)return;
      const id={hero:'identity',skills:'skill-0',journey:'journey-0',connect:'github'}[panel.el.id] || panel.el.id;
      if(this.entities.has(id))this.focusEntity(id);
    });
  }

  pointerDown(e) {
    if(this.flat||!this.ready||e.button===2)return;
    e.preventDefault();this.transition=null;this.camera.updateMatrixWorld();this.scene.updateMatrixWorld(true);
    this.pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});this.viewport.setPointerCapture(e.pointerId);
    if(this.pointers.size===2) {
      const [a,b]=[...this.pointers.values()];this.touchCenter={x:(a.x+b.x)/2,y:(a.y+b.y)/2};
      this.touchDistance=Math.hypot(a.x-b.x,a.y-b.y);const hit=this.pick(this.touchCenter.x,this.touchCenter.y);
      this.pivot.copy(hit?.point || worldAtPointer(this.camera,this.touchCenter.x,this.touchCenter.y,this.viewport.getBoundingClientRect(),this.target.z) || this.target);
      this.mode='orbit';this.dragged=false;this.showPivot();return;
    }
    this.hit=this.pick(e.clientX,e.clientY);this.dragged=false;this.dragDistance=0;
    if(e.button===1||e.shiftKey) {
      this.mode='orbit';this.pivot.copy(this.hit?.point || worldAtPointer(this.camera,e.clientX,e.clientY,this.viewport.getBoundingClientRect(),this.target.z)||this.target);this.showPivot();
    } else if(this.hit) {
      this.mode=e.altKey?'depth':'object';this.select(this.hit.entity.userData.id);
      const normal=new THREE.Vector3(0,0,1).applyQuaternion(this.camera.quaternion);
      this.dragPlane=new THREE.Plane().setFromNormalAndCoplanarPoint(normal,this.hit.point);
      this.dragPoint=this.hit.point.clone();
    }else{this.mode='pan';this.select(null);}
    this.viewport.classList.add(this.mode==='orbit'?'orbiting':'dragging');
  }

  pointerMove(e) {
    if(this.flat||!this.ready)return;
    const prev=this.pointers.get(e.pointerId);
    if(!prev) {
      const hit=this.pick(e.clientX,e.clientY);
      this.viewport.style.cursor=hit?(hit.action?'pointer':'grab'):'grab';return;
    }
    const dx=e.clientX-prev.x,dy=e.clientY-prev.y;
    this.pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});this.dragDistance+=Math.hypot(dx,dy);
    if(this.dragDistance>4)this.dragged=true;
    if(this.pointers.size===2) {
      const [a,b]=[...this.pointers.values()];const center={x:(a.x+b.x)/2,y:(a.y+b.y)/2};
      const distance=Math.hypot(a.x-b.x,a.y-b.y);
      this.orbit(center.x-this.touchCenter.x,center.y-this.touchCenter.y);
      if(distance>5&&this.touchDistance>5)this.zoom(this.touchDistance/distance,center.x,center.y);
      this.touchCenter=center;this.touchDistance=distance;
    }else if(this.mode==='orbit')this.orbit(dx,dy);
    else if(this.mode==='pan')this.target.add(panCamera(this.camera,dx,dy,this.scale()));
    else if(this.mode==='depth'&&this.hit) {
      const normal=new THREE.Vector3(0,0,1).applyQuaternion(this.camera.quaternion);
      this.hit.entity.position.addScaledVector(normal,-dy*this.scale());this.updateInspector();
    }else if(this.mode==='object'&&this.hit&&this.dragged) {
      const bounds=this.viewport.getBoundingClientRect();
      this.raycaster.setFromCamera(new THREE.Vector2((e.clientX-bounds.left)/bounds.width*2-1,-(e.clientY-bounds.top)/bounds.height*2+1),this.camera);
      const point=this.raycaster.ray.intersectPlane(this.dragPlane,new THREE.Vector3());
      if(point){this.hit.entity.position.add(point.clone().sub(this.dragPoint));this.dragPoint.copy(point);this.updateInspector();}
    }
    this.dirty=true;this.showPivot();this.syncState();
  }

  pointerUp(e,cancelled=false) {
    if(!this.pointers.has(e.pointerId))return;
    this.pointers.delete(e.pointerId);
    if(!this.pointers.size) {
      if(!cancelled&&!this.dragged&&this.hit?.action&&this.mode==='object') {
        const anchor=document.createElement('a');anchor.href=this.hit.action.url;anchor.target='_blank';anchor.rel='noopener noreferrer';anchor.click();
      }
      if(this.dragged&&this.hit&&(this.mode==='object'||this.mode==='depth'))this.saveLayout();
      this.mode=null;this.hit=null;this.viewport.classList.remove('dragging','orbiting');
      document.getElementById('pivot-marker').style.display='none';
    }else{this.mode='pan';this.hit=null;this.dragged=true;}
    this.dirty=true;
  }

  orbit(dx,dy) {
    const q=this.camera.quaternion.clone();
    if(orbitCamera(this.camera,this.pivot,dx,dy)) {
      const rotation=this.camera.quaternion.clone().multiply(q.invert());
      this.target.sub(this.pivot).applyQuaternion(rotation).add(this.pivot);
    }
    this.dirty=true;
  }

  showPivot() {
    if(this.mode!=='orbit')return;
    const ndc=this.pivot.clone().project(this.camera),marker=document.getElementById('pivot-marker');
    marker.style.display='block';marker.style.left=`${(ndc.x+1)/2*this.viewport.clientWidth}px`;marker.style.top=`${(1-ndc.y)/2*this.viewport.clientHeight}px`;
  }

  scale(){return pixelWorldScale(this.camera,this.target,this.viewport.clientHeight);}

  zoom(factor,x=this.viewport.clientWidth/2,y=this.viewport.clientHeight/2) {
    if(this.flat||!this.ready)return;this.transition=null;
    const hit=this.pick(x,y),point=hit?.point || worldAtPointer(this.camera,x,y,this.viewport.getBoundingClientRect(),this.target.z)||this.target.clone();
    const distance=this.camera.position.distanceTo(this.target),next=THREE.MathUtils.clamp(distance*factor,280,9500),f=next/distance;
    this.camera.position.sub(point).multiplyScalar(f).add(point);this.target.sub(point).multiplyScalar(f).add(point);
    this.camera.updateMatrixWorld();this.dirty=true;this.updateZoom();
  }

  keyDown(e) {
    if(this.flat||!this.ready||e.target.matches('input,select,textarea')||!document.getElementById('guide').hidden)return;
    const moves={ArrowLeft:[-38,0],ArrowRight:[38,0],ArrowUp:[0,-38],ArrowDown:[0,38]};
    if(e.key in moves) {
      e.preventDefault();this.transition=null;const [dx,dy]=moves[e.key];
      if(e.altKey&&this.selectedId) {
        const offset=new THREE.Vector3(dx*this.scale(),-dy*this.scale(),0).applyQuaternion(this.camera.quaternion);
        this.entities.get(this.selectedId).position.add(offset);this.saveLayout();this.updateInspector();
      }else this.target.add(panCamera(this.camera,dx,dy,this.scale()));
      this.dirty=true;
    }else if(e.key==='+'||e.key==='='){e.preventDefault();this.zoom(.85);}
    else if(e.key==='-'){e.preventDefault();this.zoom(1.18);}
    else if(e.key==='0'){e.preventDefault();this.focusView('home');}
    else if(e.key==='Escape')this.select(null);
  }

  select(id) {
    this.selectedId=id;this.selection?.removeFromParent();this.selection?.geometry.dispose();this.selection?.material.dispose();this.selection=null;
    if(id)this.createSelection();this.updateInspector();this.dirty=true;
  }

  createSelection() {
    const object=this.entities.get(this.selectedId);if(!object)return;
    this.selection=new THREE.BoxHelper(object,0x8aaa65);this.selection.material.transparent=true;this.selection.material.opacity=.8;
    this.scene.add(this.selection);
  }

  updateInspector() {
    const inspector=document.getElementById('object-inspector');if(!inspector)return;
    const entity=this.entities.get(this.selectedId);inspector.hidden=!entity;if(!entity)return;
    document.getElementById('selected-object-name').textContent=entity.userData.label;
    document.getElementById('object-position').textContent=entity.position.toArray().map(v=>Math.round(v)).join(' / ');
    document.getElementById('object-depth').value=String(Math.round(entity.position.z));
    this.selection?.update();this.syncState();
  }

  adjustDepth(value) {
    const entity=this.entities.get(this.selectedId);if(!entity)return;
    entity.position.z=Number(value);this.updateInspector();this.saveLayout();this.dirty=true;
  }

  rotateSelected(direction) {
    const entity=this.entities.get(this.selectedId);if(!entity)return;
    entity.rotation.y+=direction*.12;this.updateInspector();this.saveLayout();this.dirty=true;
  }

  resetSelected() {
    const entity=this.entities.get(this.selectedId);if(!entity)return;
    const original=defaultLayout[this.selectedId];entity.position.fromArray(original.position);entity.rotation.set(...original.rotation);
    this.updateInspector();this.saveLayout();this.dirty=true;
  }

  resetLayout() {
    for(const [id,entity]of this.entities){entity.position.fromArray(defaultLayout[id].position);entity.rotation.set(...defaultLayout[id].rotation);}
    this.saveLayout();this.select(null);this.projectIndex=0;this.aboutIndex=0;this.homeIndex=0;this.focusView('home');this.dirty=true;
  }

  saveLayout() {
    const layout={};for(const [id,entity]of this.entities)layout[id]={position:entity.position.toArray(),rotation:entity.rotation.toArray().slice(0,3)};
    try{localStorage.setItem('zd-spatial-layout-v2',JSON.stringify(layout));}catch{/* Storage is optional. */}
    this.saved=layout;this.syncState();
  }

  syncState() {
    const el=document.getElementById('scene-state');if(!el)return;
    el.replaceChildren(...[...this.entities].map(([id,entity])=>{
      const item=document.createElement('span');item.dataset.entity=id;item.dataset.position=JSON.stringify(entity.position.toArray());
      item.dataset.rotation=JSON.stringify(entity.rotation.toArray().slice(0,3));item.dataset.action=entity.userData.action?.url||'';
      item.textContent=entity.userData.label;return item;
    }));
  }

  nextProject(direction) {
    if(this.activeView==='about'){this.aboutIndex=(this.aboutIndex+direction+9)%9;this.focusView('about');}
    else if(this.activeView==='home'&&this.mobile){this.homeIndex=(this.homeIndex+direction+4)%4;this.focusView('home');}
    else{this.projectIndex=(this.projectIndex+direction+6)%6;this.focusView('work');}
  }

  updateZoom() {
    document.getElementById('zoom-level').textContent=`${Math.round(this.homeDistance/this.camera.position.distanceTo(this.target)*100)}%`;
  }

  render(time) {
    if(this.disposed||this.flat||document.hidden)return;
    if(time-this.lastFrame>32||this.transition||this.pointers.size) {
      this.lastFrame=time;
      if(this.transition) {
        const t=THREE.MathUtils.clamp((time-this.transition.start)/this.transition.duration,0,1),ease=1-Math.pow(1-t,3);
        this.camera.position.lerpVectors(this.transition.from,this.transition.to,ease);this.camera.quaternion.slerpQuaternions(this.transition.fromQ,this.transition.toQ,ease);
        this.target.lerpVectors(this.transition.fromTarget,this.transition.toTarget,ease);this.camera.updateMatrixWorld();this.dirty=true;this.updateZoom();
        if(t===1)this.transition=null;
      }
      if(this.dirty) {
        this.selection?.update();this.renderer.render(this.scene,this.camera);this.dirty=false;
        this.viewport.dataset.camera=JSON.stringify(this.camera.position.toArray());
        this.viewport.dataset.drawCalls=String(this.renderer.info.render.calls);
        this.viewport.dataset.triangles=String(this.renderer.info.render.triangles);
      }
    }
    requestAnimationFrame(t=>this.render(t));
  }

  useFallback() {
    this.flat=true;document.body.classList.add('flat');document.getElementById('fallback').hidden=false;
    document.getElementById('scene-loading').hidden=true;document.getElementById('webgl-layer').replaceChildren();
    this.panels.forEach(p=>p.el.classList.remove('sr-only'));this.renderer?.dispose();
  }

  dispose() {
    this.disposed=true;this.resizeObserver?.disconnect();
    for(const entity of this.entities.values())this.releaseEntity(entity);
    this.text?.dispose();Object.values(this.materials).forEach(material=>material.dispose());
    this.renderer?.dispose();
  }
}
