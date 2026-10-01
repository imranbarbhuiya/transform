import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import './style.css';

const stage = document.querySelector('#stage');
const panel = document.querySelector('.panel');
const form = document.querySelector('#login-form');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setClearColor(0x000000);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.35;
document.querySelector('#scene').append(renderer.domElement);
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x000000, .035);
const environmentGenerator = new THREE.PMREMGenerator(renderer);
const environmentRoom = new RoomEnvironment();
scene.environment = environmentGenerator.fromScene(environmentRoom, .04).texture;
scene.environmentIntensity = .65;
environmentRoom.dispose();
environmentGenerator.dispose();
const camera = new THREE.PerspectiveCamera(32, 1, .1, 100);
camera.position.set(0, .2, 12.8);
camera.lookAt(0, 0, 0);
scene.add(new THREE.HemisphereLight(0xc7d5ff, 0x15111e, 2.2));
const key = new THREE.DirectionalLight(0xf1f0ff, 4);
key.position.set(-3, 7, 6);key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
key.shadow.camera.left = -6;key.shadow.camera.right = 6;
key.shadow.camera.top = 6;key.shadow.camera.bottom = -6;
key.shadow.bias = -.001;
scene.add(key);
const rim = new THREE.DirectionalLight(0x6455ff, 3);
rim.position.set(4, 2, -3);scene.add(rim);
const fill = new THREE.DirectionalLight(0xffffff, 1.3);
fill.position.set(3, 1, 6);scene.add(fill);
const purpleLight = new THREE.PointLight(0xb743ff, 0, 6);
purpleLight.position.set(0, 0, 2);scene.add(purpleLight);
const ground = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), new THREE.ShadowMaterial({ opacity: .5 }));
ground.rotation.x = -Math.PI / 2;ground.position.y = -2.85;ground.receiveShadow = true;scene.add(ground);
const grid = new THREE.GridHelper(70, 100, 0x28282d, 0x18181d);
grid.position.y = -2.86;grid.material.transparent = true;grid.material.opacity = 0;scene.add(grid);
const materials = {
 blue: new THREE.MeshStandardMaterial({ color: 0x1023bc, metalness: .68, roughness: .3 }),
 blueDark: new THREE.MeshStandardMaterial({ color: 0x071151, metalness: .72, roughness: .38 }),
 silver: new THREE.MeshStandardMaterial({ color: 0xa7b2c7, metalness: .85, roughness: .28 }),
 dark: new THREE.MeshStandardMaterial({ color: 0x171923, metalness: .6, roughness: .43 }),
 black: new THREE.MeshStandardMaterial({ color: 0x07080d, metalness: .3, roughness: .65 }),
 tire: new THREE.MeshStandardMaterial({ color: 0x14151b, metalness: .05, roughness: .87 }),
 purple: new THREE.MeshStandardMaterial({ color: 0xa340fd, emissive: 0x8f1ee8, emissiveIntensity: 2 }),
 red: new THREE.MeshStandardMaterial({ color: 0xe92343, emissive: 0xff0024, emissiveIntensity: 1.5 }),
 glass: new THREE.MeshStandardMaterial({ color: 0x505c78, metalness: .75, roughness: .17 }),
};
function box(parent, w, h, d, x, y, z, material, bevel = 0) {
 let geometry;
 if (bevel) {
  const shape = new THREE.Shape();
  shape.moveTo(-w/2+bevel,-h/2);shape.lineTo(w/2-bevel,-h/2);shape.lineTo(w/2,-h/2+bevel);shape.lineTo(w/2,h/2-bevel);shape.lineTo(w/2-bevel,h/2);shape.lineTo(-w/2+bevel,h/2);shape.lineTo(-w/2,h/2-bevel);shape.lineTo(-w/2,-h/2+bevel);shape.closePath();
  geometry = new THREE.ExtrudeGeometry(shape,{ depth:d, bevelEnabled:true, bevelSize:.015, bevelThickness:.015, bevelSegments:1, steps:1 });
  geometry.translate(0,0,-d/2);
 } else geometry = new THREE.BoxGeometry(w,h,d);
 const mesh = new THREE.Mesh(geometry,material);mesh.position.set(x,y,z);mesh.castShadow = true;mesh.receiveShadow = true;parent.add(mesh);return mesh;
}
function cylinder(parent, radius, depth, x, y, z, material, sideways = false) {
 const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius,radius,depth,32), material);
 if(sideways)mesh.rotation.z = Math.PI/2;
 mesh.position.set(x,y,z);mesh.castShadow=true;parent.add(mesh);return mesh;
}
const stripeCanvas = document.createElement('canvas');stripeCanvas.width=128;stripeCanvas.height=32;
const stripeContext = stripeCanvas.getContext('2d');stripeContext.fillStyle='#d5c44b';stripeContext.fillRect(0,0,128,32);stripeContext.strokeStyle='#151822';stripeContext.lineWidth=10;
for(let x=-32;x<160;x+=18){stripeContext.beginPath();stripeContext.moveTo(x,32);stripeContext.lineTo(x+18,0);stripeContext.stroke();}
const stripeTexture = new THREE.CanvasTexture(stripeCanvas);stripeTexture.colorSpace = THREE.SRGBColorSpace;
const hazard = new THREE.MeshStandardMaterial({ map:stripeTexture, metalness:.4, roughness:.5 });
const robot = new THREE.Group();scene.add(robot);robot.visible=false;
const movingParts=[];
function part(x,y,z, startX, startY, delay) {
 const group = new THREE.Group();robot.add(group);group.position.set(x,y,z);
 movingParts.push({group,end:new THREE.Vector3(x,y,z),start:new THREE.Vector3(startX,startY,.03),delay});return group;
}
function panelDetail(parent,w,h,x,y,z) {
 box(parent,w,h,.045,x,y,z,materials.silver,.025);
 box(parent,w-.065,h-.065,.055,x,y,z+.03,materials.blueDark,.02);
 box(parent,w-.115,h-.115,.05,x,y,z+.064,materials.blue,.02);
 for(const sx of [-1,1])for(const sy of [-1,1]){
  const screw=new THREE.Mesh(new THREE.SphereGeometry(.018,8,8),materials.silver);screw.scale.z=.3;screw.position.set(x+sx*(w/2-.055),y+sy*(h/2-.055),z+.097);parent.add(screw);
 }
}
function vents(parent,x,y,z,width,count=4) {
 for(let i=0;i<count;i++)box(parent,width,.025,.025,x,y-i*.066,z,materials.black);
}
function wheel(parent,x,y,z) {
 cylinder(parent,.34,.18,x,y,z,materials.tire,true);
 cylinder(parent,.235,.185,x,y,z,materials.dark,true);
 cylinder(parent,.12,.20,x,y,z,materials.silver,true);
 for(let i=0;i<24;i++){
  const angle=i/24*Math.PI*2;
  const tread=box(parent,.19,.055,.04,x,y+Math.sin(angle)*.334,z+Math.cos(angle)*.334,materials.black);
  tread.rotation.x=-angle;
 }
 for(let i=0;i<5;i++){
  const angle=i/5*Math.PI*2;
  cylinder(parent,.029,.207,x,y+Math.sin(angle)*.16,z+Math.cos(angle)*.16,materials.silver,true);
 }
}
const torso=part(0,.7,0,0,.55,.12);
box(torso,1.58,1.3,.72,0,0,0,materials.blue,.065);
box(torso,1.38,.81,.085,0,.18,.405,materials.silver,.04);
box(torso,1.23,.66,.07,0,.18,.458,materials.dark,.035);
box(torso,1.12,.57,.035,0,.18,.51,materials.glass,.02);
box(torso,.98,.5,.015,0,.18,.535,materials.dark);
box(torso,.04,.57,.02,-.48,.18,.554,materials.silver);
box(torso,.04,.57,.02,.48,.18,.554,materials.silver);
const emblemCanvas=document.createElement('canvas');emblemCanvas.width=128;emblemCanvas.height=128;
const emblemCtx=emblemCanvas.getContext('2d');emblemCtx.fillStyle='#becbe1';emblemCtx.beginPath();
[[64,17],[77,31],[99,26],[91,49],[106,63],[90,75],[84,100],[65,88],[45,104],[40,77],[23,63],[39,48],[30,27],[52,32]].forEach(([x,y],i)=>i?emblemCtx.lineTo(x,y):emblemCtx.moveTo(x,y));emblemCtx.closePath();emblemCtx.fill();emblemCtx.fillStyle='#39435e';emblemCtx.fillRect(44,55,12,7);emblemCtx.fillRect(74,55,12,7);
const emblemTexture=new THREE.CanvasTexture(emblemCanvas);emblemTexture.colorSpace=THREE.SRGBColorSpace;
const emblem=new THREE.Mesh(new THREE.PlaneGeometry(.4,.4),new THREE.MeshBasicMaterial({map:emblemTexture,transparent:true}));emblem.position.set(0,.18,.551);torso.add(emblem);
vents(torso,-.49,-.34,.425,.32,4);vents(torso,.49,-.34,.425,.32,4);
box(torso,.16,.22,.04,0,-.42,.42,materials.purple);
for(const x of [-.65,.65])box(torso,.11,.07,.06,x,.63,.37,materials.silver);
box(torso,1.4,.14,.6,0,-.75,0,materials.dark);
for(const x of [-.52,.52]){
 box(torso,.33,.15,.17,x,-.71,.4,materials.silver,.018);
 box(torso,.25,.07,.03,x,-.71,.5,materials.black);
}
box(torso,.68,.21,.52,0,-.87,0,materials.dark,.03);
const hips=part(0,-.42,0,0,-.25,.2);
box(hips,1.35,.25,.68,0,0,0,materials.blue,.045);
box(hips,1.22,.07,.035,0,.03,.38,hazard);
box(hips,.28,.14,.05,0,.02,.4,materials.silver);
const head=part(0,1.8,0,0,1.98,.34);
cylinder(head,.19,.26,0,-.37,0,materials.dark);
box(head,.59,.57,.52,0,0,0,materials.blue,.04);
box(head,.46,.19,.035,0,.13,.28,materials.black);
box(head,.42,.04,.04,0,.13,.31,materials.red);
box(head,.4,.21,.045,0,-.14,.3,materials.silver,.025);
vents(head,0,-.09,.33,.28,3);
box(head,.3,.15,.4,0,.35,-.04,materials.blue,.035);
for(const x of [-.34,.34]){
 box(head,.06,.5,.08,x,.17,0,materials.silver);
 box(head,.1,.5,.35,x,-.035,0,materials.blue,.018);
 cylinder(head,.028,.35,x,.51,-.05,materials.silver);
}
const arms=[];const legs=[];
for(const side of [-1,1]){
 const shoulder=part(side*1.05,1.11,0,side*1.13,.9,.16);
 box(shoulder,.49,.78,.56,0,-.19,0,materials.blue,.035);
 box(shoulder,.35,.54,.03,0,-.18,.305,materials.dark);
 box(shoulder,.07,.59,.035,side*.225,-.19,.31,materials.silver);
 for(let i=0;i<3;i++){
  const chevron=box(shoulder,.085,.024,.02,-.03,-.23-i*.065,.33,hazard);chevron.rotation.z=Math.PI/4;
  const chevron2=box(shoulder,.085,.024,.02,.03,-.23-i*.065,.33,hazard);chevron2.rotation.z=-Math.PI/4;
 }
 const flap=box(shoulder,.66,.075,.77,side*.03,.29,0,materials.blue,.018);flap.rotation.z=side*-.22;
 box(shoulder,.6,.025,.025,side*.03,.34,.39,materials.silver);
 const arm=part(side*1.08,.22,0,side*1.14,-.15,.23);arms.push(arm);
 cylinder(arm,.13,.5,0,.16,0,materials.dark,true);
 box(arm,.5,.81,.58,0,-.25,0,materials.blue,.028);
 panelDetail(arm,.4,.64,0,-.25,.32);
 vents(arm,0,.02,.43,.29,3);
 box(arm,.55,.1,.64,0,-.68,0,materials.silver,.015);
 box(arm,.28,.27,.34,0,-.88,0,materials.dark,.03);
 for(let j=-1;j<=1;j++)box(arm,.071,.13,.14,j*.079,-1.04,.17,materials.black,.009);
 box(arm,.045,.53,.06,side*.16,-.43,.44,materials.silver);
 const thigh=part(side*.4,-.94,0,side*.47,-1.05,.1);
 box(thigh,.61,.82,.57,0,0,0,materials.blue,.035);
 panelDetail(thigh,.48,.69,0,.035,.34);
 wheel(thigh,side*.43,-.04,-.12);
 const leg=part(side*.4,-1.73,0,side*.48,-1.88,.05);legs.push(leg);
 cylinder(leg,.15,.4,0,.23,0,materials.dark,true);
 box(leg,.64,1.14,.58,0,-.28,0,materials.blue,.04);
 panelDetail(leg,.47,.9,0,-.27,.35);
 box(leg,.53,.31,.18,0,.31,.36,materials.silver,.035);
 box(leg,.32,.075,.015,0,-.02,.457,hazard);
 box(leg,.06,.98,.055,side*.28,-.3,.34,materials.silver);
 wheel(leg,side*.43,-.61,-.08);
 box(leg,.67,.2,.95,0,-.98,.23,materials.blue,.035);
 box(leg,.64,.065,.88,0,-1.08,.23,materials.silver,.01);
 box(leg,.49,.08,.035,0,-1.065,.726,hazard);
}
const cannon=box(arms[1],.15,.42,.2,0,-.39,.58,materials.dark,.02);
cannon.visible=false;
const beam=new THREE.Mesh(new THREE.CylinderGeometry(.06,.06,2.5,16),new THREE.MeshBasicMaterial({color:0xdcb2ff,transparent:true,opacity:0}));beam.rotation.x=Math.PI/2;beam.position.set(1.08,-.1,2);scene.add(beam);
const beamCore=new THREE.Mesh(new THREE.CylinderGeometry(.025,.025,2.6,12),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0}));beam.add(beamCore);
const tiles=new THREE.Group();scene.add(tiles);
const fragments=[];
const panelCanvas=document.createElement('canvas');panelCanvas.width=684;panelCanvas.height=956;
const ctx=panelCanvas.getContext('2d');
function drawPanel(){
 ctx.setTransform(2,0,0,2,0,0);ctx.clearRect(0,0,342,478);
 ctx.fillStyle='#111417';ctx.strokeStyle='#363b40';ctx.lineWidth=1;
 ctx.beginPath();ctx.moveTo(0,16);ctx.lineTo(16,0);ctx.lineTo(326,0);ctx.lineTo(342,16);ctx.lineTo(342,462);ctx.lineTo(326,478);ctx.lineTo(16,478);ctx.lineTo(0,462);ctx.closePath();ctx.fill();ctx.stroke();
 ctx.strokeStyle='#252a30';ctx.strokeRect(6,6,330,466);
 ctx.font='9px monospace';ctx.fillStyle='#7e8084';ctx.fillText('◈ SN 4F-0927-SW',26,26);ctx.fillText('//////// v0.1.0',214,26);
 ctx.font='bold 36px Arial';ctx.fillStyle='#dedfe1';ctx.fillText('SIGN IN',26,79);
 ctx.font='10px monospace';ctx.fillStyle='#7e8084';ctx.fillText('WELCOME BACK.',26,103);ctx.fillText('IDENTIFY YOURSELF.',26,118);
 ctx.font='9px monospace';ctx.fillText('AUTHORISED',240,78);ctx.fillText('PERSONNEL',240,90);ctx.fillText('ONLY.',240,102);
 const fields=[['EMAIL ADDRESS',document.querySelector('#email').value,151],['PASSWORD','•'.repeat(document.querySelector('#password').value.length),216]];
 for(const [label,value,y] of fields){ctx.fillStyle='#ac43f5';ctx.fillText('[',26,y);ctx.fillStyle='#7e8084';ctx.fillText(label,36,y);ctx.fillStyle='#090c0e';ctx.fillRect(26,y+10,290,34);ctx.strokeStyle='#363b40';ctx.strokeRect(26,y+10,290,34);ctx.fillStyle='#dedfe1';ctx.font='12px monospace';ctx.fillText(value,38,y+31);ctx.font='9px monospace';}
 ctx.fillStyle='#ac43f5';ctx.strokeStyle='#ac43f5';ctx.strokeRect(26,278,12,12);ctx.fillRect(29,281,6,6);ctx.font='10px monospace';ctx.fillStyle='#7e8084';ctx.fillText('Keep me signed in',46,288);ctx.fillStyle='#ac43f5';ctx.fillText('Forgot password?',216,288);
 ctx.fillRect(26,307,290,38);ctx.font='bold 12px monospace';ctx.fillStyle='#12091b';ctx.fillText('CONTINUE ›',123,331);
 ctx.font='10px monospace';ctx.fillStyle='#7e8084';ctx.fillText('// OR //',146,371);ctx.strokeStyle='#2b3034';ctx.beginPath();ctx.moveTo(26,367);ctx.lineTo(129,367);ctx.moveTo(215,367);ctx.lineTo(316,367);ctx.stroke();
 ctx.fillStyle='#191c20';ctx.fillRect(26,386,140,35);ctx.fillRect(176,386,140,35);ctx.strokeStyle='#3a3e44';ctx.strokeRect(26,386,140,35);ctx.strokeRect(176,386,140,35);ctx.font='12px Arial';ctx.fillStyle='#dedfe1';ctx.fillText('⚿  Passkey',62,408);ctx.fillText('♙  SSO',225,408);
 ctx.strokeStyle='#2b3034';ctx.beginPath();ctx.moveTo(26,438);ctx.lineTo(316,438);ctx.stroke();ctx.font='8px monospace';ctx.fillStyle='#ac43f5';ctx.fillText('> CREDENTIALS_RECEIVED ▮',26,460);ctx.fillStyle='#dedfe1';ctx.fillText('CREATE ACCOUNT',232,460);
}
drawPanel();
const panelTexture=new THREE.CanvasTexture(panelCanvas);panelTexture.colorSpace=THREE.SRGBColorSpace;
const tileRows=6,tileColumns=4;
for(let row=0;row<tileRows;row++)for(let col=0;col<tileColumns;col++){
 const geometry=new THREE.PlaneGeometry(3.8/tileColumns,5.31/tileRows);
 const uv=geometry.attributes.uv;
 for(let i=0;i<uv.count;i++)uv.setXY(i,(uv.getX(i)+col)/tileColumns,(uv.getY(i)+tileRows-1-row)/tileRows);
 const material=new THREE.MeshBasicMaterial({map:panelTexture,transparent:true,side:THREE.DoubleSide});
 const tile=new THREE.Mesh(geometry,material);
 const start=new THREE.Vector3((col-1.5)*3.8/tileColumns,(2.5-row)*5.31/tileRows,0);
 tile.position.copy(start);
 const outline=new THREE.LineSegments(new THREE.EdgesGeometry(geometry),new THREE.LineBasicMaterial({color:0xb452ff,transparent:true,opacity:0}));outline.position.z=.006;tile.add(outline);
 const target = row<2 ? new THREE.Vector3((col-1.5)*.62,1.2-row*.6,.25):row<4?new THREE.Vector3((col-1.5)*.6,.2-(row-2)*.7,.4):new THREE.Vector3((col-1.5)*.38,-1.55-(row-4)*.75,.45);
 const spread=new THREE.Vector3((col-1.5)*1.14+(col%2?.3:-.3),start.y*.93,1.1+(row%3)*.45);
 fragments.push({tile,start,target,spread,outline,row,col});tiles.add(tile);
}
tiles.visible=false;
let state='form',startTime=0,returnTime=0,orbit=0,pointerDown=false,lastPointer=0;
const ease=(x)=>x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2;
const clamp=(x)=>Math.max(0,Math.min(1,x));
function resize(){
 const width=stage.clientWidth,height=stage.clientHeight;
 renderer.setSize(width,height);camera.aspect=width/height;camera.updateProjectionMatrix();
 const worldHeight=2*Math.tan(THREE.MathUtils.degToRad(camera.fov/2))*12.8;
 const worldScale=panel.clientHeight/height*worldHeight/5.31;
 tiles.scale.setScalar(worldScale);robot.scale.setScalar(worldScale);
 ground.position.y=-2.85*worldScale;grid.position.y=ground.position.y-.01;
}
window.addEventListener('resize',resize);resize();
function transform(){
 if(state!=='form')return;
 drawPanel();panelTexture.needsUpdate=true;resize();
 panel.inert=true;state='transform';startTime=performance.now();stage.classList.add('transforming');robot.visible=true;tiles.visible=true;
 document.querySelector('#robot-status').textContent='TRANSFORM_SEQUENCE';
}
form.addEventListener('submit',(event)=>{event.preventDefault();transform();});
document.querySelector('#passkey').addEventListener('click',transform);
document.querySelector('#sso').addEventListener('click',transform);
function returnToForm(){if(state==='form'||state==='return')return;state='return';returnTime=performance.now();stage.classList.remove('transformed');}
document.querySelector('#return').addEventListener('click',returnToForm);
window.addEventListener('keydown',event=>{if(event.key==='Escape')returnToForm();});
let noticeTimer;
function notice(message){const el=document.querySelector('.notice');el.textContent=message;el.style.opacity=1;clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>el.style.opacity=0,3500);}
document.querySelector('#forgot').addEventListener('click',()=>notice('DEMO MODE · PASSWORD RECOVERY IS NOT CONNECTED'));
document.querySelector('#create').addEventListener('click',()=>{
 const creating=document.querySelector('h1').textContent==='CREATE ID';
 document.querySelector('h1').textContent=creating?'SIGN IN':'CREATE ID';
 document.querySelector('.heading p').innerHTML=creating?'WELCOME BACK.<br>IDENTIFY YOURSELF.':'NEW PERSONNEL.<br>REGISTER YOUR IDENTITY.';
 document.querySelector('#create').textContent=creating?'CREATE ACCOUNT':'BACK TO SIGN IN';
 document.querySelector('#status').innerHTML=creating?'&gt; CREDENTIALS_RECEIVED<i></i>':'&gt; AWAITING_REGISTRATION<i></i>';
 document.querySelector('#password').autocomplete=creating?'current-password':'new-password';
});
renderer.domElement.addEventListener('pointerdown',event=>{if(state!=='robot')return;pointerDown=true;lastPointer=event.clientX;renderer.domElement.setPointerCapture(event.pointerId);});
renderer.domElement.addEventListener('pointermove',event=>{if(pointerDown){orbit+=(event.clientX-lastPointer)*.008;lastPointer=event.clientX;}});
renderer.domElement.addEventListener('pointerup',()=>pointerDown=false);
function assembly(progress){
 const p=clamp(progress);
 for(const {group,end,start,delay} of movingParts){
  const local=ease(clamp((p-delay*.4)/(1-delay*.4)));
  group.position.lerpVectors(start,end,local);
  group.rotation.y=(1-local)*(group.position.x>0?1:-1)*Math.PI*.65;
  group.rotation.x=(1-local)*Math.PI*.4;
  group.scale.setScalar(.45+.55*local);
 }
 for(const {tile,start,target,spread,outline,row,col} of fragments){
  if(p<.48){const k=ease(p/.48);tile.position.lerpVectors(start,spread,k);tile.rotation.set(k*(row-2)*.14,k*(col-1.5)*.4,k*(col-1.5)*.07);}
  else{const k=ease((p-.48)/.52);tile.position.lerpVectors(spread,target,k);tile.rotation.set((1-k)*(row-2)*.14+k*Math.PI/2,(1-k)*(col-1.5)*.4,(1-k)*(col-1.5)*.07);}
  tile.material.opacity=1-clamp((p-.56)/.38);
  outline.material.opacity=Math.sin(p*Math.PI)*.95;
 }
 robot.scale.setScalar(tiles.scale.x*(.94+.06*p));
 robot.rotation.y=ease(p)*-.3;
 grid.material.opacity=p*.72;
 camera.position.set(0,.2+1.15*p,12.8);camera.lookAt(0,-.12*p,0);
 purpleLight.intensity=Math.sin(p*Math.PI)*7;
}
function animate(now){
 requestAnimationFrame(animate);
 if(state==='form')return;
 const elapsed=(now-startTime)/1000;
 if(state==='transform'){
  const progress=reducedMotion?1:clamp(elapsed/3.1);assembly(progress);
  if(progress===1){state='robot';tiles.visible=false;stage.classList.add('transformed');document.querySelector('.robot-controls').setAttribute('aria-hidden','false');}
 }else if(state==='robot'){
  const time=elapsed-3.1;
  robot.rotation.y=-.3+orbit+(reducedMotion?0:Math.sin(time*.45)*.12);
  torso.rotation.z=reducedMotion?0:Math.sin(time*1.3)*.006;
  head.rotation.y=reducedMotion?0:Math.sin(time*.8)*.18;
  const salute=ease(clamp((time-2)/.8))*(1-ease(clamp((time-4)/.8)));
  arms[1].rotation.z=-salute*1.9;arms[1].rotation.x=-salute*.25;
  const firing=ease(clamp((time-7)/.6))*(1-ease(clamp((time-9)/.6)));
  arms[1].rotation.x=-firing*1.35-salute*.25;
  cannon.visible=firing>.1;
  const pulse=firing>.9?Math.pow(Math.max(0,Math.sin(time*14)),5):0;
  beam.material.opacity=pulse*.8;beamCore.material.opacity=pulse;
  purpleLight.intensity=pulse*14;
  beam.position.set(1.08*robot.scale.x,.1,2*robot.scale.x);
  if(time>3.3)document.querySelector('#robot-status').textContent='IDENTITY_VERIFIED';
  if(time>15.5)returnToForm();
 }else if(state==='return'){
  const p=reducedMotion?0:1-clamp((now-returnTime)/2700);
  tiles.visible=true;assembly(p);robot.rotation.y*=ease(clamp(p*3));
  arms[1].rotation.set(0,0,0);head.rotation.y=0;beam.material.opacity=0;beamCore.material.opacity=0;cannon.visible=false;
  if(p===0){
   panel.inert=false;state='form';robot.visible=false;tiles.visible=false;stage.classList.remove('transforming');stage.classList.add('granted');
   document.querySelector('#authorization').innerHTML='ACCESS<br>GRANTED';
   document.querySelector('#status').innerHTML='&gt; TRANSFORM_SEQUENCE<i></i>';
   document.querySelector('.robot-controls').setAttribute('aria-hidden','true');orbit=0;
  }
 }
 renderer.render(scene,camera);
}
requestAnimationFrame(animate);
