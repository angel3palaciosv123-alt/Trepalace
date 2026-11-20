/* ==========================================================
   RS · TÉRMINOS DE REFERENCIA — rangos  (rangos.js)
   Rangos de validación (se consultan como TR_RS.R.<clave>) y registro de tarjetas.
   Los rangos de diseño salen de DP_RS (valores de referencia); aquí solo se enlazan
   con la clave de PRO que validan.
   ========================================================== */

/* ==========================================================
   1. RANGOS Y REGISTRO DE TARJETAS
   ========================================================== */
var TR_RS={
  /* clave de PRO: [mínimo, máximo, etiqueta, unidad, decimales] */
  R:{
    duracion:[1,60,"Vida útil del relleno","años",0],
    rsError:[0.01,0.1,"Error aceptado e","",3],
    rsP:[0.05,0.95,"Probabilidad de éxito p","",2],
    rsHabViv:[1,10,"Habitantes por vivienda","hab",1],
    rsDiasMuestreo:[1,8,"Días de muestreo","días",0],
    rsVarPPC:[-0.05,0.05,"Variación anual de la PPC","",3],
    rsHCelda:[DP_RS.T.CELDAS.hCelda.min,DP_RS.T.CELDAS.hCelda.max,"Altura de la celda","m",2],
    rsHAmort:[DP_RS.T.CELDAS.hAmort.min,DP_RS.T.CELDAS.hAmort.max,"Capa de amortiguamiento","m",2],
    rsHBent:[DP_RS.T.CELDAS.hBent.min,DP_RS.T.CELDAS.hBent.max,"Capa de bentonita","m",2],
    rsHInter:[DP_RS.T.CELDAS.hInter.min,DP_RS.T.CELDAS.hInter.max,"Cobertura intermedia","m",2],
    rsHFinal:[DP_RS.T.CELDAS.hFinal.min,DP_RS.T.CELDAS.hFinal.max,"Cobertura final","m",2],
    rsDensComp:[DP_RS.T.CELDAS.densidad.min,DP_RS.T.CELDAS.densidad.max,"Densidad de compactación","t/m³",2],
    rsRhoBent:[DP_RS.T.CELDAS.rhoBent.min,DP_RS.T.CELDAS.rhoBent.max,"Peso unitario de la bentonita","t/m³",2],
    rsProdEsp:[DP_RS.T.LIX.prodEsp.min,DP_RS.T.LIX.prodEsp.max,"Producción específica de lixiviado","m³/t",2],
    rsFpLix:[DP_RS.T.LIX.fp.min,DP_RS.T.LIX.fp.max,"Factor de punta de lixiviados","",1],
    rsN:[DP_RS.T.LIX.n.min,DP_RS.T.LIX.n.max,"Rugosidad de Manning","",3],
    rsSmin:[DP_RS.T.LIX.Smin.min,DP_RS.T.LIX.Smin.max,"Pendiente mínima","m/m",3],
    rsDias:[DP_RS.T.PIS.dias.min,DP_RS.T.PIS.dias.max,"Días de autonomía","días",0],
    rsReserva:[DP_RS.T.PIS.reserva.min,DP_RS.T.PIS.reserva.max,"Reserva de contingencia","",2],
    rsBL:[DP_RS.T.PIS.bl.min,DP_RS.T.PIS.bl.max,"Bordo libre","m",2],
    rsHPis:[DP_RS.T.PIS.h.min,DP_RS.T.PIS.h.max,"Profundidad útil","m",1],
    rsTalud:[DP_RS.T.PIS.z.min,DP_RS.T.PIS.z.max,"Talud interior","H:1V",1],
    rsRelLA:[DP_RS.T.PIS.rel.min,DP_RS.T.PIS.rel.max,"Relación largo / ancho","",1],
    rsFb:[DP_RS.T.GAS.fb.min,DP_RS.T.GAS.fb.max,"Fracción biodegradable","",2],
    rsL0:[DP_RS.T.GAS.L0.min,DP_RS.T.GAS.L0.max,"Potencial de metano L0","m³/t",0],
    rsK:[DP_RS.T.GAS.k.min,DP_RS.T.GAS.k.max,"Constante k","1/año",3],
    rsCH4:[DP_RS.T.GAS.ch4.min,DP_RS.T.GAS.ch4.max,"Fracción de metano","",2],
    rsEfCap:[DP_RS.T.GAS.ef.min,DP_RS.T.GAS.ef.max,"Eficiencia de captación","",2],
    rsFpGas:[DP_RS.T.GAS.fp.min,DP_RS.T.GAS.fp.max,"Factor de punta de biogás","",1],
    rsSepPozos:[DP_RS.T.GAS.sep.min,DP_RS.T.GAS.sep.max,"Separación entre pozos","m",0]
  },
  /* Mensaje si PRO[k] está lleno y fuera de rango */
  fuera:function(k){
    var r=TR_RS.R[k];if(!r||PRO[k]===""||PRO[k]===null||PRO[k]===undefined)return null;
    var v=Number(PRO[k]);
    if(!isFinite(v)||v<r[0]-1e-12||v>r[1]+1e-12)return r[2]+" = "+nf(v,r[4])+(r[3]?" "+r[3]:"")+" está fuera del rango "+nf(r[0],r[4])+" – "+nf(r[1],r[4])+(r[3]?" "+r[3]:"")+".";
    return null;},
  tarjetas:[],
  registrarTarjeta:function(def){TR_RS.tarjetas.push(def);}
};
