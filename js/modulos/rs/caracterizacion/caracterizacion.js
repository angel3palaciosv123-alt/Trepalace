/* ==========================================================
   RS · CARACTERIZACIÓN  (caracterizacion.js)
   Tamaño de muestra, viviendas a muestrear, composición por residuo con su
   clasificación, peso unitario y humedad ponderados.
   Hoja de referencia: CARACTERIZACIÓN. Cálculos en motor_rs.js (rsCaracterizacion).
   ========================================================== */

/* ==========================================================
   1. VALIDACIÓN
   ========================================================== */
function erroresCarac_RS(){
  var e=[],R=PRO.rsResiduos||[];
  if(!R.length)e.push("La tabla de residuos está vacía: agrega al menos un residuo.");
  var s=R.reduce(function(a,r){return a+(Number(r.pct)||0);},0);
  if(R.length&&Math.abs(s-100)>0.01)e.push("La representatividad de los residuos suma "+nf(s,2)+" %. Debe sumar 100 %.");
  R.forEach(function(r,i){
    var nom=r.n||("Fila "+(i+1));
    if(typeof r.pct!=="number"||!(r.pct>=0))e.push(nom+": la representatividad debe ser un número mayor o igual que cero.");
    if(typeof r.rho!=="number"||!(r.rho>0))e.push(nom+": el peso unitario debe ser un número mayor que cero.");
    if(typeof r.hum!=="number"||!(r.hum>=0&&r.hum<100))e.push(nom+": la humedad debe ser un número entre 0 y 100 %.");});
  return e.concat(faltaCarac_RS());}
function faltaCarac_RS(){
  var e=[];
  if(!esPos(PRO.rsPesoMuestra))e.push("Falta el peso total de la muestra (Términos de referencia).");
  if(!DP_RS.zAlfa(PRO.rsConfianza)||!esPos(PRO.rsError)||!esPos(PRO.rsP)||!(Number(PRO.rsP)<1))e.push("Faltan o no son válidos el nivel de confianza, el error aceptado o la probabilidad p (Términos de referencia).");
  if(!esPos(PRO.rsPersonas)||!esPos(PRO.rsHabViv)||!esPos(PRO.rsDiasMuestreo))e.push("Faltan las personas asumidas, los habitantes por vivienda o los días de muestreo (Términos de referencia).");
  return e;}

/* ==========================================================
   2. TABLA EDITABLE DE RESIDUOS
   ========================================================== */
function tablaResiduos_RS(){
  var R=PRO.rsResiduos||[],s=R.reduce(function(a,r){return a+(Number(r.pct)||0);},0);
  var h='<div class="card"><div class="card-title">Composición física y clasificación de los residuos</div>'+
    '<div class="card-sub">Porcentaje en peso (representatividad) de cada tipo de residuo en la muestra, clasificación según aprovechamiento, composición y peligrosidad, peso unitario (kg/m³) y contenido de humedad (% en peso). Los valores por defecto se pueden modificar; el peso unitario típico corresponde a la tabla RAS F.1.5.</div>'+
    '<div class="rs-tscroll libre"><table class="rs-table rs-edit"><thead><tr><th>#</th><th class="izq">Tipo de residuo</th><th>Representatividad<small>(%)</small></th><th>Aprovechable</th><th>Orgánico</th><th>Peligroso</th><th>Peso unitario<small>(kg/m³)</small></th><th>Humedad<small>(%)</small></th></tr></thead><tbody>';
  R.forEach(function(r,i){
    h+='<tr><td>'+(i+1)+'</td><td class="izq">'+rsInp("rsResiduos",i,"n",r.n,{text:true,cls:"txt"})+'</td><td>'+rsInp("rsResiduos",i,"pct",r.pct)+'</td>'+
      '<td>'+rsChk("rsResiduos",i,"ap",r.ap)+'</td><td>'+rsChk("rsResiduos",i,"org",r.org)+'</td><td>'+rsChk("rsResiduos",i,"pel",r.pel)+'</td>'+
      '<td>'+rsInp("rsResiduos",i,"rho",r.rho)+'</td><td>'+rsInp("rsResiduos",i,"hum",r.hum)+'</td></tr>';});
  h+='<tr class="rs-tot"><td></td><td class="izq">Total</td><td>'+nf(s,2)+' %</td><td colspan="5"></td></tr>';
  h+='</tbody></table></div><div class="rs-bar-acc">'+
    '<button type="button" class="btn-sec" onclick="rsAgregarFila(\'rsResiduos\',{n:\'Nuevo residuo\',pct:0,ap:0,org:0,pel:0,rho:\'\',hum:\'\',mc:0,mm:0,ml:0})">+ Agregar residuo</button>'+
    '<button type="button" class="btn-sec" onclick="rsEliminarFilas(\'rsResiduos\',\'Eliminar residuos\',\'Marque los residuos que desea eliminar de la caracterización. También se eliminan sus metas de aprovechamiento.\')">Eliminar residuo</button>'+
    '<button type="button" class="btn-sec" onclick="tipicosF15_RS()">Usar peso unitario y humedad típicos (F.1.5)</button></div></div>';
  return h;}

/* Rellena peso unitario y humedad con los valores típicos de la tabla F.1.5 (por nombre) */
function tipicosF15_RS(){
  var c=0;(PRO.rsResiduos||[]).forEach(function(r){var t=DP_RS.tipico(r.n);if(t){r.rho=t.rho;r.hum=t.hum;c++;}});
  guardarPro();autoEjecutar();uiToast(c+" residuos actualizados con la tabla F.1.5");}

/* ==========================================================
   3. VENTANA
   ========================================================== */
function pintarCaracterizacion_RS(){
  var id="caracterizacion_RS",D=rsTodo();
  var h='<div class="titulo"><h1>CARACTERIZACIÓN DE LOS RESIDUOS</h1><p>Determinación del tamaño de la muestra, número de viviendas a muestrear y composición física de los residuos sólidos según el RAS, Título F (tablas F.1.3 a F.1.5).</p></div>'+CONV;
  if(!D.ok){gid("pane-"+id).innerHTML=h+rsFaltaProy()+tablaResiduos_RS();return;}
  var C=D.C,err=erroresCarac_RS();
  var fal=faltaCarac_RS();
  if(err.length){gid("pane-"+id).innerHTML=h+(fal.length?rsFalta(fal,"terminos_referencia_RS","Ir a términos de referencia"):"")+tablaResiduos_RS()+'<div class="card"><div class="card-title">Parámetros de cálculo</div>'+rsAcciones(id,"revisionCarac_RS()")+'</div>';return;}
  h+='<div class="link-ok">Población del año de estudio <b>'+C.anioE+'</b>: <b>'+nf(C.N,0)+' hab</b> · Origen: '+rsOrigenPobTxt()+' · Nivel de complejidad: <b>'+D.nivel+'</b></div>';
  h+=rsKpis([
    {t:"Tamaño de la muestra",v:nf(C.n,0),u:"personas",s:"Entre "+nf(C.nmin,0)+" y "+nf(C.nmax,0)},
    {t:"Viviendas a muestrear",v:nf(C.viv,0),u:"viviendas",s:"Entre "+nf(C.vmin,0)+" y "+nf(C.vmax,0)},
    {t:"Peso unitario ponderado",v:rsF(C.rhoP,1),u:"kg/m³"},
    {t:"Humedad ponderada",v:rsF(C.humP*100,1),u:"%"},
    {t:"Representatividad total",v:nf(C.sPct,1),u:"%"}]);
  h+=tablaResiduos_RS();

  /* Resultados por residuo */
  var fl=C.filas;
  var t='<div class="card"><div class="card-title">Pesos de la muestra por residuo</div><div class="card-sub">Peso bruto = peso de la muestra × % / 100 · contenido de humedad = peso bruto × humedad / 100 · peso neto = peso bruto − contenido de humedad.</div>'+
    '<div class="rs-tscroll alto"><table class="rs-table"><thead><tr><th class="izq">Tipo de residuo</th><th>Clasificación</th><th>Peso bruto<small>(kg)</small></th><th>Humedad<small>(kg)</small></th><th>Peso neto<small>(kg)</small></th><th>Representatividad<small>(%)</small></th><th class="izq">Composición</th></tr></thead><tbody>';
  var mx=Math.max.apply(null,fl.map(function(f){return f.pct;}).concat([1]));
  fl.forEach(function(f){
    t+='<tr><td class="izq">'+esc(f.n)+'</td><td>'+(f.ap?'<span class="rs-tag ap">Aprov.</span>':'<span class="rs-tag no">No aprov.</span>')+(f.org?'<span class="rs-tag org">Org.</span>':'<span class="rs-tag ino">Inorg.</span>')+(f.pel?'<span class="rs-tag pel">Pelig.</span>':'')+'</td>'+
       '<td>'+rsF(f.bruto,2)+'</td><td>'+rsF(f.humKg,2)+'</td><td>'+rsF(f.neto,2)+'</td><td>'+rsF(C.sBruto>0?f.bruto/C.sBruto*100:NaN,2)+'</td>'+
       '<td class="izq"><div class="rs-hbar"><i style="width:'+(f.pct/mx*100).toFixed(1)+'%"></i></div></td></tr>';});
  t+='<tr class="rs-tot"><td class="izq">Total</td><td></td><td>'+rsF(C.sBruto,2)+'</td><td>'+rsF(C.sHum,2)+'</td><td>'+rsF(C.sNeto,2)+'</td><td>'+rsF(C.sBruto>0?100:NaN,2)+'</td><td class="izq">'+(Math.abs(C.sBruto-C.Pm)<0.01?rsChip("CORRECTO")+' Σ pesos = peso de la muestra':rsChip("REVISAR")+' rectificar valores')+'</td></tr></tbody></table></div></div>';
  var cl=C.clas,pc=function(v){return C.sBruto>0?rsF(v/C.sBruto*100,2):"—";};
  t+='<div class="card"><div class="card-title">Clasificación de la muestra</div><div class="rs-clas">'+
    [["Según su aprovechamiento","Aprovechable",cl.ap,"No aprovechable",cl.noap],["Según su composición","Orgánico",cl.org,"Inorgánico",cl.inorg],["Según su peligrosidad","Peligroso",cl.pel,"No peligroso",cl.nopel]].map(function(g){
      var p1=C.sBruto>0?g[2]/C.sBruto*100:0;
      return '<div class="rs-clas-c"><div class="h">'+g[0]+'</div><div class="rs-split"><i style="width:'+p1.toFixed(1)+'%"></i></div>'+
        '<div class="r"><span><b>'+g[1]+'</b> '+rsF(g[2],2)+' kg · '+pc(g[2])+' %</span><span><b>'+g[3]+'</b> '+rsF(g[4],2)+' kg · '+pc(g[4])+' %</span></div></div>';}).join("")+'</div></div>';
  h+=t;

  /* Memoria */
  h+='<div class="card"><div class="card-title">Parámetros de cálculo</div><div class="card-sub">Haz clic en cualquier fila para ver la fórmula, el reemplazo numérico y el origen del dato.</div>'+rsAcciones(id,"revisionCarac_RS()")+'</div>';
  if(!err.length){
    var m='<table class="res-table"><thead><tr><th></th><th>VARIABLE</th><th>VALOR</th><th>UNIDAD</th></tr></thead><tbody>';
    m+=seccion("1. TAMAÑO DE LA MUESTRA");
    m+=fila("Tamaño de la población del servicio (N)",C.N,"hab",0,"N = P<sub>"+C.anioE+"</sub>",rsOrigenPobTxt(),"Importada de Proyección poblacional.");
    m+=filaDato("Nivel de confianza",C.nc,"%",1,"Términos de referencia.");
    m+=fila("Coeficiente de confianza (Zα)",C.Z,"",3,"Tabla de niveles de confianza","NC = "+nf(C.nc,1)+" % → Zα = "+nf(C.Z,3),"Datos preliminares.");
    m+=filaDato("Error aceptado (e)",C.e,"",3,"Términos de referencia.");
    m+=filaDato("Probabilidad de éxito (p)",C.p,"",2,"Términos de referencia.");
    m+=fila("Probabilidad de fracaso (q)",C.q,"",2,"q = 1 − p","1 − "+nf(C.p,2));
    m+=fila("Tamaño de la muestra (n)",C.n,"personas",0,"n = N·Zα²·p·q / [e²·(N − 1) + Zα²·p·q]",nf(C.N,0)+" × "+nf(C.Z,3)+"² × "+nf(C.p,2)+" × "+nf(C.q,2)+" / ["+nf(C.e,3)+"² × ("+nf(C.N,0)+" − 1) + "+nf(C.Z,3)+"² × "+nf(C.p,2)+" × "+nf(C.q,2)+"]","Se redondea hacia abajo.","","final");
    m+=fila("Muestra mínima (n<sub>mín</sub>)",C.nmin,"personas",0,"n<sub>mín</sub> = n − n·e",nf(C.n,0)+" − "+nf(C.n,0)+" × "+nf(C.e,3));
    m+=fila("Muestra máxima (n<sub>máx</sub>)",C.nmax,"personas",0,"n<sub>máx</sub> = n + n·e",nf(C.n,0)+" + "+nf(C.n,0)+" × "+nf(C.e,3));
    m+=seccion("2. VIVIENDAS A MUESTREAR");
    m+=filaDato("Personas asumidas para el estudio",C.pers,"personas",0,"Términos de referencia.");
    m+=filaDato("Habitantes por vivienda",C.hv,"hab/viv",1,"Términos de referencia.");
    m+=fila("Viviendas a muestrear",C.viv,"viviendas",0,"V = ⌈personas / hab por vivienda⌉","⌈"+nf(C.pers,0)+" / "+nf(C.hv,1)+"⌉","","","final");
    m+=fila("Viviendas mínimas",C.vmin,"viviendas",0,"V<sub>mín</sub> = V − V·e",nf(C.viv,0)+" − "+nf(C.viv,0)+" × "+nf(C.e,3));
    m+=fila("Viviendas máximas",C.vmax,"viviendas",0,"V<sub>máx</sub> = V + V·e",nf(C.viv,0)+" + "+nf(C.viv,0)+" × "+nf(C.e,3));
    m+=seccion("3. MUESTRA");
    m+=filaDato("Peso total de la muestra (P<sub>m</sub>)",C.Pm,"kg",2,"Términos de referencia (dato de campo).");
    m+=fila("Peso unitario ponderado (ρ)",C.rhoP,"kg/m³",2,"ρ = Σ(%<sub>i</sub>·ρ<sub>i</sub>) / Σ%<sub>i</sub>","Σ(% × ρ) / "+nf(C.sPct,2),"Peso unitario de cada residuo: tabla de composición.");
    m+=fila("Volumen total de la muestra",C.Vm,"m³",3,"V<sub>m</sub> = P<sub>m</sub> / ρ",nf(C.Pm,2)+" / "+nf(C.rhoP,2));
    m+=fila("Densidad relativa de la muestra",C.Pm/C.Vm,"kg/m³",2,"ρ<sub>m</sub> = P<sub>m</sub> / V<sub>m</sub>",nf(C.Pm,2)+" / "+nf(C.Vm,3));
    m+=fila("Humedad ponderada (w)",C.humP*100,"%",2,"w = Σ humedad<sub>i</sub> / Σ peso bruto<sub>i</sub>",nf(C.sHum,2)+" / "+nf(C.sBruto,2)+" × 100","Se usa para estimar el lixiviado por humedad del residuo.");
    m+=seccion("4. PPC DE LA MUESTRA (REFERENCIA)");
    m+=fila("Habitantes muestreados",C.habM,"hab",0,"H = viviendas × hab por vivienda",nf(C.viv,0)+" × "+nf(C.hv,1));
    m+=filaDato("Días de muestreo",C.dias,"días",0,"Términos de referencia.");
    m+=fila("PPC de la muestra",C.ppcMuestra,"kg/hab·día",3,"PPC<sub>m</sub> = P<sub>m</sub> / (H × días)",nf(C.Pm,2)+" / ("+nf(C.habM,0)+" × "+nf(C.dias,0)+")","Solo de referencia: la PPC de diseño la ingresa el diseñador en Términos de referencia ("+nf(rsN("rsPPC"),2)+" kg/hab·día).");
    m+='</tbody></table>';
    h+='<div class="card"><div class="card-title">Memoria de cálculo</div>'+m+'</div>';}
  gid("pane-"+id).innerHTML=h;}

/* ==========================================================
   4. REVISIÓN, AVISOS Y RECALCULAR
   ========================================================== */
function revisionCarac_RS(){abrirRevision("Caracterización",erroresCarac_RS());}
function recalcularCarac_RS(){rsRecalcular(pintarCaracterizacion_RS,function(){var f=faltaCarac_RS();return erroresCarac_RS().filter(function(x){return f.indexOf(x)<0;});},"Caracterización");}

/* ==========================================================
   5. REGISTRO DEL MÓDULO
   ========================================================== */
registrarMemoria({ins:["Personas asumidas para el estudio","Habitantes por vivienda","Días de muestreo"]});

MODULOS.push({
  id:"caracterizacion_RS",
  titulo:"Caracterización",
  descripcion:"Tamaño de muestra, viviendas a muestrear, composición física y clasificación de los residuos.",
  grupo:"residuos", orden:4, icono:"car_RS",
  iconoSvg:"<path d=\"M9 3h6M10 3v5l-5 9a2 2 0 0 0 1.8 3h10.4a2 2 0 0 0 1.8-3l-5-9V3\"/><path d=\"M7.5 14h9\"/>",
  valores:{rsResiduos:RESIDUOS_DEF_RS},
  indicador:true, imprimible:true,
  normalizar:function(PRO){if(!Array.isArray(PRO.rsResiduos))PRO.rsResiduos=JSON.parse(JSON.stringify(RESIDUOS_DEF_RS));},
  completo:function(PRO){return rsSerie().length>0&&erroresCarac_RS().length===0;},
  pintar:pintarCaracterizacion_RS,
  recalcular:recalcularCarac_RS,
  errores:erroresCarac_RS
});
