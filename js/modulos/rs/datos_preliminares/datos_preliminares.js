/* ==========================================================
   RS · DATOS PRELIMINARES — ventana  (datos_preliminares.js)
   Requiere: bloques de tablas.js
   ========================================================== */

/* ==========================================================
   1. VENTANA (tablas de referencia)
   ========================================================== */
function pintarDatosPreliminares_RS(){
  var bloques=[bloqueComplejidad_RS(),bloqueMetodos_RS(),bloquePPC_RS(),bloqueF15_RS(),bloqueConfianza_RS(),bloqueCaracSin_RS(),bloqueCaracCon_RS(),
    bloqueCeldas_RS(),bloqueLixiviados_RS(),bloquePiscinas_RS(),bloqueGases_RS()];
  gid("pane-datos_preliminares_RS").innerHTML=
    '<div class="titulo"><h1>DATOS PRELIMINARES</h1><p>Tablas base del RAS utilizadas para el diseño del relleno sanitario. Son valores de referencia normativa, no editables.</p></div>'+
    bloques.join("");}

/* ==========================================================
   2. REGISTRO DEL MÓDULO
   ========================================================== */
MODULOS.push({
  id:"datos_preliminares_RS",
  titulo:"Datos preliminares",
  descripcion:"Tablas del RAS: nivel de complejidad, PPC, caracterización, peso unitario y humedad.",
  grupo:"proyecto",
  orden:1,
  icono:"db_RS",
  iconoSvg:"<ellipse cx=\"12\" cy=\"5.5\" rx=\"7\" ry=\"3\"/><path d=\"M5 5.5v6c0 1.66 3.13 3 7 3s7-1.34 7-3v-6M5 11.5v6c0 1.66 3.13 3 7 3s7-1.34 7-3v-6\"/>",
  valores:{},
  imprimible:true,
  normalizar:function(PRO){},
  completo:function(PRO){return true;},
  pintar:pintarDatosPreliminares_RS
});
