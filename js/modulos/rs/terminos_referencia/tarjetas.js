/* ==========================================================
   RS · TÉRMINOS DE REFERENCIA — tarjetas  (tarjetas.js)
   Una tarjeta por unidad. Las advertencias no se muestran en la hoja: salen en la
   ventana de advertencia al guardar un campo (Enter o al salir del campo) y en
   REVISIÓN DE ERRORES, igual que en STAR.
   Requiere: TR_RS (rangos.js), DP_RS, motor_rs.js y ui_rs.js.
   ========================================================== */

/* ==========================================================
   1. FUNCIONES AUXILIARES
   ========================================================== */
function trRO_RS(lbl,val){return '<div class="campo"><label>'+lbl+'</label><input value="'+val+'" placeholder="—" readonly></div>';}
function trFuera_RS(claves){return claves.map(function(k){return TR_RS.fuera(k);}).filter(Boolean);}
function trPos_RS(k,txt){return (PRO[k]!==""&&PRO[k]!==null&&PRO[k]!==undefined&&!esPos(PRO[k]))?[txt+" debe ser un número mayor que cero."]:[];}

/* ==========================================================
   2. TARJETAS DE PARÁMETROS
   ========================================================== */
/* 2.1 Identificación y horizonte */
function trCardIdentificacion_RS(){
  var af=esPos(PRO.anioIni)&&esPos(PRO.duracion)?Number(PRO.anioIni)+Number(PRO.duracion):"";
  return '<div class="card"><div class="card-title">Identificación del proyecto</div>'+
    '<div class="card-sub">El año de inicio y la vida útil del relleno definen el horizonte de diseño. Al cargar la proyección poblacional se toman los valores definidos en esa ventana.</div>'+
    '<div class="row">'+campo("Diseñador","diseñador","text")+campo("Nombre de la población","nombrePob","text")+'</div>'+
    '<div class="row">'+rsCampo("Vida útil del relleno (años)","duracion",true)+rsCampo("Año inicial del proyecto","anioIni",true)+trRO_RS("Año final del proyecto (calculado)",af)+'</div></div>';}
function trAvisosIdent_RS(){
  var e=trFuera_RS(["duracion"]).concat(trPos_RS("anioIni","El año inicial"));
  var s=rsPobDeProyeccion()?rsSerie():[];
  if(s.length&&esPos(PRO.anioIni)&&esPos(PRO.duracion)&&(s[0].anio!==Number(PRO.anioIni)||s[s.length-1].anio!==Number(PRO.anioIni)+Number(PRO.duracion)))
    e.push("El horizonte no coincide con la proyección cargada ("+s[0].anio+" – "+s[s.length-1].anio+"). Cargue de nuevo los datos en Proyección poblacional con el nuevo horizonte.");
  return e;}

/* 2.2 Población de diseño (igual a STAR: se adopta el método con un clic o se digita la población) */
function tomarPob_RS(valor,metodo){
  PRO.rsPobProy=valor;PRO.rsMetodo=metodo;
  guardarPro();actualizarEstados();pintarTerminosReferencia_RS();}

function trCardPoblacion_RS(){
  var h='';
  var disp=moduloApi("proyeccion_poblacional_RS").poblaciones;disp=typeof disp==="function"?disp():[];
  if(disp.length){
    h+='<div class="card"><div class="card-title">Población de diseño</div>'+
       '<div class="card-sub">Resultados disponibles en el módulo de proyección para el año '+disp[0].anio+'.</div><div class="row">';
    disp.forEach(function(d){
      var sel=esPos(PRO.rsPobProy)&&Math.round(Number(PRO.rsPobProy))===Math.round(d.valor)&&PRO.rsMetodo===d.metodo;
      h+='<div class="campo" style="cursor:pointer'+(sel?';border:2px solid var(--verde,#16A34A);box-shadow:0 0 0 3px rgba(22,163,74,.15)':'')+'" onclick="tomarPob_RS('+d.valor+',\''+d.metodo+'\')"><label>'+d.metodo.toUpperCase()+' · '+(d.aplica?'APLICA (RAS)':'NO APLICA')+'</label>'+
         '<div style="font-size:17px;font-weight:700;color:'+(d.aplica?'var(--verde-oscuro)':'#B45309')+'">'+nf(d.valor,0)+' hab</div>'+
         '<div style="font-size:10.5px;color:var(--gris)">Nivel '+DP_RS.nivelComplejidad(d.valor)+' — clic para adoptar</div></div>';});
    h+='</div></div>';
  }else{
    h+='<div class="aviso"><b>Aún no hay proyección generada.</b> Ve a la ventana <i>Proyección poblacional</i>, carga los datos del municipio y ejecuta los cálculos; luego vuelve aquí para adoptar la población de diseño. También puedes digitarla manualmente abajo.'+
       '<br><button onclick="irVista(\'proyeccion_poblacional_RS\')">Ir a proyección poblacional</button></div>';}
  var met=rsPobDeProyeccion()?(PRO.rsMetodo||""):(esPos(PRO.rsPobProy)?"Manual":"");
  h+='<div class="card"><div class="row">'+rsCampo("Población proyectada (hab)","rsPobProy",true)+
     '<div class="campo"><label>Método adoptado</label><input value="'+met+'" placeholder="Manual" readonly></div>'+
     '<div class="campo"><label>Nivel de complejidad (RAS)</label><input value="'+(esPos(PRO.rsPobProy)?DP_RS.nivelComplejidad(Number(PRO.rsPobProy)):"")+'" placeholder="—" readonly></div></div></div>';
  return h;}
function trAvisosPob_RS(){
  var e=trPos_RS("rsPobProy","La población proyectada");
  if(esPos(PRO.rsPobProy)&&!rsPobDeProyeccion()&&(!esPos(PRO.anioIni)||!esPos(PRO.duracion)))e.push("Para usar la población digitada se requieren el año inicial y la vida útil del relleno.");
  return e;}

/* 2.3 Caracterización (muestreo) */
function trCardCaracterizacion_RS(){
  var s=rsSerie();
  var opsAnio=s.map(function(r){return '<option value="'+r.anio+'"'+(Number(PRO.rsAnioEstudio)===r.anio?' selected':'')+'>'+r.anio+'</option>';}).join("");
  return '<div class="card"><div class="card-title">Parámetros de Caracterización</div>'+
    '<div class="card-sub">Parámetros estadísticos del muestreo (tamaño de muestra n = N·Zα²·p·q / [e²·(N − 1) + Zα²·p·q]) y datos de campo de la muestra. La composición física por tipo de residuo se ingresa en el módulo Caracterización.</div>'+
    '<div class="row"><div class="campo"><label>Año de estudio (población N)</label><select onchange="setPro(\'rsAnioEstudio\',this,true);autoRecalcular()">'+
      '<option value="">Año inicial</option>'+opsAnio+'</select></div>'+
    '<div class="campo"><label>Nivel de confianza (%)</label><select onchange="setPro(\'rsConfianza\',this,true);autoRecalcular()"><option value=""'+(PRO.rsConfianza===""?' selected':'')+'>Selecciona</option>'+
      DP_RS.T.CONFIANZA.map(function(r){return '<option value="'+r[0]+'"'+(Number(PRO.rsConfianza)===r[0]&&PRO.rsConfianza!==""?' selected':'')+'>'+nf(r[0],1)+' % (Zα = '+nf(r[1],3)+')</option>';}).join("")+'</select></div>'+
    rsCampoPct("Error aceptado e","rsError")+rsCampo("Probabilidad de éxito p","rsP")+'</div>'+
    '<div class="row">'+rsCampo("Personas asumidas para el estudio","rsPersonas",true)+rsCampo("Habitantes por vivienda","rsHabViv")+rsCampo("Días de muestreo","rsDiasMuestreo",true)+rsCampo("Peso total de la muestra (kg)","rsPesoMuestra")+'</div></div>';}
function trAvisosCarac_RS(){
  return trFuera_RS(["rsError","rsP","rsHabViv","rsDiasMuestreo"]).concat(trPos_RS("rsPesoMuestra","El peso total de la muestra"),trPos_RS("rsPersonas","Las personas asumidas para el estudio"));}

/* 2.4 PPC y generación */
function trCardPPC_RS(){
  var s=rsSerie(),niv=s.length?DP_RS.nivelComplejidad(s[s.length-1].pob):null,r=niv?DP_RS.T.PPC[niv]:null;
  return '<div class="card"><div class="card-title">Parámetros de PPC y generación</div>'+
    '<div class="card-sub">Producción per cápita de diseño (dato del diseñador) y su variación anual: PPC<sub>t</sub> = PPC<sub>0</sub>·(1 + v)<sup>t</sup>. '+(r?'Rango de la tabla F.1.1 para el nivel '+niv+': '+nf(r[0],2)+' – '+nf(r[1],2)+' kg/hab·día.':'')+'</div>'+
    '<div class="row">'+rsCampo("PPC de diseño (kg/hab·día)","rsPPC")+rsCampoPct("Variación anual de la PPC","rsVarPPC")+trRO_RS("Nivel de complejidad (año final)",niv||"")+'</div></div>';}
function trAvisosPPC_RS(){
  var e=trFuera_RS(["rsVarPPC"]).concat(trPos_RS("rsPPC","La PPC de diseño")),s=rsSerie();
  if(esPos(PRO.rsPPC)&&s.length){var niv=DP_RS.nivelComplejidad(s[s.length-1].pob),r=DP_RS.T.PPC[niv],v=Number(PRO.rsPPC);
    if(v<r[0]||v>r[1])e.push("La PPC de diseño ("+nf(v,2)+" kg/hab·día) está fuera del rango de la tabla F.1.1 para el nivel "+niv+" ("+nf(r[0],2)+" – "+nf(r[1],2)+").");}
  return e;}

/* 2.5 Metas de aprovechamiento: plazos por tercios de la vida útil */
function trCardMetas_RS(){
  var L=rsLimitesPlazo(),ok=L.n>0;
  return '<div class="card"><div class="card-title">Parámetros de Metas de aprovechamiento</div>'+
    '<div class="card-sub">Los plazos se definen por tercios del tiempo de vida útil (T.V.U.): corto plazo 1/3, mediano plazo 2/3 y largo plazo 3/3. Los porcentajes de aprovechamiento por residuo se ingresan en el módulo Metas de aprovechamiento.</div>'+
    '<div class="row">'+trRO_RS("Corto plazo (1/3 del T.V.U.)",ok?"Años 0 a "+L.c:"")+trRO_RS("Mediano plazo (2/3 del T.V.U.)",ok?"Años "+(L.c+1)+" a "+L.m:"")+trRO_RS("Largo plazo (3/3 del T.V.U.)",ok?"Años "+(L.m+1)+" a "+L.n:"")+
    selec("Residuos peligrosos (RESPEL y hospitalarios)","rsPeligrosos",PELIGROSOS_RS)+'</div></div>';}
function trAvisosMetas_RS(){return [];}

/* 2.6 Celdas y trincheras */
function trCardCeldas_RS(){
  var huI=rsN("rsHCelda")-rsN("rsHInter",0)-rsN("rsHBent",0)-rsN("rsHAmort",0),huF=rsN("rsHCelda")-rsN("rsHFinal",0)-rsN("rsHBent",0)-rsN("rsHAmort",0);
  return '<div class="card"><div class="card-title">Parámetros de Celdas y trincheras</div>'+
    '<div class="card-sub">Geometría de la celda diaria, espesores de las capas de impermeabilización y cobertura, densidad de compactación y área disponible del predio.</div>'+
    '<div class="row">'+rsCampo("Área disponible (ha)","rsArea")+rsCampo("Profundidad de la trinchera (m)","rsProfTrinchera")+rsCampo("Número de niveles en la trinchera","rsNiveles",true)+rsCampo("Altura de la celda H (m)","rsHCelda")+'</div>'+
    '<div class="row">'+rsCampo("Capa de amortiguamiento (m)","rsHAmort")+rsCampo("Capa de bentonita (m)","rsHBent")+rsCampo("Cobertura intermedia (m)","rsHInter")+rsCampo("Cobertura final (m)","rsHFinal")+'</div>'+
    '<div class="row">'+rsCampo("Densidad de compactación (t/m³)","rsDensComp")+rsCampo("Peso unitario de la bentonita (t/m³)","rsRhoBent")+rsCampo("Ancho del rollo de geotextil (m)","rsRollo")+'</div>'+
    '<div class="row">'+trRO_RS("Altura útil niveles intermedios (m)",isFinite(huI)?nf(huI,2):"")+trRO_RS("Altura útil nivel final (m)",isFinite(huF)?nf(huF,2):"")+'</div></div>';}
function trAvisosCeldas_RS(){
  var e=trFuera_RS(["rsHCelda","rsHAmort","rsHBent","rsHInter","rsHFinal","rsDensComp","rsRhoBent"])
    .concat(trPos_RS("rsArea","El área disponible"),trPos_RS("rsProfTrinchera","La profundidad de la trinchera"),trPos_RS("rsNiveles","El número de niveles"),trPos_RS("rsRollo","El ancho del rollo de geotextil"));
  var huF=rsN("rsHCelda")-rsN("rsHFinal",0)-rsN("rsHBent",0)-rsN("rsHAmort",0),huI=rsN("rsHCelda")-rsN("rsHInter",0)-rsN("rsHBent",0)-rsN("rsHAmort",0);
  if(isFinite(huI)&&huI<=0)e.push("La altura útil de los niveles intermedios es ≤ 0: las capas suman más que la altura de la celda.");
  if(isFinite(huF)&&huF<=0)e.push("La altura útil del nivel final es ≤ 0: las capas suman más que la altura de la celda.");
  if(esPos(PRO.rsNiveles)&&esPos(PRO.rsHCelda)&&esPos(PRO.rsProfTrinchera)&&Math.abs(Number(PRO.rsNiveles)*Number(PRO.rsHCelda)-Number(PRO.rsProfTrinchera))>0.01)
    e.push("Niveles × altura de celda ("+nf(Number(PRO.rsNiveles)*Number(PRO.rsHCelda),2)+" m) no coincide con la profundidad de la trinchera ("+nf(Number(PRO.rsProfTrinchera),2)+" m).");
  return e;}

/* 2.7 Lixiviados */
function trCardLixiviados_RS(){
  return '<div class="card"><div class="card-title">Parámetros de Red de lixiviados</div>'+
    '<div class="card-sub">Producción específica de lixiviado, factor de punta y criterios hidráulicos de diseño de drenes y colectores (Manning a tubo lleno). Los tramos se ingresan en el módulo Red de lixiviados.</div>'+
    '<div class="row">'+rsCampo("Producción específica (m³/t RS)","rsProdEsp")+rsCampo("Factor de punta","rsFpLix")+rsCampo("Rugosidad de Manning n","rsN")+rsCampo("Pendiente mínima (m/m)","rsSmin")+'</div>'+
    '<div class="row">'+rsCampo("Velocidad mínima (m/s)","rsVmin")+rsCampo("Velocidad máxima (m/s)","rsVmax")+rsCampo("Diámetro mínimo (m)","rsDmin")+'</div></div>';}
function trAvisosLix_RS(){
  var e=trFuera_RS(["rsProdEsp","rsFpLix","rsN","rsSmin"]).concat(trPos_RS("rsDmin","El diámetro mínimo"));
  if(esPos(PRO.rsVmin)&&esPos(PRO.rsVmax)&&Number(PRO.rsVmin)>=Number(PRO.rsVmax))e.push("La velocidad mínima debe ser menor que la máxima.");
  return e;}

/* 2.8 Piscinas */
function trCardPiscinas_RS(){
  return '<div class="card"><div class="card-title">Parámetros de Piscinas de lixiviados</div>'+
    '<div class="card-sub">Días de autonomía y reserva de contingencia del almacenamiento, geometría trapezoidal de la piscina y datos climáticos para el balance hídrico.</div>'+
    '<div class="row">'+rsCampo("Días de autonomía","rsDias",true)+rsCampoPct("Reserva de contingencia","rsReserva")+rsCampo("Bordo libre (m)","rsBL")+rsCampo("Profundidad útil h (m)","rsHPis")+'</div>'+
    '<div class="row">'+rsCampo("Talud interior z (H:1V)","rsTalud")+rsCampo("Relación largo / ancho","rsRelLA")+rsCampo("Precipitación anual (mm/año)","rsPrecip")+rsCampo("Evaporación anual (mm/año)","rsEvap")+rsCampo("Capacidad de tratamiento (m³/día)","rsCapTrat")+'</div></div>';}
function trAvisosPis_RS(){return trFuera_RS(["rsDias","rsReserva","rsBL","rsHPis","rsTalud","rsRelLA"]);}

/* 2.9 Gases */
function trCardGases_RS(){
  return '<div class="card"><div class="card-title">Parámetros de Red de gases</div>'+
    '<div class="card-sub">Generación de metano (modelo de primer orden LandGEM o potencial anual), composición del biogás, eficiencia de captación y criterios de pozos y condensados. Los tramos se ingresan en el módulo Red de gases.</div>'+
    '<div class="row">'+selec("Método de generación","rsMetGas",METODOS_GAS_RS)+rsCampoPct("Fracción biodegradable dispuesta","rsFb")+rsCampo("Potencial de metano L0 (m³ CH₄/t)","rsL0")+rsCampo("Constante de generación k (1/año)","rsK")+'</div>'+
    '<div class="row">'+rsCampoPct("Metano en el biogás","rsCH4")+rsCampoPct("Eficiencia de captación","rsEfCap")+rsCampo("Factor de punta","rsFpGas")+'</div>'+
    '<div class="row">'+rsCampo("Separación entre pozos (m)","rsSepPozos")+rsCampo("Caudal nominal por pozo (m³/h)","rsQPozo")+rsCampo("Separación máxima entre condensados (m)","rsSepCond")+'</div></div>';}
function trAvisosGas_RS(){
  var e=trFuera_RS(["rsFb","rsL0","rsCH4","rsEfCap","rsFpGas","rsSepPozos"]).concat(trPos_RS("rsQPozo","El caudal nominal por pozo"));
  if(PRO.rsMetGas===METODOS_GAS_RS[0])e=e.concat(trFuera_RS(["rsK"]));
  return e;}
