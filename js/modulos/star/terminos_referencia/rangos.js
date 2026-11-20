/* ==========================================================
   VENTANA 1 — TÉRMINOS DE REFERENCIA · rangos  (rangos.js)
   Rangos y criterios normativos: se consultan como TR_STAR.R.<nombre>
   ========================================================== */

/* ==========================================================
   1. RANGOS Y REGISTRO DE TARJETAS
   ========================================================== */

var TR_STAR={
  R:{
    R_RANGO:[0.7,0.9],        /* coeficiente de retorno R (RAS) */
    VF_RANGO:[0,0.15],        /* velocidad efectiva del flujo en la rejilla Vf (m/s) */
    PEND_ADU:[0.14,0.16],     /* pendiente de aducción S (m/m) */
    BL_ADU:[0.30,0.50],       /* borde libre de aducción BL (m) */
    VO_MIN:0.5                /* velocidad horizontal mínima Vo (m/s) */
  },
  rango:function(nombre){ return TR_STAR.R[nombre]; },

  /* Registro de tarjetas de parámetros. Cada tarjeta recoge los términos de referencia de una unidad. */
  tarjetas:[],
  registrarTarjeta:function(def){ TR_STAR.tarjetas.push(def); }
};
