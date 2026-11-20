/* ==========================================================
   RS · TÉRMINOS DE REFERENCIA — ventana  (terminos_referencia.js)
   Requiere: rangos.js y tarjetas.js
   Los campos inician vacíos, como en STAR. Las advertencias salen en ventana al guardar un campo.
   ========================================================== */

/* ==========================================================
   1. TARJETAS REGISTRADAS (una por unidad)
   ========================================================== */
TR_RS.registrarTarjeta({id:"identificacion",orden:1,pintar:trCardIdentificacion_RS,avisos:trAvisosIdent_RS,titulo:"Identificación y horizonte"});
TR_RS.registrarTarjeta({id:"poblacion",orden:2,pintar:trCardPoblacion_RS,avisos:trAvisosPob_RS,titulo:"Población de diseño"});
TR_RS.registrarTarjeta({id:"caracterizacion",orden:3,pintar:trCardCaracterizacion_RS,avisos:trAvisosCarac_RS,titulo:"Caracterización"});
TR_RS.registrarTarjeta({id:"ppc",orden:4,pintar:trCardPPC_RS,avisos:trAvisosPPC_RS,titulo:"PPC y generación"});
TR_RS.registrarTarjeta({id:"metas",orden:5,pintar:trCardMetas_RS,avisos:trAvisosMetas_RS,titulo:"Metas de aprovechamiento"});
TR_RS.registrarTarjeta({id:"celdas",orden:6,pintar:trCardCeldas_RS,avisos:trAvisosCeldas_RS,titulo:"Celdas y trincheras"});
TR_RS.registrarTarjeta({id:"lixiviados",orden:7,pintar:trCardLixiviados_RS,avisos:trAvisosLix_RS,titulo:"Red de lixiviados"});
TR_RS.registrarTarjeta({id:"piscinas",orden:8,pintar:trCardPiscinas_RS,avisos:trAvisosPis_RS,titulo:"Piscinas de lixiviados"});
TR_RS.registrarTarjeta({id:"gases",orden:9,pintar:trCardGases_RS,avisos:trAvisosGas_RS,titulo:"Red de gases"});

/* ==========================================================
   2. VENTANA
   ========================================================== */
function pintarTerminosReferencia_RS(){
  var h='<div class="titulo"><h1>TÉRMINOS DE REFERENCIA</h1><p>Parámetros generales del proyecto. Se guardan automáticamente y alimentan los módulos de residuos sólidos y de diseño del relleno.</p></div>'+CONV+
    '<div class="tr-acciones"><button type="button" class="btn-limpiar-tr" onclick="limpiarProyectoTR_RS()">Limpiar proyecto</button></div>';
  TR_RS.tarjetas.slice().sort(function(a,b){return a.orden-b.orden;}).forEach(function(t){h+='<div data-tr="'+t.id+'" style="display:contents">'+t.pintar()+'</div>';});
  gid("pane-terminos_referencia_RS").innerHTML=h;}

/* ==========================================================
   3. LIMPIAR PROYECTO Y COMPLETITUD
   ========================================================== */
function limpiarProyectoTR_RS(){
  confirmarModal('Limpiar proyecto','Se borrarán todos los datos del relleno sanitario (términos de referencia, proyección, caracterización, metas y tramos). Esta acción no se puede deshacer.\n\nSi quieres conservarlos, primero usa "Guardar mi proyecto" en el inicio.',function(){
    borrarProyectoLocal();},'Limpiar todo',true);}

/* Completitud: todos los términos necesarios definidos */
function trCompleto_RS(PRO){
  var req=["anioIni","duracion","rsConfianza","rsError","rsP","rsPersonas","rsHabViv","rsDiasMuestreo","rsPesoMuestra","rsPPC",
    "rsArea","rsNiveles","rsHCelda","rsDensComp","rsRhoBent","rsRollo","rsProdEsp","rsFpLix","rsN","rsSmin","rsVmin","rsVmax","rsDmin",
    "rsDias","rsBL","rsHPis","rsTalud","rsRelLA","rsFb","rsL0","rsCH4","rsEfCap","rsFpGas","rsSepPozos","rsQPozo","rsSepCond"];
  req.push("rsPobProy");
  return !!(PRO.diseñador&&PRO.nombrePob)&&req.every(function(k){return esPos(PRO[k]);});}

/* ==========================================================
   4. ADVERTENCIAS POR TARJETA
   ========================================================== */
/* Avisos de una tarjeta (id) o de todas (sin id) */
function avisosTR_RS(id){
  var ts=TR_RS.tarjetas.filter(function(t){return !id||t.id===id;}),e=[];
  ts.forEach(function(t){try{e=e.concat(t.avisos()||[]);}catch(_){}});return e;}

var _trTarjeta_RS=null;
['input','change'].forEach(function(ev){document.addEventListener(ev,function(e){
  var t=e.target&&e.target.closest?e.target.closest('#pane-terminos_referencia_RS [data-tr]'):null;
  if(t)_trTarjeta_RS=t.getAttribute('data-tr');},true);});

function recalcularTR_RS(){
  var id=_trTarjeta_RS,e=id?avisosTR_RS(id):[];
  pintarTerminosReferencia_RS();
  var t=TR_RS.tarjetas.filter(function(x){return x.id===id;})[0];
  if(e.length&&t)abrirAdvertencia("Advertencia — "+t.titulo,e);}

/* ==========================================================
   5. VALORES INICIALES
   ========================================================== */
/* Valores iniciales: vacíos (los ingresa el diseñador o se cargan desde un proyecto .json) */
var VALORES_TR_RS={
  diseñador:"",nombrePob:"",anioIni:"",duracion:"",rsPobProy:"",
  rsAnioEstudio:"",rsConfianza:"",rsError:"",rsP:"",rsPersonas:"",rsHabViv:"",rsDiasMuestreo:"",rsPesoMuestra:"",
  rsPPC:"",rsVarPPC:"",rsPeligrosos:"Incluir en el relleno",
  rsArea:"",rsProfTrinchera:"",rsNiveles:"",rsHCelda:"",rsHAmort:"",rsHBent:"",rsHInter:"",rsHFinal:"",rsDensComp:"",rsRhoBent:"",rsRollo:"",
  rsProdEsp:"",rsFpLix:"",rsN:"",rsSmin:"",rsVmin:"",rsVmax:"",rsDmin:"",
  rsDias:"",rsReserva:"",rsBL:"",rsHPis:"",rsTalud:"",rsRelLA:"",rsPrecip:"",rsEvap:"",rsCapTrat:"",
  rsMetGas:"LandGEM (primer orden)",rsFb:"",rsL0:"",rsK:"",rsCH4:"",rsEfCap:"",rsFpGas:"",rsSepPozos:"",rsQPozo:"",rsSepCond:"",
  rsAnioMemo:""};

/* ==========================================================
   6. REGISTRO DEL MÓDULO
   ========================================================== */
MODULOS.push({
  id:"terminos_referencia_RS",
  titulo:"Términos de referencia",
  descripcion:"Horizonte de diseño, población, muestreo, PPC y parámetros del relleno.",
  grupo:"proyecto",
  orden:2,
  icono:"tr_RS",
  iconoSvg:"<rect x=\"6\" y=\"4\" width=\"12\" height=\"17\" rx=\"2\"/><path d=\"M9 4h6v3H9z\"/><path d=\"m9.5 14 2 2 3.5-4\"/>",
  valores:VALORES_TR_RS,
  indicador:true,
  imprimible:true,
  normalizar:function(PRO){
    normFix("rsPeligrosos",PELIGROSOS_RS,PELIGROSOS_RS[0]);
    normFix("rsMetGas",METODOS_GAS_RS,METODOS_GAS_RS[0]);
    if(PRO.rsConfianza!==""&&!DP_RS.zAlfa(PRO.rsConfianza))PRO.rsConfianza="";},
  completo:trCompleto_RS,
  pintar:pintarTerminosReferencia_RS,
  recalcular:recalcularTR_RS,
  errores:function(){return avisosTR_RS();}
});
