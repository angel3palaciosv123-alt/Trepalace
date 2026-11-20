/* ==========================================================
   RS · RED DE LIXIVIADOS  (lixiviados.js)
   Caudal de lixiviados por año y dimensionamiento hidráulico de los tramos
   (Manning a tubo lleno). Hoja de referencia: RED LIXIVIADOS.
   ========================================================== */

/* ==========================================================
   1. VALIDACIÓN
   ========================================================== */
function faltaLix_RS(){
  var e=[];
  ["rsProdEsp","rsFpLix","rsN","rsVmin","rsVmax","rsDmin","rsSmin"].forEach(function(k){if(!esPos(PRO[k]))e.push("Falta un valor válido de "+{rsProdEsp:"producción específica",rsFpLix:"factor de punta",rsN:"rugosidad de Manning",rsVmin:"velocidad mínima",rsVmax:"velocidad máxima",rsDmin:"diámetro mínimo",rsSmin:"pendiente mínima"}[k]+" (Términos de referencia).");});
  return e.concat(erroresProd_RS().length?["La producción a disponer tiene datos por completar."]:[]);}
function erroresTramosLix_RS(){
  var e=[],T=PRO.rsTramosLix||[];
  if(!T.length)e.push("La red no tiene tramos: agregue al menos uno.");
  T.forEach(function(t,i){var n=t.n||("Tramo "+(i+1));
    if(typeof t.frac!=="number"||!(t.frac>0&&t.frac<=1))e.push(n+": la fracción del caudal debe ser un número entre 0 y 1.");
    if(typeof t.L!=="number"||!(t.L>0))e.push(n+": falta la longitud (número mayor que cero).");
    if(typeof t.S!=="number"||!(t.S>0))e.push(n+": falta la pendiente (número mayor que cero).");
    if(typeof t.D!=="number"||!(t.D>0))e.push(n+": falta el diámetro adoptado (número mayor que cero).");});
  return e;}
function erroresLix_RS(){return faltaLix_RS().concat(erroresTramosLix_RS());}
function avisosResLix_RS(){
  var e=[],D=rsTodo();
  if(erroresLix_RS().length||!D.ok)return e;
  D.X.tramos.forEach(function(t){
    if(!t.okQ)e.push(t.n+": la capacidad a tubo lleno ("+nf(t.Qll,5)+" m³/s) es menor que el caudal ("+nf(t.Q,5)+" m³/s). Diámetro sugerido: "+nf(t.Dsug,3)+" m.");
    if(!t.okD)e.push(t.n+": el diámetro ("+nf(t.D,3)+" m) es menor que el mínimo ("+nf(rsN("rsDmin"),3)+" m).");
    if(!t.okS)e.push(t.n+": la pendiente ("+nf(t.S,4)+") es menor que la mínima ("+nf(rsN("rsSmin"),4)+").");
    if(!t.okV)e.push(t.n+": la velocidad a tubo lleno ("+nf(t.V,2)+" m/s) está fuera del rango "+nf(rsN("rsVmin"),2)+" – "+nf(rsN("rsVmax"),2)+" m/s.");});
  return e;}

RS_TABLAS.lix_RS=function(){
  var D=rsTodo();if(!D.ok)return null;
  return {titulo:"Caudal de lixiviados por año",sub:"Q medio = residuos dispuestos × producción específica · Q diseño = Q medio × factor de punta. Se presenta además el lixiviado aportado por el contenido de humedad del residuo dispuesto.",
    columnas:[{k:"anio",t:"Año",fmt:function(v){return String(v);}},{k:"Td",t:"RS al relleno",u:"ton/día",d:3},{k:"Qm",t:"Q medio",u:"m³/día",d:3},{k:"Qd",t:"Q diseño",u:"m³/día",d:3,tot:"max"},{k:"Qds",t:"Q diseño",u:"m³/s",d:5,tot:"max"},{k:"QmA",t:"Volumen anual",u:"m³/año",d:1,tot:"sum"},{k:"Qhum",t:"Lixiviado por humedad",u:"m³/día",d:3}],
    csv:"Lixiviados_RS",filas:D.X.filas.map(function(f){return Object.assign({},f,{QmA:f.Qm*365});})};};

/* ==========================================================
   2. TABLAS DE TRAMOS Y ESQUEMA DE LA RED
   ========================================================== */
function tablaTramosLix_RS(X){
  var T=PRO.rsTramosLix||[];
  var h='<div class="card"><div class="card-title">Tramos de la red</div><div class="card-sub">Fracción del caudal de diseño máximo del período que conduce cada tramo, longitud, pendiente y diámetro adoptado. Q<sub>máx</sub> del período = <b>'+rsF(X.Qmax,5)+' m³/s</b>.</div>'+
    '<div class="rs-tscroll"><table class="rs-table rs-edit"><thead><tr><th class="izq">Tramo</th><th>Fracción de Q</th><th>Longitud<small>(m)</small></th><th>Pendiente<small>(m/m)</small></th><th>Diámetro adoptado<small>(m)</small></th></tr></thead><tbody>';
  T.forEach(function(t,i){h+='<tr><td class="izq">'+rsInp("rsTramosLix",i,"n",t.n,{text:true,cls:"txt"})+'</td><td>'+rsInp("rsTramosLix",i,"frac",t.frac)+'</td><td>'+rsInp("rsTramosLix",i,"L",t.L)+'</td><td>'+rsInp("rsTramosLix",i,"S",t.S)+'</td><td>'+rsInp("rsTramosLix",i,"D",t.D)+'</td></tr>';});
  return h+'</tbody></table></div><div class="rs-bar-acc"><button type="button" class="btn-sec" onclick="rsAgregarFila(\'rsTramosLix\',{n:\'Nuevo tramo\',frac:\'\',L:\'\',S:\'\',D:\'\'})">+ Agregar tramo</button>'+
    '<button type="button" class="btn-sec" onclick="rsEliminarFilas(\'rsTramosLix\',\'Eliminar tramos\',\'Marque los tramos que desea eliminar de la red de lixiviados.\')">Eliminar tramo</button></div></div>';}

function tablaResTramosLix_RS(X){
  var h='<div class="card"><div class="card-title">Dimensionamiento hidráulico de los tramos</div><div class="card-sub">Manning a tubo lleno: Q<sub>ll</sub> = (1/n)·A·R<sup>2/3</sup>·S<sup>1/2</sup>, A = πD²/4, R = D/4. Velocidad a tubo lleno entre '+nf(X.vmin,2)+' y '+nf(X.vmax,2)+' m/s.</div>'+
    '<div class="rs-tscroll"><table class="rs-table"><thead><tr><th class="izq">Tramo</th><th>Q diseño<small>(m³/s)</small></th><th>D<small>(m)</small></th><th>Área<small>(m²)</small></th><th>R<small>(m)</small></th><th>Q lleno<small>(m³/s)</small></th><th>V lleno<small>(m/s)</small></th><th>Q/Q<sub>ll</sub></th><th>Capacidad</th><th>Velocidad</th><th>D sugerido<small>(m)</small></th></tr></thead><tbody>';
  X.tramos.forEach(function(t){
    h+='<tr><td class="izq">'+esc(t.n)+'</td><td>'+rsF(t.Q,5)+'</td><td>'+rsF(t.D,3)+'</td><td>'+rsF(t.A,5)+'</td><td>'+rsF(t.R,4)+'</td><td>'+rsF(t.Qll,5)+'</td><td>'+rsF(t.V,3)+'</td><td>'+rsF(t.rel,3)+'</td>'+
      '<td>'+rsChip(t.okQ?"OK":"AUMENTAR Ø")+'</td><td>'+rsChip(t.okV?"OK":"REVISAR")+'</td><td>'+rsF(t.Dsug,3)+(t.Dsug>t.D+1e-9?' '+rsChip("REVISAR"):'')+'</td></tr>';});
  return h+'</tbody></table></div></div>';}

/* Esquema de la red (ilustrativo): drenes en espina de pescado → colector → piscina */
function svgRedLix_RS(X){
  var T=X.tramos,W=780,H=260,s='<svg viewBox="0 0 '+W+' '+H+'" class="rs-svg" font-family="system-ui,Segoe UI,Arial,sans-serif">'+celDefs_RS();
  s+='<text x="'+(W/2)+'" y="22" font-size="13" font-weight="800" fill="#15803D" text-anchor="middle">ESQUEMA DE LA RED DE LIXIVIADOS (ILUSTRATIVO)</text>';
  s+='<rect x="40" y="45" width="430" height="180" rx="8" fill="url(#rsRes)" opacity=".35" stroke="#64748B" stroke-dasharray="6 4"/>';
  s+='<text x="255" y="62" font-size="10.5" fill="#334155" text-anchor="middle">Fondo de la trinchera</text>';
  s+='<line x1="60" y1="135" x2="470" y2="135" stroke="#1D4ED8" stroke-width="6" stroke-linecap="round"/>';
  for(var i=0;i<6;i++){var x=90+i*65;s+='<line x1="'+x+'" y1="80" x2="'+(x+30)+'" y2="135" stroke="#3B82F6" stroke-width="3" stroke-dasharray="2 3"/><line x1="'+x+'" y1="190" x2="'+(x+30)+'" y2="135" stroke="#3B82F6" stroke-width="3" stroke-dasharray="2 3"/>';}
  s+='<line x1="470" y1="135" x2="610" y2="135" stroke="#1E3A8A" stroke-width="7" stroke-linecap="round"/><polygon points="612,127 626,135 612,143" fill="#1E3A8A"/>';
  s+='<path d="M630 105 h120 l-14 70 h-92 z" fill="#BFDBFE" stroke="#1E3A8A" stroke-width="2"/><path d="M638 120 h104" stroke="#2563EB" stroke-width="2"/>';
  s+='<text x="690" y="198" font-size="11" font-weight="700" fill="#1E3A8A" text-anchor="middle">Piscina</text>';
  var lab=function(x,y,t){return t?'<text x="'+x+'" y="'+y+'" font-size="10.5" font-weight="700" fill="#1E3A8A" text-anchor="middle" stroke="#fff" stroke-width="3" paint-order="stroke">'+esc(t.n)+' Ø '+nf(t.D*1000,0)+' mm</text>':'';};
  s+=lab(160,98,T[0])+lab(330,128,T[2]||T[1])+lab(540,124,T[T.length-1])+(T[1]&&T.length>2?lab(330,154,T[1]):'');
  return rsUnico(s+'</svg>');}

/* ==========================================================
   3. VENTANA
   ========================================================== */
function pintarLixiviados_RS(){
  var id="lixiviados_RS",D=rsTodo();
  var h='<div class="titulo"><h1>RED DE LIXIVIADOS</h1><p>Estimación del caudal de lixiviados durante la vida útil y dimensionamiento hidráulico de drenes y colectores por la ecuación de Manning a tubo lleno.</p></div>'+CONV;
  if(!D.ok){gid("pane-"+id).innerHTML=h+rsFaltaProy();return;}
  var X=D.X,err=erroresLix_RS(),fal=faltaLix_RS();
  if(fal.length){gid("pane-"+id).innerHTML=h+rsFalta(fal,"terminos_referencia_RS","Ir a términos de referencia")+tablaTramosLix_RS(X)+rsAcciones(id,"revisionLix_RS()");return;}
  h+='<div class="link-ok">Producción específica <b>'+nf(X.pe,2)+' m³/t</b> · Factor de punta <b>'+nf(X.fp,1)+'</b> · n = <b>'+nf(X.n,3)+'</b></div>';
  h+=tablaTramosLix_RS(X);
  if(err.length){gid("pane-"+id).innerHTML=h+'<div class="card"><div class="card-title">Parámetros de cálculo</div>'+rsAcciones(id,"revisionLix_RS()")+'</div>';return;}
  var z=X.filas[X.filas.length-1],okT=X.tramos.every(function(t){return t.okQ&&t.okV;});
  h+=rsKpis([
    {t:"Q medio "+z.anio,v:rsF(z.Qm,2),u:"m³/día"},
    {t:"Q diseño máximo",v:rsF(X.Qmax*1000,2),u:"L/s",s:rsF(X.Qmax,5)+" m³/s"},
    {t:"Tramos",v:X.tramos.filter(function(t){return t.okQ&&t.okV;}).length+" de "+X.tramos.length,u:"cumplen",est:okT?"ok":"err"},
    {t:"Lixiviado por humedad "+z.anio,v:rsF(z.Qhum,2),u:"m³/día",s:"Referencia"}]);
  h+=tablaResTramosLix_RS(X);
  h+='<div class="card"><div class="card-title">Esquema y caudal de diseño</div><div class="svg-wrap">'+svgRedLix_RS(X)+'</div>'+
    rsGrafico(X.filas.map(function(f){return f.anio;}),[{nombre:"Q diseño (m³/día)",color:"#2563EB",valores:X.filas.map(function(f){return f.Qd;})},{nombre:"Q medio (m³/día)",color:"#93C5FD",valores:X.filas.map(function(f){return f.Qm;})}],{linea:true,uY:"m³/día"})+'</div>';
  h+=rsTabla("lix_RS");
  var j=rsIdx(D,rsAnioMemo(D)),f=X.filas[j];
  h+='<div class="card"><div class="card-title">Parámetros de cálculo</div><div class="row">'+rsSelAnio(D)+'</div>'+rsAcciones(id,"revisionLix_RS()")+'</div>';
  var t='<table class="res-table"><thead><tr><th></th><th>VARIABLE</th><th>VALOR</th><th>UNIDAD</th></tr></thead><tbody>';
  t+=seccion("1. CAUDAL — AÑO "+f.anio);
  t+=fila("Residuos al relleno (R<sub>t</sub>)",f.Td,"ton/día",3,"Producción a disponer","—");
  t+=filaDato("Producción específica (p<sub>e</sub>)",X.pe,"m³/t",2,"Términos de referencia.");
  t+=fila("Caudal medio (Q<sub>m</sub>)",f.Qm,"m³/día",3,"Q<sub>m</sub> = R<sub>t</sub> × p<sub>e</sub>",nf(f.Td,3)+" × "+nf(X.pe,2));
  t+=filaDato("Factor de punta (f<sub>p</sub>)",X.fp,"",2,"Términos de referencia.");
  t+=fila("Caudal de diseño (Q<sub>d</sub>)",f.Qd,"m³/día",3,"Q<sub>d</sub> = Q<sub>m</sub> × f<sub>p</sub>",nf(f.Qm,3)+" × "+nf(X.fp,2),"","","final");
  t+=fila("Caudal de diseño",f.Qds,"m³/s",6,"Q<sub>d</sub> / 86 400",nf(f.Qd,3)+" / 86 400");
  t+=fila("Caudal máximo del período (Q<sub>máx</sub>)",X.Qmax,"m³/s",6,"máx(Q<sub>d</sub>)","Año "+X.filas.reduce(function(a,x){return x.Qds>a.Qds?x:a;}).anio,"Con este caudal se diseñan los tramos.","","final");
  X.tramos.forEach(function(r,k){
    t+=seccion((k+2)+". TRAMO: "+esc(r.n).toUpperCase());
    t+=fila("Caudal del tramo",r.Q,"m³/s",6,"Q = Q<sub>máx</sub> × fracción",nf(X.Qmax,6)+" × "+nf(r.frac,2));
    t+=fila("Área a tubo lleno",r.A,"m²",5,"A = π·D² / 4","π × "+nf(r.D,3)+"² / 4");
    t+=fila("Radio hidráulico",r.R,"m",4,"R = D / 4",nf(r.D,3)+" / 4");
    t+=fila("Capacidad a tubo lleno (Q<sub>ll</sub>)",r.Qll,"m³/s",5,"Q<sub>ll</sub> = (1/n)·A·R<sup>2/3</sup>·S<sup>1/2</sup>","(1/"+nf(X.n,3)+") × "+nf(r.A,5)+" × "+nf(r.R,4)+"<sup>2/3</sup> × "+nf(r.S,4)+"<sup>1/2</sup>",r.okQ?"Cumple: Q<sub>ll</sub> ≥ Q.":"No cumple: aumentar el diámetro.","","final");
    t+=fila("Velocidad a tubo lleno",r.V,"m/s",3,"V = Q<sub>ll</sub> / A",nf(r.Qll,5)+" / "+nf(r.A,5),r.okV?"Entre "+nf(X.vmin,2)+" y "+nf(X.vmax,2)+" m/s.":"Fuera del rango "+nf(X.vmin,2)+" – "+nf(X.vmax,2)+" m/s.");
    t+=fila("Diámetro requerido",r.Dreq,"m",3,"D = [Q·n / (0,3117·S<sup>1/2</sup>)]<sup>3/8</sup>","["+nf(r.Q,6)+" × "+nf(X.n,3)+" / (0,3117 × "+nf(r.S,4)+"<sup>1/2</sup>)]<sup>3/8</sup>","Se sugiere el comercial ≥ máx(D requerido, D mínimo) = "+nf(r.Dsug,3)+" m.");});
  t+='</tbody></table>';
  h+='<div class="card"><div class="card-title">Memoria de cálculo</div>'+t+'</div>';
  h+=tablaHTML("Datos para dibujar el plano de la red de lixiviados",["Dato para plano","Dónde obtenerlo","Unidad","Cómo usarlo en el plano"],[
    ["Coordenada inicial y final de cada tramo","Levantamiento topográfico","m","Dibujar el eje de cada dren y colector"],["Cota de batea en cada estructura","Perfil topográfico","m s.n.m.","Obtener pendientes y perfil longitudinal"],
    ["Diámetro, material y perforación","Tabla de tramos","mm / tipo","Rotular cada tramo y diferenciar el dren perforado"],["Celdas, cunetas y puntos de descarga","Plano de llenado","m","Definir áreas tributarias y sentido de flujo"],
    ["Cámaras, sumideros y bombeo","Diseño hidráulico","coordenada","Ubicar estructuras y detalles constructivos"]]);
  gid("pane-"+id).innerHTML=h;}

/* ==========================================================
   4. REVISIÓN, AVISOS Y RECALCULAR
   ========================================================== */
function revisionLix_RS(){abrirRevision("Red de lixiviados",erroresLix_RS().concat(trAvisosLix_RS(),avisosResLix_RS()));}

/* ==========================================================
   5. REGISTRO DEL MÓDULO
   ========================================================== */
registrarMemoria({ins:["Producción específica (p<sub>e</sub>)","Factor de punta (f<sub>p</sub>)"]});

MODULOS.push({
  id:"lixiviados_RS",
  titulo:"Red de lixiviados",
  descripcion:"Caudal de lixiviados por año y dimensionamiento hidráulico de drenes y colectores.",
  grupo:"relleno", orden:9, icono:"lix_RS",
  iconoSvg:"<path d=\"M12 3s5 5.5 5 9a5 5 0 0 1-10 0c0-3.5 5-9 5-9z\"/><path d=\"M4 21h16\"/>",
  valores:{rsTramosLix:TRAMOS_LIX_DEF_RS},
  indicador:true, imprimible:true,
  normalizar:function(PRO){if(!Array.isArray(PRO.rsTramosLix))PRO.rsTramosLix=JSON.parse(JSON.stringify(TRAMOS_LIX_DEF_RS));},
  completo:function(PRO){return rsSerie().length>0&&erroresLix_RS().length===0;},
  pintar:pintarLixiviados_RS,
  recalcular:function(){rsRecalcular(pintarLixiviados_RS,function(){return faltaLix_RS().length?[]:erroresTramosLix_RS().concat(avisosResLix_RS());},"Red de lixiviados");},
  errores:erroresLix_RS
});
