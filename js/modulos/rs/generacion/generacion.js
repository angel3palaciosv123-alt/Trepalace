/* ==========================================================
   RS · PPC Y GENERACIÓN  (generacion.js)
   PPC año a año, generación diaria, anual y acumulada (masa y volumen) y
   lixiviado por humedad. Hoja de referencia: PROYECCIÓN RS Y PPC.
   ========================================================== */

/* ==========================================================
   1. VALIDACIÓN
   ========================================================== */
function faltaGen_RS(){
  var e=[];
  if(!esPos(PRO.rsPPC))e.push("Falta la PPC de diseño (Términos de referencia).");
  if(PRO.rsVarPPC===""||typeof PRO.rsVarPPC!=="number")e.push("Falta la variación anual de la PPC (Términos de referencia).");
  return e;}
function erroresGen_RS(){
  return faltaGen_RS().concat(erroresCarac_RS().length?["La caracterización tiene datos por completar o corregir (representatividad, peso unitario, humedad o parámetros de muestreo)."]:[]);}

RS_TABLAS.gen_RS=function(){
  var D=rsTodo();if(!D.ok)return null;
  var F=rsFiltroEstado("gen_RS",{grupo:"Todo"}),g=F.grupo;
  var cols=[{k:"anio",t:"Año",fmt:function(v){return String(v);}},{k:"pob",t:"Población",u:"hab",d:0},{k:"ppc",t:"PPC",u:"kg/hab·día",d:3}];
  if(g==="Todo"||g==="Masa")cols=cols.concat([{k:"Gd",t:"Generación diaria",u:"kg/día",d:0},{k:"GaT",t:"Generación anual",u:"ton/año",d:1,tot:"sum"},{k:"GacT",t:"Generación acumulada",u:"ton",d:1,tot:"last"}]);
  if(g==="Todo"||g==="Volumen")cols=cols.concat([{k:"Vd",t:"Volumen diario",u:"m³/día",d:2},{k:"Va",t:"Volumen anual",u:"m³/año",d:1,tot:"sum"},{k:"Vac",t:"Volumen acumulado",u:"m³",d:1,tot:"last"}]);
  if(g==="Todo"||g==="Lixiviado por humedad")cols=cols.concat([{k:"Ld",t:"Lixiviado diario",u:"m³/día",d:3},{k:"La",t:"Lixiviado anual",u:"m³/año",d:1,tot:"sum"},{k:"Lac",t:"Lixiviado acumulado",u:"m³",d:1,tot:"last"}]);
  return {titulo:"Generación de residuos sólidos por año",sub:"Volumen suelto calculado con el peso unitario ponderado de la caracterización (ρ = "+rsF(D.C.rhoP,1)+" kg/m³). Lixiviado por contenido de humedad con w = "+rsF(D.C.humP*100,2)+" %.",
    controles:'<div class="rs-f"><label>Mostrar</label><select onchange="rsFiltro(\'gen_RS\',\'grupo\',this.value)">'+["Todo","Masa","Volumen","Lixiviado por humedad"].map(function(o){return '<option'+(o===g?' selected':'')+'>'+o+'</option>';}).join("")+'</select></div>',
    columnas:cols,csv:"Generacion_RS",
    filas:D.G.map(function(r){return Object.assign({},r,{GaT:r.Ga/1000,GacT:r.Gac/1000});})};};

/* ==========================================================
   2. VENTANA
   ========================================================== */
function pintarGeneracion_RS(){
  var id="generacion_RS",D=rsTodo();
  var h='<div class="titulo"><h1>PPC Y GENERACIÓN DE RESIDUOS</h1><p>Proyección de la producción per cápita (PPC) y cálculo de la generación diaria, anual y acumulada de residuos sólidos, en masa y volumen, para cada año del horizonte de diseño.</p></div>'+CONV;
  if(!D.ok){gid("pane-"+id).innerHTML=h+rsFaltaProy();return;}
  var err=erroresGen_RS();
  if(err.length){var fg=faltaGen_RS();gid("pane-"+id).innerHTML=h+(fg.length?rsFalta(fg,"terminos_referencia_RS","Ir a términos de referencia"):rsFalta(["La caracterización tiene datos por completar o corregir."],"caracterizacion_RS","Ir a caracterización"))+rsAcciones(id,"revisionGen_RS()");return;}
  var G=D.G,a=G[0],z=G[G.length-1],niv=D.nivel,r=DP_RS.T.PPC[niv],ppc0=rsN("rsPPC"),fuera=ppc0<r[0]||ppc0>r[1];
  h+='<div class="link-ok">PPC de diseño <b>'+nf(ppc0,3)+' kg/hab·día</b> · Variación anual <b>'+nf(rsN("rsVarPPC")*100,2)+' %</b></div>';
  h+=rsKpis([
    {t:"PPC "+a.anio+" → "+z.anio,v:rsF(a.ppc,3)+" → "+rsF(z.ppc,3),u:"kg/hab·día"},
    {t:"Generación diaria "+z.anio,v:rsF(z.Gd/1000,2),u:"ton/día",s:"En "+a.anio+": "+rsF(a.Gd/1000,2)+" ton/día"},
    {t:"Generación acumulada",v:rsF(z.Gac/1000,0),u:"ton",s:a.anio+" – "+z.anio},
    {t:"Volumen acumulado (suelto)",v:rsF(z.Vac,0),u:"m³"},
    {t:"Lixiviado por humedad acumulado",v:rsF(z.Lac,0),u:"m³"}]);
  h+='<div class="card"><div class="card-title">Generación anual</div>'+rsGrafico(G.map(function(g){return g.anio;}),[{nombre:"Generación anual (ton/año)",color:"#16A34A",valores:G.map(function(g){return g.Ga/1000;})}],{uY:"ton/año"})+'</div>';
  h+=rsTabla("gen_RS");
  var am=rsAnioMemo(D),j=rsIdx(D,am),g=G[j];
  h+='<div class="card"><div class="card-title">Parámetros de cálculo</div><div class="card-sub">La memoria de cálculo se presenta para el año seleccionado.</div><div class="row">'+rsSelAnio(D)+'</div>'+rsAcciones(id,"revisionGen_RS()")+'</div>';
  var m='<table class="res-table"><thead><tr><th></th><th>VARIABLE</th><th>VALOR</th><th>UNIDAD</th></tr></thead><tbody>';
  m+=seccion("AÑO "+g.anio+" (AÑO N° "+g.t+" DE LA VIDA ÚTIL)");
  m+=fila("Población",g.pob,"hab",0,"P<sub>"+g.anio+"</sub>",rsOrigenPobTxt(),"Importada de Proyección poblacional.");
  m+=filaDato("PPC de diseño (PPC<sub>0</sub>)",ppc0,"kg/hab·día",3,"Términos de referencia.");
  m+=filaDato("Variación anual de la PPC (v)",rsN("rsVarPPC")*100,"%",2,"Términos de referencia.");
  m+=fila("PPC del año",g.ppc,"kg/hab·día",4,"PPC<sub>t</sub> = PPC<sub>0</sub>·(1 + v)<sup>t</sup>",nf(ppc0,3)+" × (1 + "+nf(rsN("rsVarPPC"),4)+")<sup>"+g.t+"</sup>","",fuera?"La PPC de diseño está fuera del rango de la tabla F.1.1 para el nivel "+niv+".":"");
  m+=fila("Generación diaria (G<sub>d</sub>)",g.Gd,"kg/día",2,"G<sub>d</sub> = P × PPC<sub>t</sub>",nf(g.pob,0)+" × "+nf(g.ppc,4),"","","final");
  m+=fila("Generación anual (G<sub>a</sub>)",g.Ga,"kg/año",0,"G<sub>a</sub> = G<sub>d</sub> × 365",nf(g.Gd,2)+" × 365");
  m+=fila("Generación acumulada",g.Gac,"kg",0,"ΣG<sub>a</sub> desde "+D.anioIni,"—");
  m+=fila("Volumen diario (V<sub>d</sub>)",g.Vd,"m³/día",3,"V<sub>d</sub> = G<sub>d</sub> / ρ",nf(g.Gd,2)+" / "+nf(D.C.rhoP,2),"ρ = peso unitario ponderado (Caracterización).");
  m+=fila("Volumen anual",g.Va,"m³/año",1,"V<sub>a</sub> = V<sub>d</sub> × 365",nf(g.Vd,3)+" × 365");
  m+=fila("Lixiviado por humedad diario",g.Ld,"m³/día",4,"L<sub>d</sub> = G<sub>d</sub> × w / 1000",nf(g.Gd,2)+" × "+nf(D.C.humP,4)+" / 1000","w = humedad ponderada (Caracterización); 1000 kg/m³ = densidad del agua.");
  m+=fila("Lixiviado por humedad anual",g.La,"m³/año",2,"L<sub>a</sub> = L<sub>d</sub> × 365",nf(g.Ld,4)+" × 365");
  m+='</tbody></table>';
  h+='<div class="card"><div class="card-title">Memoria de cálculo</div>'+m+'</div>';
  gid("pane-"+id).innerHTML=h;}

/* ==========================================================
   3. REVISIÓN, AVISOS Y RECALCULAR
   ========================================================== */
function revisionGen_RS(){abrirRevision("PPC y generación",erroresGen_RS());}

/* ==========================================================
   4. REGISTRO DEL MÓDULO
   ========================================================== */
MODULOS.push({
  id:"generacion_RS",
  titulo:"PPC y generación",
  descripcion:"Producción per cápita y generación anual de residuos en masa y volumen.",
  grupo:"residuos", orden:5, icono:"res_RS",
  iconoSvg:"<path d=\"M5 7h14l-1.5 13h-11z\"/><path d=\"M9 7V4h6v3M10 11v5M14 11v5\"/>",
  valores:{},
  indicador:true, imprimible:true,
  normalizar:function(PRO){},
  completo:function(PRO){return rsSerie().length>0&&erroresGen_RS().length===0;},
  pintar:pintarGeneracion_RS,
  recalcular:function(){rsRecalcular(pintarGeneracion_RS,function(){return [];},"PPC y generación");},
  errores:erroresGen_RS
});
