const { chromium } = require('playwright');
const fs=require('fs'); const path=require('path');
const SP=__dirname;
const args=process.argv.slice(2); const mode=args[0]||'still';
(async()=>{
  const browser=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--allow-file-access-from-files']});
  const W=+(args[1]||2000), H=+(args[2]||1250);
  const page=await browser.newPage({viewport:{width:W+40,height:H+400},deviceScaleFactor:1});
  page.on('console',m=>{if(m.type()==='error')console.log('console:',m.text())});
  await page.goto('file://'+path.join(SP,'model3d.html'));
  await page.waitForFunction(()=>document.body.dataset.ready==='true',null,{timeout:120000});
  const terr='data:image/jpeg;base64,'+fs.readFileSync(path.join(SP,'terrazzo.jpg')).toString('base64');
  const wood='data:image/jpeg;base64,'+fs.readFileSync(path.join(SP,'basswood.jpg')).toString('base64');
  await page.evaluate(async({W,H,terr,wood})=>{
    const P=window.ppxModel,T=P.THREE;
    const host=document.querySelector('#scene');
    Object.assign(host.style,{position:'fixed',left:'0',top:'0',width:W+'px',height:H+'px',zIndex:9999});
    P.render.setPixelRatio(1);
    P.render.setClearColor(0x000000,0); P.scene.background=null;
    P.render.toneMappingExposure=0.95;P.scene.traverse(o=>{if(o.isHemisphereLight){o.color.set('#ffffff');o.groundColor.set('#b4b8b2');o.intensity=1.15;}if(o.isDirectionalLight){o.color.set('#fffaf0');o.intensity=3.3;o.position.set(2,48,30);}});
    const std=(c,r=.92)=>new T.MeshStandardMaterial({color:c,roughness:r,metalness:0});
    const white=std('#f3f3f0'),floor=std('#e8e9e4'),grey=std('#9c9e9a'),brass=new T.MeshStandardMaterial({color:'#b48d4e',roughness:.45,metalness:.6});
    const load=u=>new Promise(r=>new T.TextureLoader().load(u,t=>{t.colorSpace=T.SRGBColorSpace;r(t);}));
    const tT=await load(terr),wT=await load(wood);
    tT.wrapS=tT.wrapT=T.RepeatWrapping;tT.repeat.set(2.2,1);wT.wrapS=wT.wrapT=T.RepeatWrapping;wT.repeat.set(.3,.3);
    const bass=new T.MeshStandardMaterial({color:'#ffffff',map:wT,roughness:.85}),bassDark=new T.MeshStandardMaterial({color:'#e3cfa8',map:wT,roughness:.85});
    const M=P.M; const map=new Map([[M.ivory,white],[M.wall,white],[M.stone,floor],[M.cloth,white],[M.sage,white],[M.leaf,white],[M.trunk,white],[M.black,grey],[M.teal,bassDark],[M.wood,bass],[M.darkWood,bass],[M.gold,brass],[M.led,white]]);
    P.ceiling.visible=false;P.fixtures.visible=false;P.routeGroup.visible=false;
    P.scene.traverse(o=>{
      if(!o.isMesh&&!o.isLine)return;
      const m=o.material;
      if(o.isLine){o.visible=false;return;}
      if(m===M.glass){o.visible=false;return;}
      if(m&&m.isMeshBasicMaterial){ if(m.visible===false) return; if(m.transparent){o.visible=false;return;}
        // floor text decals lie flat
        if(Math.abs(o.rotation.x+Math.PI/2)<.01){o.visible=false;return;}
        o.material=white;return;}
      if(map.has(m)){o.material=map.get(m);return;}
      if(m&&m.isMeshStandardMaterial){o.material=white;}
    });
    // remove near (south) wall for a cutaway
    P.walls.children.forEach(w=>{if(w.position.z>5)w.visible=false;});
    // plinth: terrazzo block with brass band
    const geo=new T.BoxGeometry(54,2.6,24);
    const plinth=new T.Mesh(geo,new T.MeshStandardMaterial({map:tT,roughness:.6}));plinth.position.set(25,-1.82,0);plinth.receiveShadow=true;plinth.castShadow=true;P.scene.add(plinth);
    const band=new T.Mesh(new T.BoxGeometry(54.08,.14,24.08),brass);band.position.set(25,-.6,0);P.scene.add(band);
    const catcher=new T.Mesh(new T.PlaneGeometry(400,400),new T.ShadowMaterial({opacity:.32}));catcher.rotation.x=-Math.PI/2;catcher.position.set(25,-3.12,0);catcher.receiveShadow=true;P.scene.traverse(o=>{if(o.isDirectionalLight){o.shadow.camera.left=-60;o.shadow.camera.right=60;o.shadow.camera.top=45;o.shadow.camera.bottom=-45;o.shadow.camera.far=160;o.shadow.mapSize.set(4096,4096);o.shadow.radius=6;o.shadow.camera.updateProjectionMatrix();}});window.__model={W,H};
    P.setView('overview');
  },{W,H,terr,wood});
  const shoot=async(file,theta,polar,zoom,tx)=>{
    await page.evaluate(({theta,polar,zoom,tx})=>{const P=window.ppxModel;if(tx!=null)P.target.x=tx;P.target.y=-6.5;P.setOrbit(theta,polar,zoom);P.render.render(P.scene,P.camera);},{theta,polar,zoom,tx});
    await page.waitForTimeout(250);
    const url=await page.evaluate(()=>{const P=window.ppxModel;P.render.render(P.scene,P.camera);return P.render.domElement.toDataURL('image/png');});
    fs.writeFileSync(file,Buffer.from(url.split(',')[1],'base64'));
  };
  if(mode==='still'){
    await shoot(path.join(SP,'model_still.png'),+(args[3]||-0.85),+(args[4]||0.95),+(args[5]||1.25),null);
  } else if(mode==='variants'){
    const vs=JSON.parse(args[3]);for(let i=0;i<vs.length;i++){await shoot(path.join(SP,`var${i}.png`),...vs[i],null);}
  } else if(mode==='turn'){
    fs.mkdirSync(path.join(SP,'turn'),{recursive:true});
    const n=+(args[3]||24),a0=+(args[4]||-1.35),a1=+(args[5]||-0.35);
    for(let i=0;i<n;i++){const t=a0+(a1-a0)*i/(n-1);await shoot(path.join(SP,'turn',`f${String(i).padStart(2,'0')}.png`),t,+(args[6]||0.95),+(args[7]||1.25),null);}
  } else if(mode==='plan'){
    const url=await page.evaluate(()=>{const P=window.ppxModel;P.setView('plan');P.render.render(P.scene,P.topCamera);return P.render.domElement.toDataURL('image/png');});
    fs.writeFileSync(path.join(SP,'model_plan.png'),Buffer.from(url.split(',')[1],'base64'));
    const info=await page.evaluate(()=>{const P=window.ppxModel,c=P.topCamera,v=new P.THREE.Vector3();return P.booths.map(b=>{v.set(b.x,0,b.z).project(c);return {id:b.id,kind:b.kind,u:(v.x+1)/2,v:(1-v.y)/2};});});
    fs.writeFileSync(path.join(SP,'model_plan.json'),JSON.stringify(info));
  }
  await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
