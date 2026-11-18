/* ==========================================================
   NÚCLEO — plano_comun.js
   Herramientas comunes de los planos de todos los módulos:
   escalas normalizadas, formatos de números, líneas de quiebre, cuadro de convenciones
   y cuerpos 3D (mallas cerradas) para el modelo 3D (DXF) y la lámina isométrica (PDF).
   Requiere: plano_dxf.js
   ========================================================== */

/* ---------- Escalas normalizadas ---------- */
var ESCALAS_STAR=[1,2,5,10,20,25,50,75,100,125,150,200,250,300,400,500,750,1000];   // escalas normalizadas de ingeniería
/* escala normalizada más grande con la que el dibujo (ancho × alto en m) cabe en la caja (mm de papel) */
function escalaAuto_STAR(ancho,alto,cajaW,cajaH){
  for(var i=0;i<ESCALAS_STAR.length;i++){var e=ESCALAS_STAR[i];if(ancho*1000/e<=cajaW&&alto*1000/e<=cajaH)return e;}
  return ESCALAS_STAR[ESCALAS_STAR.length-1];}

/* ---------- Formatos ---------- */
function fmt3_STAR(v){return (Math.round(v*1000)/1000).toFixed(3).replace(".",",");}
function fmt2_STAR(v){return (Math.round(v*100)/100).toFixed(2).replace(".",",");}
function nivTxt_STAR(v){return "N "+(v>0.0005?"+":v<-0.0005?"-":"±")+fmt3_STAR(Math.abs(v));}

/* ---------- Línea de quiebre (zigzag) ---------- */
function quiebre_STAR(P,x1,y1,x2,y2,h){var dx=x2-x1,dy=y2-y1,L=Math.hypot(dx,dy),ux=dx/L,uy=dy/L,nx=-uy,ny=ux,m=[(x1+x2)/2,(y1+y2)/2];
  P.polilinea([[x1-ux*h,y1-uy*h],[m[0]-ux*h*0.5,m[1]-uy*h*0.5],[m[0]-ux*h*0.15+nx*h,m[1]-uy*h*0.15+ny*h],[m[0]+ux*h*0.15-nx*h,m[1]+uy*h*0.15-ny*h],[m[0]+ux*h*0.5,m[1]+uy*h*0.5],[x2+ux*h,y2+uy*h]],false,"TRP-CORTES");}

/* ---------- Cuadro de convenciones (ncol columnas) ---------- */
function desConvenciones_STAR(P,x,y,W,h,est,ncol,extra){
  var hf=h*2.4,yy=y;
  P.rellenar([[x,yy-hf],[x+W,yy-hf],[x+W,yy],[x,yy]],"TRP-TABLAS-RELL");P.rect(x,yy-hf,x+W,yy,"TRP-TABLAS");
  P.texto(x+W/2,yy-hf/2,"CONVENCIONES",h*1.1,{capa:"TRP-TITULOS",al:"c",va:"m",negrita:true});yy-=hf;
  var cols=ncol||2,cw=W/cols,items=[
    [function(a,b,w,hh){P.concreto([[a,b],[a+w,b],[a+w,b+hh],[a,b+hh]],est);},"Concreto reforzado"],
    [function(a,b,w,hh){P.agua([[a,b],[a+w,b],[a+w,b+hh],[a,b+hh]]);P.linea(a,b+hh,a+w,b+hh,"TRP-AGUA");},"Lámina de agua"],
    [function(a,b,w,hh){P.linea(a,b+hh/2,a+w,b+hh/2,"TRP-EJES");},"Eje / corte"],
    [function(a,b,w,hh){P.linea(a,b+hh/2,a+w,b+hh/2,"TRP-OCULTAS");},"Arista oculta"],
    [function(a,b,w,hh){P.nivel(a+w*0.3,b+hh*0.1,"",h*0.75);},"Nivel (m) ref. N.A."],
    [function(a,b,w,hh){P.cotaH(a,b+hh*0.3,a+w,b+hh*0.3,b+hh*0.3,"",h*0.6);},"Cota (m)"]].concat(extra||[]);
  if(cols>1&&items.length%cols)items.push([function(){},""]);
  items.forEach(function(it,i){var c=i%cols,xx=x+c*cw,yr=yy-Math.floor(i/cols)*hf;
    P.rect(xx,yr-hf,xx+cw,yr,"TRP-TABLAS");it[0](xx+h*0.6,yr-hf+h*0.35,cw*0.3,hf-h*0.7);P.texto(xx+cw*0.38,yr-hf/2,it[1],h*0.95,{va:"m"});});
  return yy-Math.ceil(items.length/cols)*hf;}

/* ---------- Cuerpos 3D cerrados (convexos) ----------
   Cada cuerpo: {capa, v:[[x,y,z]...], f:[[i,j,k,l]...], bm:[[aristas visibles de cada cara]], rgb?, agua?, muro?}
   Las mallas se escriben en el DXF como POLYFACE MESH: AutoCAD las gira, las mide y las sombrea (3DORBIT, estilos visuales). */
var M3D={
  extruir:function(base,d,capa,extra){
    var n=base.length,v=base.concat(base.map(function(p){return [p[0]+d[0],p[1]+d[1],p[2]+d[2]];})),f=[],bm=[],i,j;
    if(n===4){f.push([0,1,2,3]);bm.push([1,1,1,1]);f.push([4,5,6,7]);bm.push([1,1,1,1]);}
    else for(i=1;i<n-1;i++){f.push([0,i,i+1,i+1]);bm.push([i===1?1:0,1,0,i===n-2?1:0]);f.push([n,n+i,n+i+1,n+i+1]);bm.push([i===1?1:0,1,0,i===n-2?1:0]);}
    for(i=0;i<n;i++){j=(i+1)%n;f.push([i,j,n+j,n+i]);bm.push([1,1,1,1]);}
    var c=[0,0,0];v.forEach(function(p){c[0]+=p[0]/v.length;c[1]+=p[1]/v.length;c[2]+=p[2]/v.length;});
    f=f.map(function(q,fi){
      var a=v[q[0]],b=v[q[1]],e=v[q[2]],u=[b[0]-a[0],b[1]-a[1],b[2]-a[2]],w=[e[0]-a[0],e[1]-a[1],e[2]-a[2]],
          nn=[u[1]*w[2]-u[2]*w[1],u[2]*w[0]-u[0]*w[2],u[0]*w[1]-u[1]*w[0]],m=[0,0,0],k=q[2]===q[3]?3:4;
      for(var z=0;z<k;z++){m[0]+=v[q[z]][0]/k;m[1]+=v[q[z]][1]/k;m[2]+=v[q[z]][2]/k;}
      if(nn[0]*(m[0]-c[0])+nn[1]*(m[1]-c[1])+nn[2]*(m[2]-c[2])>=0)return q;
      var bb=bm[fi];
      if(q[2]===q[3]){bm[fi]=[bb[1],bb[0],0,bb[3]];return [q[2],q[1],q[0],q[0]];}   // triángulo invertido: aristas (2-1),(1-0),(0-2)
      bm[fi]=[bb[2],bb[1],bb[0],bb[3]];return [q[3],q[2],q[1],q[0]];});
    var o={capa:capa,v:v,f:f,bm:bm};for(var k2 in extra)o[k2]=extra[k2];return o;},
  caja:function(x0,x1,y0,y1,z0,z1,capa,extra){
    return M3D.extruir([[x0,y0,z0],[x1,y0,z0],[x1,y1,z0],[x0,y1,z0]],[0,0,z1-z0],capa,extra);},
  prismaXZ:function(pol,y0,y1,capa,extra){return M3D.extruir(pol.map(function(p){return [p[0],y0,p[1]];}),[0,y1-y0,0],capa,extra);},
  prismaYZ:function(pol,x0,x1,capa,extra){return M3D.extruir(pol.map(function(p){return [x0,p[0],p[1]];}),[x1-x0,0,0],capa,extra);},
  /* cilindro de eje p0→p1 y radio r: lados lisos (sin aristas), tapas con su contorno */
  cilindro:function(p0,p1,r,n,capa,extra){
    n=n||20;var d=[p1[0]-p0[0],p1[1]-p0[1],p1[2]-p0[2]],L=Math.hypot(d[0],d[1],d[2]),a=[d[0]/L,d[1]/L,d[2]/L];
    var t=Math.abs(a[2])<0.9?[0,0,1]:[1,0,0],u=[a[1]*t[2]-a[2]*t[1],a[2]*t[0]-a[0]*t[2],a[0]*t[1]-a[1]*t[0]],Lu=Math.hypot(u[0],u[1],u[2]);u=u.map(function(q){return q/Lu;});
    var w=[a[1]*u[2]-a[2]*u[1],a[2]*u[0]-a[0]*u[2],a[0]*u[1]-a[1]*u[0]],base=[];
    for(var i=0;i<n;i++){var g=2*Math.PI*i/n,c=Math.cos(g)*r,s=Math.sin(g)*r;base.push([p0[0]+u[0]*c+w[0]*s,p0[1]+u[1]*c+w[1]*s,p0[2]+u[2]*c+w[2]*s]);}
    var o=M3D.extruir(base,d,capa,extra),nt=2*(n-2);
    o.bm=o.bm.map(function(b,i){return i<nt?b:[1,0,1,0];});   // lados: solo las aristas de las tapas
    o.liso=true;return o;},
  /* tubo con bridas en los extremos (bridas = discos de radio 1,6 r) */
  tuboBridas:function(p0,p1,r,capa,bridas){
    var C=[M3D.cilindro(p0,p1,r,20,capa,{rgb:"#C9CFD6"})],d=[p1[0]-p0[0],p1[1]-p0[1],p1[2]-p0[2]],L=Math.hypot(d[0],d[1],d[2]),a=d.map(function(q){return q/L;}),tb=Math.min(0.03,L/10);
    (bridas||[0,1]).forEach(function(s){var c=s===0?p0:p1,q0=[c[0]-a[0]*tb*(s?1:0),c[1]-a[1]*tb*(s?1:0),c[2]-a[2]*tb*(s?1:0)];
      C.push(M3D.cilindro(q0,[q0[0]+a[0]*tb,q0[1]+a[1]*tb,q0[2]+a[2]*tb],r*1.6+0.02,20,capa,{rgb:"#8E979F"}));});
    return C;}
};

/* ---------- Colores de los isométricos ---------- */
var ISO_COLOR={"TRP-3D-CONCRETO":"#CFCAC0","TRP-3D-AGUA":"#8CC8EE","TRP-TUBERIA":"#C9CFD6","TRP-3D-METAL":"#7C8791","TRP-BARROTES":"#7C8791"};
function isoMezcla_STAR(hex,k){var h=hex.replace("#",""),r=parseInt(h.substr(0,2),16),g=parseInt(h.substr(2,2),16),b=parseInt(h.substr(4,2),16);
  var t=function(v){v=Math.round(Math.max(0,Math.min(255,v*k)));return ("0"+v.toString(16)).slice(-2);};return "#"+t(r)+t(g)+t(b);}

/* ---------- Vista isométrica sombreada (luz difusa, caras subdivididas y ordenadas de atrás hacia adelante) ----------
   Devuelve la función de proyección mundo → lámina, para ubicar rótulos. */
function planoIsometrica(P,cuerpos,caja,o){
  o=o||{};var cam=o.cam||[-0.55,-1,0.8],L0=Math.hypot(cam[0],cam[1],cam[2]);cam=cam.map(function(v){return v/L0;});
  var luz=[-0.35,-0.55,0.95],Ll=Math.hypot(luz[0],luz[1],luz[2]);luz=luz.map(function(v){return v/Ll;});
  var cr=function(a,b){return [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];},dot=function(a,b){return a[0]*b[0]+a[1]*b[1]+a[2]*b[2];};
  var der=cr([0,0,1],cam),Ld=Math.hypot(der[0],der[1],der[2]);der=der.map(function(v){return v/Ld;});var arr=cr(cam,der);
  var pr=function(p){return [dot(p,der),dot(p,arr),-dot(p,cam)];};
  var X0=Infinity,X1=-Infinity,Y0=Infinity,Y1=-Infinity,dim=0,mn=[1e9,1e9,1e9],mx=[-1e9,-1e9,-1e9];
  cuerpos.forEach(function(b){b.v.forEach(function(p){var q=pr(p);X0=Math.min(X0,q[0]);X1=Math.max(X1,q[0]);Y0=Math.min(Y0,q[1]);Y1=Math.max(Y1,q[1]);
    for(var k=0;k<3;k++){mn[k]=Math.min(mn[k],p[k]);mx[k]=Math.max(mx[k],p[k]);}});});
  dim=Math.max(mx[0]-mn[0],mx[1]-mn[1],mx[2]-mn[2]);var paso=dim/22;
  var esc=Math.min((caja[2]-caja[0])/(X1-X0),(caja[3]-caja[1])/(Y1-Y0)),ox=(caja[0]+caja[2])/2-(X0+X1)/2*esc,oy=(caja[1]+caja[3])/2-(Y0+Y1)/2*esc;
  var S2=function(q){return [ox+q[0]*esc,oy+q[1]*esc];};
  var piezas=[];
  cuerpos.forEach(function(b){b.f.forEach(function(f,fi){
    var V=[b.v[f[0]],b.v[f[1]],b.v[f[2]],b.v[f[3]]],a=V[0];
    var nn=cr([V[1][0]-a[0],V[1][1]-a[1],V[1][2]-a[2]],[V[2][0]-a[0],V[2][1]-a[1],V[2][2]-a[2]]),L=Math.hypot(nn[0],nn[1],nn[2]);
    if(L<1e-12){nn=cr([V[2][0]-a[0],V[2][1]-a[1],V[2][2]-a[2]],[V[3][0]-a[0],V[3][1]-a[1],V[3][2]-a[2]]);L=Math.hypot(nn[0],nn[1],nn[2])||1;}
    nn=nn.map(function(v){return v/L;});if(dot(nn,cam)<=1e-6)return;
    if(b.agua&&!(nn[2]>0.5||nn[1]<-0.9||(o.aguaX&&nn[0]<-0.9)))return;   // agua: superficie y cara del corte
    var base=b.rgb||ISO_COLOR[b.capa]||"#CFCAC0",k=0.62+0.42*Math.max(0,dot(nn,luz));if(b.agua)k=0.92+0.12*Math.max(0,dot(nn,luz));
    var col=isoMezcla_STAR(base,k),borde=isoMezcla_STAR(base,0.42),bm=(b.bm&&b.bm[fi])||[1,1,1,1];
    var tri=f[2]===f[3],lu=Math.max(Math.hypot(V[1][0]-a[0],V[1][1]-a[1],V[1][2]-a[2]),Math.hypot(V[2][0]-V[3][0],V[2][1]-V[3][1],V[2][2]-V[3][2])),
        lv=Math.max(Math.hypot(V[3][0]-a[0],V[3][1]-a[1],V[3][2]-a[2]),Math.hypot(V[2][0]-V[1][0],V[2][1]-V[1][1],V[2][2]-V[1][2]));
    var nu=b.liso?1:Math.min(14,Math.max(1,Math.ceil(lu/paso))),nv=b.liso?1:Math.min(14,Math.max(1,Math.ceil(lv/paso)));
    var bil=function(s,t){var r=[];for(var k3=0;k3<3;k3++)r.push((1-s)*(1-t)*V[0][k3]+s*(1-t)*V[1][k3]+s*t*V[2][k3]+(1-s)*t*V[3][k3]);return r;};
    for(var i=0;i<nu;i++)for(var j=0;j<nv;j++){
      var q=[bil(i/nu,j/nv),bil((i+1)/nu,j/nv),bil((i+1)/nu,(j+1)/nv),bil(i/nu,(j+1)/nv)],pp=q.map(pr);
      var prof=(pp[0][2]+pp[1][2]+pp[2][2]+pp[3][2])/4;
      var ar=[];
      if(j===0&&bm[0])ar.push([0,1]);if(i===nu-1&&bm[1])ar.push([1,2]);if(j===nv-1&&bm[2]&&!tri)ar.push([2,3]);if(i===0&&bm[3])ar.push([3,0]);
      if(tri&&j===nv-1&&bm[2])ar.push([2,3]);
      piezas.push({pp:pp,prof:prof,col:col,borde:borde,ar:ar,agua:b.agua});}});});
  piezas.sort(function(m,n){return n.prof-m.prof;});
  piezas.forEach(function(c){var q=c.pp.map(S2);
    var e=P.solido([q[0],q[1],q[3],q[2]],"TRP-ISO-CARAS",254);e.rgb=c.col;
    c.ar.forEach(function(a){var l=P.linea(q[a[0]][0],q[a[0]][1],q[a[1]][0],q[a[1]][1],c.agua?"TRP-AGUA":"TRP-ISO-ARISTAS");l.rgb=c.agua?"#3B82C4":c.borde;});});
  return function(p){return S2(pr(p));};}

/* ---------- Modelo 3D (DXF): cuerpos → plano que abre en vista isométrica ---------- */
function modelo3D_STAR(cuerpos,meta,centro,alto,dir){
  var P=nuevoPlano(meta);
  cuerpos.forEach(function(c){var e=P.cuerpo3D(c.v,c.f.map(function(f){return f[2]===f[3]?f.slice(0,3):f;}),c.capa);});
  P.vistaIso(centro,alto,dir||[-1,-1.2,0.9]);
  return P;}

/* ---------- Rótulos con línea guía alrededor de una vista isométrica ---------- */
function isoRotulos_STAR(P,proy,et,caja,h){
  if(!et||!et.length)return;
  var cx=(caja[0]+caja[2])/2,lados={i:[],d:[]};
  et.forEach(function(r){var p=proy(r.p);(p[0]<cx?lados.i:lados.d).push({p:p,t:r.t});});
  ["i","d"].forEach(function(k){
    var L=lados[k].sort(function(a,b){return b.p[1]-a.p[1];}),sep=h*2.6,y=Infinity;
    L.forEach(function(r){r.y=Math.min(r.p[1]+h*1.2,y-sep);y=r.y;});
    var bajo=L.length?L[L.length-1].y:0;if(bajo<caja[1]){var dy=caja[1]-bajo;L.forEach(function(r){r.y+=dy;});}
    L.forEach(function(r){
      var xt=k==="i"?caja[0]:caja[2],xe=k==="i"?xt+h*1.2:xt-h*1.2;
      P.circulo(r.p[0],r.p[1],h*0.18,"TRP-TEXTOS").r=h*0.18;
      P.polilinea([[r.p[0],r.p[1]],[xe,r.y],[xt,r.y]],false,"TRP-TEXTOS");
      P.texto(k==="i"?xt-h*0.4:xt+h*0.4,r.y,r.t,h,{al:k==="i"?"d":"i",va:"m"});});});}

/* ---------- Lámina isométrica (PDF 3D) ----------
   o = {numero, titulo, datos:[[símbolo,descripción,valor]], etiquetas:[{p:[x,y,z],t:"TEXTO"}], cam}
   Vista superior: isométrica general. Vista inferior: en corte (sin el muro muro:-1) con la lámina de agua. */
function lamina3D_STAR(meta,cuerpos,o){
  meta.totalHojas=1;
  var P=nuevoPlano(meta),esc=25,mm=function(v){return v*esc/1000;};
  var L=P.lamina({titulo:o.titulo||"Vistas isométricas",escala:esc,escalaTxt:"S/E",numero:o.numero}),A=L.area,tt=mm(4.2),h=mm(2.1);
  var cx1=A.x1-mm(100),ax0=A.x0+mm(40),ax1=cx1-mm(42),top=A.y1-mm(10),bot=A.y0+mm(2),mid=(top+bot)/2;
  var v1=[ax0,mid+mm(4),ax1,top-mm(6)],v2=[ax0,bot+mm(2),ax1,mid-mm(12)],cam=o.cam||[-0.55,-1,0.8];
  var pr1=planoIsometrica(P,cuerpos.filter(function(c){return !c.agua;}),v1,{cam:cam});
  P.tituloVista((A.x0+cx1)/2,top,"ISOMÉTRICA GENERAL",null,tt);
  isoRotulos_STAR(P,pr1,o.etiquetas,[A.x0+mm(36),v1[1],cx1-mm(38),v1[3]],h);
  var pr2=planoIsometrica(P,cuerpos.filter(function(c){return c.muro!==-1;}).map(function(c){return c.corte||c;}),v2,{cam:cam});
  P.tituloVista((A.x0+cx1)/2,mid-mm(4),"ISOMÉTRICA EN CORTE CON LÁMINA DE AGUA",null,tt);
  isoRotulos_STAR(P,pr2,(o.etiquetas2||[]),[A.x0+mm(36),v2[1],cx1-mm(38),v2[3]],h);
  P.linea(cx1-mm(4),A.y0,cx1-mm(4),A.y1,"TRP-ROTULO-ETIQ");
  var y=A.y1-mm(4);
  if(o.datos&&o.datos.length)y=P.cuadro(cx1,y,[mm(16),mm(52),mm(28)],["SÍMB.","DESCRIPCIÓN","VALOR"],o.datos,mm(2.0),"DIMENSIONES GENERALES",["c","i","c"]);
  /* convenciones de colores */
  var yy=y-mm(8),fil=[["#CFCAC0","Concreto reforzado"],["#8CC8EE","Lámina de agua"],["#C9CFD6","Tubería y accesorios"]].concat(o.colores||[]);
  P.cuadro(cx1,yy,[mm(96)],null,[],mm(2.0),"CONVENCIONES",["c"]);yy-=mm(4.4);
  fil.forEach(function(f){var s=P.solido([[cx1+mm(3),yy-mm(5.4)],[cx1+mm(15),yy-mm(5.4)],[cx1+mm(3),yy-mm(1.2)],[cx1+mm(15),yy-mm(1.2)]],"TRP-ISO-CARAS",254);s.rgb=f[0];
    P.rect(cx1+mm(3),yy-mm(5.4),cx1+mm(15),yy-mm(1.2),"TRP-TABLAS");P.texto(cx1+mm(19),yy-mm(3.3),f[1],mm(2.0),{va:"m"});P.rect(cx1,yy-mm(6.6),cx1+mm(96),yy,"TRP-TABLAS");yy-=mm(6.6);});
  P.texto(cx1+mm(48),yy-mm(6),"Vistas isométricas sin escala.",mm(1.9),{al:"c",capa:"TRP-ROTULO-ETIQ"});
  P.texto(cx1+mm(48),yy-mm(10),"El modelo 3D (DWG) se gira con 3DORBIT en AutoCAD.",mm(1.9),{al:"c",capa:"TRP-ROTULO-ETIQ"});
  return P;}

/* ---------- Datos generales de los planos (proyecto, diseñador, fecha, nombre del archivo) ---------- */
function fechaHoy_STAR(){var d=new Date();return ("0"+d.getDate()).slice(-2)+"/"+("0"+(d.getMonth()+1)).slice(-2)+"/"+d.getFullYear();}
function metaPlano_STAR(unidad){
  return {proyecto:String(PRO.nombrePob||"PROYECTO SIN NOMBRE").toUpperCase(),diseñador:String(PRO.diseñador||"").toUpperCase(),fecha:fechaHoy_STAR(),unidad:unidad,tipo:"STAR"};}
function nombreArchivo_STAR(pref){
  return pref+"_"+String(PRO.nombrePob||"Proyecto").normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[^0-9A-Za-z]+/g,"_").replace(/^_|_$/g,"");}
/* centro y alto de vista de un conjunto de cuerpos (para abrir el DXF 3D en isométrica) */
function vista3D_STAR(cuerpos){
  var mn=[1e9,1e9,1e9],mx=[-1e9,-1e9,-1e9];
  cuerpos.forEach(function(c){c.v.forEach(function(p){for(var k=0;k<3;k++){mn[k]=Math.min(mn[k],p[k]);mx[k]=Math.max(mx[k],p[k]);}});});
  return {c:[(mn[0]+mx[0])/2,(mn[1]+mx[1])/2,(mn[2]+mx[2])/2],h:Math.max(mx[0]-mn[0],mx[1]-mn[1],(mx[2]-mn[2])*1.6)*1.15};}
function modelo3DAuto_STAR(cuerpos,meta){var v=vista3D_STAR(cuerpos);return modelo3D_STAR(cuerpos,meta,v.c,v.h);}

/* círculo relleno (para secciones de barrotes y tuberías) */
function circuloLleno_STAR(P,cx,cy,r,capa,n){n=n||28;var pts=[];for(var i=0;i<n;i++){var a=2*Math.PI*i/n;pts.push([cx+r*Math.cos(a),cy+r*Math.sin(a)]);}P.rellenar(pts,capa);P.polilinea(pts,true,capa);}
