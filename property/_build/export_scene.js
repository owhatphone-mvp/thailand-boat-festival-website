const { chromium } = require('playwright');
const fs=require('fs'), path=require('path'); const SP=__dirname;
(async()=>{
  const browser=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  const page=await browser.newPage({viewport:{width:800,height:600}});
  await page.goto('file://'+path.join(SP,'model3d_colour.html'));
  await page.waitForFunction(()=>document.body.dataset.ready==='true',null,{timeout:120000});
  await page.waitForTimeout(1500);
  const data=await page.evaluate(()=>{
    const P=window.ppxModel,T=P.THREE; P.people.visible=false; P.routeGroup.visible=false; P.ceiling.visible=true; P.walls.visible=true; P.walls.children.forEach(w=>w.visible=true);
    P.scene.updateMatrixWorld(true);
    const mats=[],matIdx=new Map(),texIdx=new Map(),texs=[];
    function texOf(t){ if(!t||!t.image) return -1; if(texIdx.has(t.uuid)) return texIdx.get(t.uuid);
      const im=t.image; const c=document.createElement('canvas'); c.width=im.width||im.naturalWidth; c.height=im.height||im.naturalHeight;
      c.getContext('2d').drawImage(im,0,0); const i=texs.length; texs.push(c.toDataURL('image/png')); texIdx.set(t.uuid,i); return i; }
    function matOf(m){ if(matIdx.has(m.uuid)) return matIdx.get(m.uuid);
      const o={type:m.type,color:m.color?m.color.getHexString():'ffffff',rough:m.roughness??1,metal:m.metalness??0,
        emissive:m.emissive?m.emissive.getHexString():'000000',ei:m.emissiveIntensity??0,opacity:m.opacity??1,transparent:!!m.transparent,
        map:texOf(m.map),side:m.side};
      const i=mats.length; mats.push(o); matIdx.set(m.uuid,i); return i; }
    function visible(o){ while(o){ if(!o.visible) return false; o=o.parent;} return true; }
    const meshes=[]; const v=new T.Vector3();
    P.scene.traverse(o=>{
      if(!o.isMesh||!visible(o)) return; const m=o.material; if(!m||m.visible===false) return;
      if(m.isShadowMaterial) return;
      const g=o.geometry; const pos=g.attributes.position; const uv=g.attributes.uv; const idx=g.index;
      const P2=[]; for(let i=0;i<pos.count;i++){ v.fromBufferAttribute(pos,i).applyMatrix4(o.matrixWorld); P2.push(+v.x.toFixed(4),+v.y.toFixed(4),+v.z.toFixed(4)); }
      const I=idx?Array.from(idx.array):[...Array(pos.count).keys()];
      const mi=matOf(m);
      const rec={m:mi,p:P2,i:I,k:g.type};
      if(uv&&mats[mi].map>=0) rec.uv=Array.from(uv.array).map(x=>+x.toFixed(4));
      meshes.push(rec);
    });
    return {mats,texs,meshes};
  });
  fs.writeFileSync(path.join(SP,'blend','scene.json'),JSON.stringify(data));
  console.log('meshes',data.meshes.length,'mats',data.mats.length,'texs',data.texs.length);
  await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
