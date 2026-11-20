/* ==========================================================
   RS · RED DE GASES  (gases.js)
   Generación de metano y biogás (LandGEM de primer orden o potencial anual),
   captación, pozos y tramos de la red. Hoja de referencia: RED DE GASES.
   ========================================================== */

/* ==========================================================
   1. VALIDACIÓN
   ========================================================== */
function faltaGas_RS(){
  var e=[];
  ["rsFb","rsL0","rsCH4","rsEfCap","rsFpGas","rsSepPozos","rsQPozo","rsSepCond"].forEach(function(k){if(!esPos(PRO[k]))e.push("Falta un valor válido de "+{rsFb:"fracción biodegradable",rsL0:"potencial de metano L0",rsCH4:"fracción de metano",rsEfCap:"eficiencia de captación",rsFpGas:"factor de punta",rsSepPozos:"separación entre pozos",rsQPozo:"caudal por pozo",rsSepCond:"separación entre condensados"}[k]+" (Términos de referencia).");});
  if(PRO.rsMetGas===METODOS_GAS_RS[0]&&!esPos(PRO.rsK))e.push("Falta la constante de generación k (Términos de referencia).");
  return e.concat(erroresCeldas_RS().length?["El módulo de celdas tiene datos por completar."]:[]);}
function erroresTramosGas_RS(){
  var e=[],T=PRO.rsTramosGas||[];
  if(!T.length)e.push("La red de gases no tiene tramos: agregue al menos uno.");
  T.forEach(function(t,i){var n=t.n||("Tramo "+(i+1));
    if(typeof t.frac!=="number"||!(t.frac>0&&t.frac<=1))e.push(n+": la fracción del caudal debe ser un número entre 0 y 1.");
    [["L","la longitud"],["S","la pendiente"],["D","el diámetro"],["v","la velocidad objetivo"]].forEach(function(c){if(typeof t[c[0]]!=="number"||!(t[c[0]]>0))e.push(n+": falta "+c[1]+" (número mayor que cero).");});});
  return e;}
function erroresGas_RS(){return faltaGas_RS().concat(erroresTramosGas_RS());}
function avisosResGas_RS(){
  var e=[],D=rsTodo();if(erroresGas_RS().length||!D.ok)return e;
  D.Ga.tramos.forEach(function(t){if(!t.okV)e.push(t.n+": la velocidad ("+nf(t.V,2)+" m/s) supera la velocidad objetivo ("+nf(t.vo,1)+" m/s). Diámetro sugerido: "+nf(t.Dsug,3)+" m.");});
  return e;}

RS_TABLAS.gas_RS=function(){
  var D=rsTodo();if(!D.ok)return null;
  return {titulo:"Generación y captación de biogás por año",sub:"Método: "+D.Ga.met+". Pozos adoptados = máx(pozos por caudal, pozos por área cubierta).",
    columnas:[{k:"anio",t:"Año",fmt:function(v){return String(v);}},{k:"M",t:"RS dispuesto",u:"ton/año",d:1,tot:"sum"},{k:"ch4",t:"Metano",u:"m³ CH₄/año",d:0,tot:"sum"},{k:"bio",t:"Biogás",u:"m³/año",d:0,tot:"sum"},{k:"cap",t:"Biogás captado",u:"m³/año",d:0,tot:"sum"},
      {k:"Qd",t:"Biogás de diseño",u:"m³/h",d:2,tot:"max"},{k:"pq",t:"Pozos por caudal",u:"und",d:0},{k:"pa",t:"Pozos por área",u:"und",d:0},{k:"pozos",t:"Pozos adoptados",u:"und",d:0,tot:"max"}],
    csv:"Gases_RS",filas:D.Ga.filas};};

/* ==========================================================
   2. TABLA DE TRAMOS Y ESQUEMA DEL POZO
   ========================================================== */
function tablaTramosGas_RS(G){
  var T=PRO.rsTramosGas||[];
  var h='<div class="card"><div class="card-title">Tramos de la red de gases</div><div class="card-sub">Fracción del caudal máximo de biogás de diseño que conduce cada tramo (Q<sub>máx</sub> = <b>'+rsF(G.Qmax,2)+' m³/h</b>), longitud, pendiente, diámetro adoptado y velocidad objetivo.</div>'+
    '<div class="rs-tscroll"><table class="rs-table rs-edit"><thead><tr><th class="izq">Tramo</th><th>Fracción de Q</th><th>Longitud<small>(m)</small></th><th>Pendiente<small>(m/m)</small></th><th>Diámetro<small>(m)</small></th><th>V objetivo<small>(m/s)</small></th></tr></thead><tbody>';
  T.forEach(function(t,i){h+='<tr><td class="izq">'+rsInp("rsTramosGas",i,"n",t.n,{text:true,cls:"txt"})+'</td><td>'+rsInp("rsTramosGas",i,"frac",t.frac)+'</td><td>'+rsInp("rsTramosGas",i,"L",t.L)+'</td><td>'+rsInp("rsTramosGas",i,"S",t.S)+'</td><td>'+rsInp("rsTramosGas",i,"D",t.D)+'</td><td>'+rsInp("rsTramosGas",i,"v",t.v)+'</td></tr>';});
  h+='</tbody></table></div><div class="rs-bar-acc"><button type="button" class="btn-sec" onclick="rsAgregarFila(\'rsTramosGas\',{n:\'Nuevo tramo\',frac:\'\',L:\'\',S:\'\',D:\'\',v:\'\'})">+ Agregar tramo</button>'+
    '<button type="button" class="btn-sec" onclick="rsEliminarFilas(\'rsTramosGas\',\'Eliminar tramos\',\'Marque los tramos que desea eliminar de la red de gases.\')">Eliminar tramo</button></div></div>';
  h+='<div class="card"><div class="card-title">Resultados por tramo</div><div class="rs-tscroll"><table class="rs-table"><thead><tr><th class="izq">Tramo</th><th>Q<small>(m³/h)</small></th><th>D<small>(m)</small></th><th>Área<small>(m²)</small></th><th>V real<small>(m/s)</small></th><th>D requerido<small>(m)</small></th><th>Velocidad</th><th>Condensados<small>(und)</small></th></tr></thead><tbody>';
  G.tramos.forEach(function(t){h+='<tr><td class="izq">'+esc(t.n)+'</td><td>'+rsF(t.Q,2)+'</td><td>'+rsF(t.D,3)+'</td><td>'+rsF(t.A,5)+'</td><td>'+rsF(t.V,2)+'</td><td>'+rsF(t.Dreq,3)+'</td><td>'+rsChip(t.okV?"OK":"REVISAR")+'</td><td>'+t.nc+'</td></tr>';});
  return h+'</tbody></table></div></div>';}

/* Esquema ilustrativo de un pozo de captación */
function svgPozoGas_RS(D){
  var C=D.Cel,W=780,H=340,s='<svg viewBox="0 0 '+W+' '+H+'" class="rs-svg" font-family="system-ui,Segoe UI,Arial,sans-serif">'+celDefs_RS();
  var x0=60,x1=520,yT=118,alto=180,nv=Math.max(1,Math.min(6,Math.round(C.nv)||1));
  s+='<text x="'+(W/2)+'" y="24" font-size="13" font-weight="800" fill="#15803D" text-anchor="middle">POZO DE CAPTACIÓN DE BIOGÁS (ILUSTRATIVO)</text>';
  for(var i=0;i<nv;i++){var y=yT+alto-(i+1)*alto/nv;s+='<rect x="'+x0+'" y="'+y+'" width="'+(x1-x0)+'" height="'+(alto/nv)+'" fill="url(#rsRes)" stroke="#475569" stroke-width="0.8"/><rect x="'+x0+'" y="'+y+'" width="'+(x1-x0)+'" height="5" fill="'+(i===nv-1?'url(#rsFinal)':'url(#rsSuelo)')+'"/>';}
  var px=(x0+x1)/2;
  s+='<rect x="'+(px-26)+'" y="'+(yT+10)+'" width="52" height="'+(alto-10)+'" fill="#D6D3D1" stroke="#57534E"/>';
  for(var g=0;g<14;g++)s+='<circle cx="'+(px-18+(g%4)*12)+'" cy="'+(yT+24+Math.floor(g/4)*40)+'" r="4" fill="#A8A29E"/>';
  s+='<rect x="'+(px-8)+'" y="'+(yT-40)+'" width="16" height="'+(alto+30)+'" fill="#F8FAFC" stroke="#1F2937" stroke-width="1.5"/>';
  for(var k=0;k<8;k++)s+='<circle cx="'+px+'" cy="'+(yT+30+k*18)+'" r="2" fill="#1F2937"/>';
  s+='<path d="M'+px+' '+(yT-40)+' v-10 h180" fill="none" stroke="#1F2937" stroke-width="5"/>';
  s+='<path d="M'+(px+180)+' '+(yT-60)+' q 10 -20 0 -34 q 18 14 6 34 z" fill="#F97316"/><rect x="'+(px+174)+'" y="'+(yT-58)+'" width="12" height="40" fill="#64748B"/>';
  s+='<text x="'+(px+200)+'" y="'+(yT-30)+'" font-size="10.5" fill="#334155">Antorcha / aprovechamiento</text>';
  s+='<text x="'+(px+40)+'" y="'+(yT+60)+'" font-size="10.5" font-weight="600" fill="#334155" stroke="#fff" stroke-width="3" paint-order="stroke">Tubería perforada en filtro de grava</text>';
  s+=celCotaH_RS(px-D.Ga.sep/2*4,px+D.Ga.sep/2*4,yT+alto+28,"Separación entre pozos "+nf(D.Ga.sep,0)+" m (no a escala)");
  return rsUnico(s+'</svg>');}

/* ==========================================================
   3. VENTANA
   ========================================================== */
function pintarGases_RS(){
  var id="gases_RS",D=rsTodo();
  var h='<div class="titulo"><h1>RED DE GASES</h1><p>Estimación de la generación de metano y biogás, caudal de captación de diseño, número de pozos de extracción y dimensionamiento de los tramos de la red hasta la antorcha o el sistema de aprovechamiento.</p></div>'+CONV;
  if(!D.ok){gid("pane-"+id).innerHTML=h+rsFaltaProy();return;}
  var G=D.Ga,err=erroresGas_RS();
  h+='<div class="link-ok">Método: <b>'+G.met+'</b> · L<sub>0</sub> = <b>'+nf(G.L0,0)+' m³/t</b>'+(G.land?' · k = <b>'+nf(G.k,3)+' 1/año</b>':'')+' · f<sub>b</sub> = <b>'+nf(G.fb*100,0)+' %</b> · CH₄ = <b>'+nf(G.ch4*100,0)+' %</b> · Captación: <b>'+nf(G.ef*100,0)+' %</b></div>';
  var fal=faltaGas_RS();
  if(fal.length){gid("pane-"+id).innerHTML=h+rsFalta(fal,"terminos_referencia_RS","Ir a términos de referencia")+tablaTramosGas_RS(G)+rsAcciones(id,"revisionGas_RS()");return;}
  if(err.length){gid("pane-"+id).innerHTML=h+tablaTramosGas_RS(G)+'<div class="card"><div class="card-title">Parámetros de cálculo</div>'+rsAcciones(id,"revisionGas_RS()")+'</div>';return;}
  var z=G.filas[G.filas.length-1],pmax=G.filas.reduce(function(a,f){return Math.max(a,f.pozos);},0),fmax=G.filas.reduce(function(a,f){return f.Qd>a.Qd?f:a;});
  h+=rsKpis([
    {t:"Biogás de diseño máximo",v:rsF(G.Qmax,1),u:"m³/h",s:"Año "+fmax.anio},
    {t:"Metano "+z.anio,v:rsF(z.ch4,0),u:"m³ CH₄/año"},
    {t:"Pozos al final de la vida útil",v:nf(pmax,0),u:"pozos",s:"Por caudal "+z.pq+" · por área "+z.pa},
    {t:"Biogás captado acumulado",v:rsF(G.filas.reduce(function(a,f){return a+f.cap;},0)/1e6,2),u:"millones m³"}]);
  h+='<div class="card"><div class="card-title">Biogás de diseño por año</div>'+rsGrafico(G.filas.map(function(f){return f.anio;}),[{nombre:"Biogás de diseño (m³/h)",color:"#EA580C",valores:G.filas.map(function(f){return f.Qd;})}],{linea:true,uY:"m³/h"})+
    '<div class="svg-wrap">'+svgPozoGas_RS(D)+'</div></div>';
  h+=tablaTramosGas_RS(G);
  h+=rsTabla("gas_RS");
  var j=rsIdx(D,rsAnioMemo(D)),f=G.filas[j];
  h+='<div class="card"><div class="card-title">Parámetros de cálculo</div><div class="row">'+rsSelAnio(D)+'</div>'+rsAcciones(id,"revisionGas_RS()")+'</div>';
  var t='<table class="res-table"><thead><tr><th></th><th>VARIABLE</th><th>VALOR</th><th>UNIDAD</th></tr></thead><tbody>';
  t+=seccion("AÑO "+f.anio+" (N° "+f.t+")");
  t+=fila("Residuos dispuestos en el año (M)",f.M,"ton/año",1,"M = R<sub>t</sub> × 365","—","Producción a disponer.");
  if(G.land)t+=fila("Metano generado (Q<sub>CH₄</sub>)",f.ch4,"m³/año",0,"Q<sub>CH₄</sub> = Σ k·L0·f<sub>b</sub>·M<sub>i</sub>·e<sup>−k(t − i)</sup>","Σ desde "+D.anioIni+" hasta "+f.anio+" con k = "+nf(G.k,3)+", L0 = "+nf(G.L0,0)+", f<sub>b</sub> = "+nf(G.fb,2),"Modelo de primer orden: cada año de residuos genera metano que decae con el tiempo.");
  else t+=fila("Metano potencial (Q<sub>CH₄</sub>)",f.ch4,"m³/año",0,"Q<sub>CH₄</sub> = M·f<sub>b</sub>·L0",nf(f.M,1)+" × "+nf(G.fb,2)+" × "+nf(G.L0,0),"Potencial del residuo dispuesto en el año (método de la hoja de referencia, con ton/año).");
  t+=fila("Biogás generado",f.bio,"m³/año",0,"B = Q<sub>CH₄</sub> / %CH₄",nf(f.ch4,0)+" / "+nf(G.ch4,2));
  t+=fila("Biogás captado",f.cap,"m³/año",0,"B<sub>c</sub> = B × eficiencia",nf(f.bio,0)+" × "+nf(G.ef,2));
  t+=fila("Biogás de diseño (Q<sub>d</sub>)",f.Qd,"m³/h",2,"Q<sub>d</sub> = B<sub>c</sub> × f<sub>p</sub> / 8 760",nf(f.cap,0)+" × "+nf(G.fp,2)+" / 8 760","","","final");
  t+=fila("Pozos por caudal",f.pq,"und",0,"⌈Q<sub>d</sub> / q<sub>pozo</sub>⌉","⌈"+nf(f.Qd,2)+" / "+nf(G.qp,1)+"⌉");
  t+=fila("Pozos por área cubierta",f.pa,"und",0,"⌈A<sub>acum</sub> / s²⌉","⌈"+nf(D.Cel.filas[j].AreaAc*10000,0)+" / "+nf(G.sep,0)+"²⌉","Área acumulada de Celdas; s = separación entre pozos.");
  t+=fila("Pozos adoptados",f.pozos,"und",0,"máx(por caudal, por área)","máx("+f.pq+", "+f.pa+")","","","final");
  G.tramos.forEach(function(r){
    t+=seccion("TRAMO: "+esc(r.n).toUpperCase());
    t+=fila("Caudal del tramo",r.Q,"m³/h",2,"Q = Q<sub>d,máx</sub> × fracción",nf(G.Qmax,2)+" × "+nf(r.frac,2));
    t+=fila("Velocidad real",r.V,"m/s",2,"V = (Q/3600) / (πD²/4)","("+nf(r.Q,2)+"/3600) / (π × "+nf(r.D,3)+"² / 4)",r.okV?"Menor o igual que la velocidad objetivo ("+nf(r.vo,1)+" m/s).":"Supera la velocidad objetivo ("+nf(r.vo,1)+" m/s): aumentar diámetro.");
    t+=fila("Diámetro requerido",r.Dreq,"m",3,"D = √(4·Q / (π·V<sub>obj</sub>))","√(4 × "+nf(r.Qs,5)+" / (π × "+nf(r.vo,1)+"))","Comercial sugerido: "+nf(r.Dsug,3)+" m.");
    t+=fila("Puntos de condensado",r.nc,"und",0,"⌈L / separación máx.⌉","⌈"+nf(r.L,0)+" / "+nf(G.sc,0)+"⌉");});
  t+='</tbody></table>';
  h+='<div class="card"><div class="card-title">Memoria de cálculo</div>'+t+'</div>';
  h+=tablaHTML("Datos para dibujar el plano de la red de gases",["Dato para plano","Dónde obtenerlo","Unidad","Cómo usarlo en el plano"],[
    ["Coordenadas de pozos o drenes","Plano de celdas y topografía","m","Ubicar pozos y ramales de captación"],["Cota superior, fondo y profundidad de pozos","Perfil de llenado","m s.n.m.","Definir longitud filtrante y detalle del pozo"],
    ["Diámetro y material de tubería","Tabla de tramos","mm / tipo","Rotular ramales, colectores y uniones"],["Pendientes hacia condensados","Perfil topográfico","m/m","Dibujar puntos bajos y cajas de condensado"],
    ["Ubicación de soplador, antorcha o aprovechamiento","Implantación del relleno","coordenada","Cerrar la red hasta el tratamiento"]]);
  gid("pane-"+id).innerHTML=h;}

/* ==========================================================
   4. REVISIÓN, AVISOS Y RECALCULAR
   ========================================================== */
function revisionGas_RS(){abrirRevision("Red de gases",erroresGas_RS().concat(trAvisosGas_RS(),avisosResGas_RS()));}

/* ==========================================================
   5. REGISTRO DEL MÓDULO
   ========================================================== */
MODULOS.push({
  id:"gases_RS",
  titulo:"Red de gases",
  descripcion:"Generación de biogás, pozos de captación y dimensionamiento de la red de gases.",
  grupo:"relleno", orden:11, icono:"gas_RS",
  iconoSvg:"<path d=\"M8 20c-2-2-2-5 0-7s2-5 0-7M14 20c-2-2-2-5 0-7s2-5 0-7M20 20c-2-2-2-5 0-7\"/>",
  valores:{rsTramosGas:TRAMOS_GAS_DEF_RS},
  indicador:true, imprimible:true,
  normalizar:function(PRO){if(!Array.isArray(PRO.rsTramosGas))PRO.rsTramosGas=JSON.parse(JSON.stringify(TRAMOS_GAS_DEF_RS));},
  completo:function(PRO){return rsSerie().length>0&&erroresGas_RS().length===0;},
  pintar:pintarGases_RS,
  recalcular:function(){rsRecalcular(pintarGases_RS,function(){return faltaGas_RS().length?[]:erroresTramosGas_RS().concat(avisosResGas_RS());},"Red de gases");},
  errores:erroresGas_RS
});
