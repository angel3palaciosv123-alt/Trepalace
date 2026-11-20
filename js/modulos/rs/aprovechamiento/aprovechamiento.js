/* ==========================================================
   RS · METAS DE APROVECHAMIENTO  (aprovechamiento.js)
   Metas por residuo y plazo; generado, aprovechado y no aprovechado por
   residuo y año, en masa y volumen. Tablas con filtros (la hoja de
   referencia METAS DE APROVECHAMIENTO ocupa unas 120 columnas).
   ========================================================== */

/* ==========================================================
   1. CONSTANTES Y VALIDACIÓN
   ========================================================== */
var ESCENARIOS_RS=["Generado","Aprovechado","No aprovechado","Comparar los tres"];
var PERIODOS_RS={"Diario":"d","Anual":"a","Acumulado":"ac"};

function erroresApr_RS(){
  var e=[],R=PRO.rsResiduos||[];
  R.forEach(function(r){["mc","mm","ml"].forEach(function(k){var v=r[k];if(typeof v!=="number"||!(v>=0&&v<=100))e.push((r.n||"Residuo")+": la meta de "+{mc:"corto",mm:"mediano",ml:"largo"}[k]+" plazo debe ser un número entre 0 y 100 %.");});});
  return e.concat(erroresGen_RS().length?["El módulo PPC y generación tiene datos por completar."]:[]);}

function avisosApr_RS(){
  return (PRO.rsResiduos||[]).filter(function(r){return !Number(r.ap)&&(Number(r.mc)||Number(r.mm)||Number(r.ml));})
    .map(function(r){return r.n+" está clasificado como no aprovechable pero tiene metas de aprovechamiento.";});}

/* ==========================================================
   2. TABLAS (metas editables y tabla con filtros)
   ========================================================== */
function tablaMetas_RS(){
  var R=PRO.rsResiduos||[],L=rsLimitesPlazo(),ok=L.n>0;
  var h='<div class="card"><div class="card-title">Metas de aprovechamiento por residuo</div>'+
    '<div class="card-sub">Porcentaje de cada tipo de residuo que se aprovecha en cada plazo. Los plazos corresponden a tercios del tiempo de vida útil (T.V.U.)'+(ok?': corto plazo, años 0 a '+L.c+' (1/3); mediano plazo, años '+(L.c+1)+' a '+L.m+' (2/3); largo plazo, años '+(L.m+1)+' a '+L.n+' (3/3)':'')+'. La vida útil se define en '+rsLinkTR()+'; los residuos y su clasificación, en Caracterización.</div>'+
    '<div class="rs-tscroll libre"><table class="rs-table rs-edit"><thead><tr><th class="izq">Tipo de residuo</th><th>Clasificación</th><th>Representatividad<small>(%)</small></th><th>Corto plazo<small>(%) · 1/3 T.V.U.</small></th><th>Mediano plazo<small>(%) · 2/3 T.V.U.</small></th><th>Largo plazo<small>(%) · 3/3 T.V.U.</small></th></tr></thead><tbody>';
  R.forEach(function(r,i){
    h+='<tr><td class="izq">'+esc(r.n)+'</td><td>'+(Number(r.ap)?'<span class="rs-tag ap">Aprov.</span>':'<span class="rs-tag no">No aprov.</span>')+(Number(r.pel)?'<span class="rs-tag pel">Pelig.</span>':'')+'</td><td>'+rsF(Number(r.pct),2)+'</td>'+
      '<td>'+rsInp("rsResiduos",i,"mc",r.mc)+'</td><td>'+rsInp("rsResiduos",i,"mm",r.mm)+'</td><td>'+rsInp("rsResiduos",i,"ml",r.ml)+'</td></tr>';});
  return h+'</tbody></table></div></div>';}

/* ---------- Tabla con filtros ---------- */
RS_TABLAS.apr_RS=function(){
  var D=rsTodo();if(!D.ok)return null;
  var F=rsFiltroEstado("apr_RS",{res:"suma",esc:"Comparar los tres",vari:"Masa",per:"Anual"});
  var M=D.M,p=PERIODOS_RS[F.per]||"a",vol=F.vari==="Volumen";
  var cv=function(pref){return vol?("v"+(p==="ac"?"ac":p)):p;};
  var unidad=vol?(p==="d"?"m³/día":p==="a"?"m³/año":"m³"):(p==="d"?"kg/día":p==="a"?"ton/año":"ton");
  var esc2=vol||p==="d"?1:1/1000;
  var val=function(m,j,e){var y=m.anios[j][e];var v=y[cv()];return isFinite(v)?v*esc2:0;};
  var esKey={"Generado":"gen","Aprovechado":"apr","No aprovechado":"noa"};
  var opsRes='<option value="suma"'+(F.res==="suma"?' selected':'')+'>Todos (suma)</option><option value="cols"'+(F.res==="cols"?' selected':'')+'>Todos (una columna por residuo)</option>'+
    M.map(function(m,i){return '<option value="'+i+'"'+(String(F.res)===String(i)?' selected':'')+'>'+esc(m.n)+'</option>';}).join("");
  var opt=function(k,ops){return '<select onchange="rsFiltro(\'apr_RS\',\''+k+'\',this.value)">'+ops.map(function(o){return '<option'+(o===F[k]?' selected':'')+'>'+o+'</option>';}).join("")+'</select>';};
  var controles='<div class="rs-f grande"><label>Residuo</label><select onchange="rsFiltro(\'apr_RS\',\'res\',this.value)">'+opsRes+'</select></div>'+
    '<div class="rs-f"><label>Escenario</label>'+opt("esc",ESCENARIOS_RS)+'</div>'+
    '<div class="rs-f"><label>Variable</label>'+opt("vari",["Masa","Volumen"])+'</div>'+
    '<div class="rs-f"><label>Período</label>'+opt("per",Object.keys(PERIODOS_RS))+'</div>';
  if(F.res==="cols"&&F.esc==="Comparar los tres")F.esc="Generado";
  var tot=p==="ac"?"last":p==="a"?"sum":null;
  var cols=[{k:"anio",t:"Año",fmt:function(v){return String(v);}},{k:"t",t:"N°",d:0},{k:"plazo",t:"Plazo",fmt:function(v){return '<span class="rs-plazo '+v+'">'+v+'</span>';}}];
  var filas=D.G.map(function(g,j){return {anio:g.anio,t:g.t,plazo:M.length?M[0].anios[j].plazo:rsPlazo(g.t)};});
  var sel=F.res!=="suma"&&F.res!=="cols"?M[Number(F.res)]:null;
  if(sel){cols.push({k:"meta",t:"Meta",u:"%",d:0});filas.forEach(function(f,j){f.meta=sel.anios[j].meta*100;});}
  var lista=sel?[sel]:M;
  if(F.res==="cols"){
    var e=esKey[F.esc];
    M.forEach(function(m,i){cols.push({k:"r"+i,t:esc(m.n),u:unidad,d:vol||p==="d"?2:2,tot:tot});filas.forEach(function(f,j){f["r"+i]=val(m,j,e);});});
    cols.push({k:"tt",t:"Total",u:unidad,d:2,tot:tot});filas.forEach(function(f,j){f.tt=M.reduce(function(a,m){return a+val(m,j,e);},0);});
  }else{
    var esc3=F.esc==="Comparar los tres"?["Generado","Aprovechado","No aprovechado"]:[F.esc];
    esc3.forEach(function(es){var e=esKey[es];cols.push({k:e,t:es,u:unidad,d:2,tot:tot});filas.forEach(function(f,j){f[e]=lista.reduce(function(a,m){return a+val(m,j,e);},0);});});
    if(esc3.length===3){cols.push({k:"pctA",t:"Aprovechado",u:"% del generado",d:1});filas.forEach(function(f){f.pctA=f.gen>0?f.apr/f.gen*100:0;});}}
  return {titulo:"Proyección de la generación por tipo de residuo",
    sub:"Consulta por tipo de residuo, escenario, variable y período. Masa diaria en kg/día; masa anual y acumulada en toneladas. Volumen = masa / peso unitario del residuo.",
    controles:controles,columnas:cols,filas:filas,csv:"Metas_aprovechamiento_RS",
    cambios:function(f){var j=f.t;return j===0||filas[j-1]&&filas[j-1].plazo!==f.plazo;}};};

/* ==========================================================
   3. VENTANA
   ========================================================== */
function pintarAprovechamiento_RS(){
  var id="aprovechamiento_RS",D=rsTodo();
  var h='<div class="titulo"><h1>METAS DE APROVECHAMIENTO</h1><p>Proyección de la generación por tipo de residuo y distribución entre la fracción aprovechada y la fracción no aprovechada que se dispone en el relleno, según las metas de corto, mediano y largo plazo.</p></div>'+CONV;
  if(!D.ok){gid("pane-"+id).innerHTML=h+rsFaltaProy()+tablaMetas_RS();return;}
  var err=erroresApr_RS();
  if(erroresGen_RS().length)h+=rsFalta(["Complete primero los módulos de caracterización y de PPC y generación."],"generacion_RS","Ir a PPC y generación");
  h+=tablaMetas_RS();
  if(err.length){gid("pane-"+id).innerHTML=h+'<div class="card"><div class="card-title">Parámetros de cálculo</div>'+rsAcciones(id,"revisionApr_RS()")+'</div>';return;}
  var P=D.P,z=P[P.length-1],a=P[0];
  var totG=z.relAc+z.aprAc+z.parteAc;
  h+=rsKpis([
    {t:"Aprovechado en "+a.anio,v:rsF(a.pctApr*100,1),u:"%",s:"del total generado"},
    {t:"Aprovechado en "+z.anio,v:rsF(z.pctApr*100,1),u:"%",s:"del total generado"},
    {t:"Aprovechado acumulado",v:rsF(z.aprAc/1000,0),u:"ton",s:rsF(totG>0?z.aprAc/totG*100:0,1)+" % del período"},
    {t:"No aprovechado acumulado",v:rsF((z.relAc+z.parteAc)/1000,0),u:"ton",s:"Llega al relleno: "+rsF(z.relAc/1000,0)+" t"}]);
  var F=rsFiltroEstado("apr_RS",{res:"suma",esc:"Comparar los tres",vari:"Masa",per:"Anual"});
  var lista=F.res!=="suma"&&F.res!=="cols"?[D.M[Number(F.res)]]:D.M;
  var serie=function(e){return D.G.map(function(_,j){return lista.reduce(function(s,m){return s+m.anios[j][e].a/1000;},0);});};
  h+='<div class="card"><div class="card-title">Aprovechado vs. no aprovechado — '+(lista.length===1?esc(lista[0].n):"todos los residuos")+'</div>'+
    rsGrafico(D.G.map(function(g){return g.anio;}),[{nombre:"Aprovechado (ton/año)",color:"#16A34A",valores:serie("apr")},{nombre:"No aprovechado (ton/año)",color:"#94A3B8",valores:serie("noa")}],{uY:"ton/año"})+
    '<div class="card-sub">El gráfico corresponde al residuo seleccionado en la tabla de proyección.</div></div>';
  h+=rsTabla("apr_RS");
  /* Memoria: año y residuo */
  var am=rsAnioMemo(D),j=rsIdx(D,am),ri=PRO.rsResMemo===""||PRO.rsResMemo===null||PRO.rsResMemo===undefined?-1:Number(PRO.rsResMemo);if(!(ri>=0&&ri<D.M.length))ri=D.M.findIndex(function(m){return m.ml>0;});if(ri<0)ri=0;
  var m=D.M[ri],y=m.anios[j],g=D.G[j];
  h+='<div class="card"><div class="card-title">Parámetros de cálculo</div><div class="row">'+rsSelAnio(D)+
    '<div class="campo"><label>Residuo que se detalla</label><select onchange="PRO.rsResMemo=Number(this.value);guardarPro();autoRecalcular()">'+D.M.map(function(x,i){return '<option value="'+i+'"'+(i===ri?' selected':'')+'>'+esc(x.n)+'</option>';}).join("")+'</select></div></div>'+rsAcciones(id,"revisionApr_RS()")+'</div>';
  var t='<table class="res-table"><thead><tr><th></th><th>VARIABLE</th><th>VALOR</th><th>UNIDAD</th></tr></thead><tbody>';
  t+=seccion(esc(m.n).toUpperCase()+" — AÑO "+y.anio+" (N° "+y.t+", "+y.plazo.toUpperCase()+" PLAZO)");
  t+=fila("Generación total diaria (G<sub>d</sub>)",g.Gd,"kg/día",2,"G<sub>d</sub> = P × PPC<sub>t</sub>",nf(g.pob,0)+" × "+nf(g.ppc,4),"Módulo PPC y generación.");
  t+=fila("Fracción del residuo (f)",m.frac*100,"%",3,"f = %<sub>i</sub> / Σ%",nf(m.frac*D.C.sPct,2)+" / "+nf(D.C.sPct,2),"Composición de la caracterización.");
  t+=fila("Generación del residuo",y.gen.d,"kg/día",3,"G<sub>i</sub> = G<sub>d</sub> × f",nf(g.Gd,2)+" × "+nf(m.frac,5));
  t+=fila("Meta de aprovechamiento ("+y.plazo+" plazo)",y.meta*100,"%",1,"Año n° "+y.t+" → "+y.plazo+" plazo","Corto: años 0–"+rsLimitesPlazo().c+" · mediano: hasta el año "+rsLimitesPlazo().m+" · largo: resto del T.V.U.","Tabla de metas de este módulo.");
  t+=fila("Aprovechado",y.apr.d,"kg/día",3,"A<sub>i</sub> = G<sub>i</sub> × meta",nf(y.gen.d,3)+" × "+nf(y.meta,3));
  t+=fila("No aprovechado (va al relleno)",y.noa.d,"kg/día",3,"N<sub>i</sub> = G<sub>i</sub> − A<sub>i</sub>",nf(y.gen.d,3)+" − "+nf(y.apr.d,3),m.aparte?"Residuo peligroso: se gestiona aparte y no entra al relleno.":"","","final");
  t+=fila("Peso unitario del residuo (ρ<sub>i</sub>)",m.rho,"kg/m³",0,"Tabla de composición","—","Caracterización.");
  t+=fila("Volumen generado",y.gen.vd,"m³/día",4,"V = G<sub>i</sub> / ρ<sub>i</sub>",nf(y.gen.d,3)+" / "+nf(m.rho,0));
  t+=fila("Volumen aprovechado",y.apr.vd,"m³/día",4,"V = A<sub>i</sub> / ρ<sub>i</sub>",nf(y.apr.d,3)+" / "+nf(m.rho,0));
  t+=fila("Volumen no aprovechado",y.noa.vd,"m³/día",4,"V = N<sub>i</sub> / ρ<sub>i</sub>",nf(y.noa.d,3)+" / "+nf(m.rho,0));
  t+=fila("No aprovechado anual",y.noa.a,"kg/año",1,"N<sub>a</sub> = N<sub>i</sub> × 365",nf(y.noa.d,3)+" × 365");
  t+='</tbody></table>';
  h+='<div class="card"><div class="card-title">Memoria de cálculo</div>'+t+'</div>';
  gid("pane-"+id).innerHTML=h;}

/* ==========================================================
   4. REVISIÓN, AVISOS Y RECALCULAR
   ========================================================== */
function revisionApr_RS(){abrirRevision("Metas de aprovechamiento",erroresApr_RS().concat(avisosApr_RS()));}

/* ==========================================================
   5. REGISTRO DEL MÓDULO
   ========================================================== */
MODULOS.push({
  id:"aprovechamiento_RS",
  titulo:"Metas de aprovechamiento",
  descripcion:"Generación, aprovechamiento y fracción no aprovechada por tipo de residuo y año.",
  grupo:"residuos", orden:6, icono:"apr_RS",
  iconoSvg:"<path d=\"M7 19H4.8a1.8 1.8 0 0 1-1.6-2.7L5.5 12\"/><path d=\"m11 19h8.2a1.8 1.8 0 0 0 1.6-2.7l-1.2-2\"/><path d=\"m14 16-3 3 3 3\"/><path d=\"M8.3 13.4 5.5 12 4 14.8\"/><path d=\"m9.3 5.6 1.1-1.9a1.8 1.8 0 0 1 3.1 0l3.8 6.6\"/><path d=\"m13.4 9.6 3.9.7.8-3.8\"/>",
  valores:{rsResMemo:""},
  indicador:true, imprimible:true,
  normalizar:function(PRO){},
  completo:function(PRO){return rsSerie().length>0&&erroresApr_RS().length===0;},
  pintar:pintarAprovechamiento_RS,
  recalcular:function(){rsRecalcular(pintarAprovechamiento_RS,function(){var g=erroresGen_RS().length;return erroresApr_RS().filter(function(x){return x.indexOf("PPC y generación")<0;}).concat(g?[]:avisosApr_RS());},"Metas de aprovechamiento");},
  errores:erroresApr_RS
});
