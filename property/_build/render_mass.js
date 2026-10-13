const { chromium } = require('playwright');
const fs=require('fs'), path=require('path'); const SP=__dirname;
(async()=>{
  const browser=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  const page=await browser.newPage({viewport:{width:1300,height:1000},deviceScaleFactor:1});
  page.on('console',m=>{if(m.type()==='error')console.log('console:',m.text())});
  await page.goto('file://'+path.join(SP,'model3d.html'));
  await page.waitForFunction(()=>document.body.dataset.ready==='true',null,{timeout:120000});
  const wood='data:image/jpeg;base64,'+fs.readFileSync(path.join(SP,'basswood.jpg')).toString('base64');
  const out=await page.evaluate(async({wood})=>{
    const T=window.ppxModel.THREE;
    const W=1200,H=900;
    const r=new T.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});
    r.setPixelRatio(1);r.setSize(W,H);r.shadowMap.enabled=true;r.shadowMap.type=T.PCFSoftShadowMap;r.outputColorSpace=T.SRGBColorSpace;r.toneMapping=T.ACESFilmicToneMapping;r.toneMappingExposure=.95;r.setClearColor(0,0);
    document.body.appendChild(r.domElement);
    const wT=await new Promise(res=>new T.TextureLoader().load(wood,t=>{t.colorSpace=T.SRGBColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(.25,.25);res(t);}));
    const white=new T.MeshStandardMaterial({color:'#f2f2ef',roughness:.92});
    const bass=new T.MeshStandardMaterial({color:'#ffffff',map:wT,roughness:.85});
    const glass=new T.MeshStandardMaterial({color:'#c9d6d5',roughness:.25,metalness:.05});
    const water=new T.MeshStandardMaterial({color:'#9fc9c5',roughness:.15,metalness:.05});
    function scene(){const s=new T.Scene();s.add(new T.HemisphereLight('#ffffff','#b4b8b2',1.15));const sun=new T.DirectionalLight('#fffaf0',3.2);sun.position.set(-18,40,26);sun.castShadow=true;sun.shadow.mapSize.set(4096,4096);Object.assign(sun.shadow.camera,{left:-40,right:40,top:40,bottom:-40,near:1,far:150});sun.shadow.bias=-.0003;sun.shadow.normalBias=.03;sun.shadow.radius=4;s.add(sun);
      const c=new T.Mesh(new T.PlaneGeometry(300,300),new T.ShadowMaterial({opacity:.30}));c.rotation.x=-Math.PI/2;c.receiveShadow=true;s.add(c);return s;}
    function box(s,x,y,z,w,h,d,m){const o=new T.Mesh(new T.BoxGeometry(w,h,d),m);o.position.set(x,y+h/2,z);o.castShadow=true;o.receiveShadow=true;s.add(o);return o;}
    function tree(s,x,z,h=4.5,r=1.6){box(s,x,0,z,.18,h,.18,white);const b=new T.Mesh(new T.SphereGeometry(r,18,14),white);b.position.set(x,h+r*.6,z);b.scale.set(1,.8,1);b.castShadow=true;s.add(b);}
    function shot(s,cam){r.render(s,cam);return r.domElement.toDataURL('image/png');}
    const res={};
    // Villa: two stacked volumes with a cantilever, roof overhang, pool and timber deck
    {const s=scene();
      box(s,0,0,0,22,.5,15,white);                       // terrace plinth
      box(s,-4,.5,-3,11,3.2,7,white);                    // ground volume
      box(s,-4.1,.5,.52,10.6,2.6,.06,glass);             // ground glazing
      box(s,2,3.7,-2.5,11,3,6.5,white);                  // upper volume (cantilevers right)
      box(s,2,3.95,.78,10.4,2.4,.06,glass);
      box(s,1.6,6.7,-2.6,12.6,.3,7.6,white);             // roof slab overhang
      for(let i=0;i<9;i++)box(s,-3.2+i*1.3,3.7,.95,.16,3,.16,bass);   // timber fins
      box(s,4.2,.5,3.9,9.5,.12,3.2,water);               // pool
      box(s,4.2,.5,2.05,9.9,.22,.35,white);box(s,4.2,.5,5.65,9.9,.22,.35,white);
      box(s,-6.5,.5,4,6,.1,4.2,bass);                    // deck
      tree(s,-9.5,5.5,4.2,1.7);tree(s,9.8,-5.5,5,2);tree(s,-10,-5.8,3.6,1.4);
      const cam=new T.PerspectiveCamera(30,W/H,.1,500);cam.position.set(-30,24,40);cam.lookAt(0,2.6,0);res.villa=shot(s,cam);}
    // Branded residence: terraced low-rise stepping back up a slope, timber soffits, garden roofs
    {const s=scene();
      for(let i=0;i<5;i++){const d=12-i*2.1,z=-i*2.1/2- i*0.2,y=i*3.1;
        box(s,0,y,z,22,2.7,d,white);
        box(s,0,y+.25,z+d/2+.01,21.2,2.1,.06,glass);
        box(s,0,y+2.7,z+.35,22.6,.35,d+.7,white);             // slab with balcony lip
        box(s,0,y+2.6,z+d/2+.3,22.2,.1,.6,bass);              // timber soffit edge
        for(let k=-3;k<=3;k++)box(s,k*3.4,y+.35,z+d/2+.55,.08,.9,.08,white); // balustrade posts
      }
      box(s,0,15.5,-5.6,22.4,.3,3,white);
      box(s,-15,0,2,6,.12,5,bass);                             // arrival deck
      tree(s,-14,-4,5,2);tree(s,14.5,3,4.2,1.7);tree(s,13,-6,5.5,2.1);
      const cam=new T.PerspectiveCamera(30,W/H,.1,500);cam.position.set(-34,26,42);cam.lookAt(0,6,0);res.branded=shot(s,cam);}
    // Condominium: podium and two towers with expressed floor slabs, timber crowns
    {const s=scene();
      box(s,0,0,0,26,4.2,16,white);box(s,0,.3,8.02,24,3.4,.06,glass);
      function tower(x,z,floors){box(s,x,4.2,z,8.4,floors*3,8.4,glass);for(let f=0;f<=floors;f++)box(s,x,4.2+f*3-.18,z,9,.36,9,white);box(s,x,4.2+floors*3+.2,z,6,1.6,6,bass);}
      tower(-6,-1.5,12);tower(6.5,1.5,9);
      tree(s,-14,7,4,1.6);tree(s,14.5,-6,4.6,1.8);
      const cam=new T.PerspectiveCamera(30,W/H,.1,500);cam.position.set(-62,40,80);cam.lookAt(0,20,0);res.condo=shot(s,cam);}
    return res;
  },{wood});
  for(const k of Object.keys(out)) fs.writeFileSync(path.join(SP,`mass_${k}.png`),Buffer.from(out[k].split(',')[1],'base64'));
  await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
