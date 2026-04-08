var BRAND = "IDENTIDAD COMPLETA: CARMEN VICTORIA PARDO (@soycarmenvictoriapardo). Comunicadora, publicista, productora televisiva, escritora y mentora. Venezolana. Miami, Doral FL. 30 anos. 2 Emmy Suncoast. UCAB Venezuela. RCTV (Gerente Variedades), HBO Latinoamerica, Globovision, Televen, Univision, Telemundo, Discovery (Visa, J&J, McDonalds, Samsung, Walmart, Toyota). Co-autora Jugando a ser Dios (Grupo J3V). Serie De Milagro en Milagro. HISTORIAS REALES: (1) Nevera vacia, presento 3 propuestas, firmo su casa 2 anos despues. (2) Se encerro en el bano antes de salir al aire por primera vez. (3) Paso de facturacion solida a cero por resistirse a lo digital. (4) Oracion del embarazo: ahora te toca alimentar a dos, recibio 3 llamadas en 24h. (5) Mujer de las latas: No mires nunca abajo. Mira hacia arriba que ahi esta Dios. (6) Linaje consciente: abuela=disfrute y ahorro, madre=amor, padre=vision grande. 5 MOVIMIENTOS: 1-Conciencia 2-Ruptura 3-Estructura 4-Ejecucion con enfoque 5-Diferenciacion. FRASE CENTRAL: El exito sin sistema es emocion. El exito con sistema es expansion. AUDIENCIA: Latinas emprendedoras 35-55, ejecutivos latinos en USA, bilingue, Doral/Miami-Dade. VOZ: directa, con fe, sin victimismo, con sistema, con historia real. NUNCA: Hoy quiero compartir, Es importante, motivacion vacia, frases genericas.";

var FMAP = {
  confesional: "Hook Confesional: empieza en el MEDIO del conflicto, max 80 chars primera linea, detalles sensoriales, vulnerabilidad real.",
  transformacion: "2 Frases Transformacion: ANTES en 1 frase, DESPUES en 1 frase, que cambio en el medio, leccion, CTA.",
  pas: "PAS Espiritual: Problema concreto, Amplificacion consecuencia emocional, Solucion con alma y fe.",
  "4p": "4P Alto Ticket: Promise resultado audaz, Picture futuro vivido, Proof Emmy 30 anos historias, Push urgencia real.",
  aida: "AIDA 2026: Atencion para el scroll, Interes conecta con realidad del lector, Deseo estado deseado concreto, Accion.",
  hormozi: "Hormozi: VALOR GRATUITO masivo primero, oferta solo si quieren ir mas rapido. Directo sin motivacion vacia.",
  brene: "Brene Brown: confesion de imperfeccion real, insight que la valida, verdad universal, llamado a la valentia.",
  shetty: "Jay Shetty: verdad contraintuitiva, historia o metafora, principio aplicable, CTA de reflexion.",
  auto: "IA elige la mejor formula segun el contexto. Explica en 1 linea que elegiste y por que."
};

var PRMAP = {
  instagram: "Instagram 2026: primera linea max 80 chars, indexa en Google usar keywords naturales, parrafos cortos, 5-8 hashtags al final, CTA, 1-2 emojis por bloque.",
  facebook: "Facebook: audiencia 35-65, mas texto ok, compartir es la metrica, historia completa funciona, CTA conversacional.",
  tiktok: "TikTok: GUION ORAL, primeros 3 seg todo, frases cortas, directo a camara, caption max 150 chars mas 2-3 hashtags.",
  linkedin: "LinkedIn: insight profesional en primera linea, parrafos 1-2 lineas, credenciales si Emmy 30 anos, hashtags profesionales."
};

var selPlatVal = "instagram";
var selGPVal = "instagram reel";
var selHPVal = "instagram";
var sessionHistory = [];
var currentResults = [];

function goTab(id, btn) {
  document.querySelectorAll(".tab").forEach(function(t) { t.classList.remove("active"); });
  document.querySelectorAll(".nav-btn").forEach(function(b) { b.classList.remove("active"); });
  document.getElementById("tab-" + id).classList.add("active");
  if (btn) btn.classList.add("active");
  if (id === "historial") renderHist();
}

function selPlat(el) {
  document.querySelectorAll("#plat-grid .plat-btn").forEach(function(b) { b.classList.remove("sel"); });
  el.classList.add("sel");
  selPlatVal = el.dataset.p;
}

function selGP(el) {
  document.querySelectorAll("#gp1,#gp2,#gp3").forEach(function(b) { b.classList.remove("sel"); });
  el.classList.add("sel");
  selGPVal = el.dataset.p;
}

function selHP(el) {
  document.querySelectorAll("#hplat-grid .plat-btn").forEach(function(b) { b.classList.remove("sel"); });
  el.classList.add("sel");
  selHPVal = el.dataset.p;
}

function selChip(el, grid) {
  document.querySelectorAll("#" + grid + " .chip").forEach(function(b) { b.classList.remove("sel"); });
  el.classList.add("sel");
}

function getChip(grid) {
  var s = document.querySelector("#" + grid + " .chip.sel");
  return s ? (s.dataset.t || s.dataset.f || s.dataset.c || "") : "";
}

async function callAPI(system, userMsg, maxTok) {
  if (!maxTok) maxTok = 1200;
  var resp = await fetch("/api/claude", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: maxTok,
      system: system,
      messages: [{ role: "user", content: userMsg }]
    })
  });
  var data = await resp.json();
  if (data.error) throw new Error(data.error.message || "Error de API");
  return data.content.map(function(i) { return i.text || ""; }).join("");
}

function setBtn(id, loading, label) {
  var b = document.getElementById(id);
  if (loading) {
    b.disabled = true;
    b.innerHTML = '<span class="spinner"></span> Generando...';
  } else {
    b.disabled = false;
    b.innerHTML = label || "Generar";
  }
}

function saveCopy(idx) {
  var c = currentResults[idx];
  if (!c || c.saved) return;
  sessionHistory.unshift({
    id: Date.now() + idx,
    label: c.label,
    copy: c.copy,
    plat: selPlatVal,
    formula: getChip("formula-grid") || "auto",
    tipo: getChip("tipo-grid") || "post",
    ctx: (document.getElementById("ctx-copy").value || "").slice(0, 80),
    fecha: new Date().toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" }),
    expanded: false
  });
  c.saved = true;
  document.getElementById("hbadge").textContent = sessionHistory.length;
  var b = document.getElementById("sbtn-" + idx);
  if (b) { b.textContent = "Guardado"; b.disabled = true; }
}

function saveAll() {
  currentResults.forEach(function(_, i) { saveCopy(i); });
}

function copyText(elId) {
  var el = document.getElementById(elId);
  if (!el) return;
  navigator.clipboard.writeText(el.innerText).then(function() {
    var b = document.getElementById("cbtn-" + elId);
    if (b) {
      var o = b.textContent;
      b.textContent = "Copiado!";
      setTimeout(function() { b.textContent = o; }, 1500);
    }
  });
}

async function genCopy() {
  var ctx = document.getElementById("ctx-copy").value.trim();
  if (!ctx) {
    document.getElementById("out-copy").innerHTML = '<p style="color:#A32D2D;font-size:13px;margin-top:10px;">Escribe tu contexto primero.</p>';
    return;
  }
  var plat = selPlatVal;
  var tipo = getChip("tipo-grid") || "post feed";
  var formula = getChip("formula-grid") || "confesional";
  var obj = document.getElementById("obj-copy").value;
  var tono = document.getElementById("tono-copy").value;
  setBtn("btn-copy", true);
  document.getElementById("out-copy").innerHTML = "";
  currentResults = [];

  var sys = "Eres el generador de copywriting de CARMEN VICTORIA PARDO. " + BRAND + " FORMULA: " + (FMAP[formula] || FMAP.auto) + " PLATAFORMA: " + (PRMAP[plat] || PRMAP.instagram) + " OBJETIVO: " + obj + " TONO: " + tono + " TIPO: " + tipo + " Genera EXACTAMENTE 3 versiones distintas en la VOZ EXACTA de Carmen Victoria. NUNCA uses frases genericas de IA. Devuelve SOLO JSON sin markdown: {\"copies\":[{\"label\":\"Version 1\",\"movimiento\":\"[1 de los 5 movimientos]\",\"copy\":\"texto\"},{\"label\":\"Version 2\",\"movimiento\":\"[movimiento]\",\"copy\":\"texto\"},{\"label\":\"Version 3\",\"movimiento\":\"[movimiento]\",\"copy\":\"texto\"}]}";

  try {
    var raw = await callAPI(sys, "Contexto: " + ctx);
    var parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
    currentResults = parsed.copies.map(function(c) { return Object.assign({}, c, { saved: false }); });
    var html = '<hr class="divider"><div style="display:flex;justify-content:flex-end;margin-bottom:10px;"><button class="outline-btn" onclick="saveAll()">Guardar todos</button></div>';
    currentResults.forEach(function(c, i) {
      var eid = "ctext-" + i;
      html += '<div class="card"><div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px;align-items:center"><span class="tag-p">' + c.label + '</span><span class="mov">' + c.movimiento + '</span></div><div class="ctext" id="' + eid + '">' + c.copy + '</div><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px;"><button class="outline-btn" id="cbtn-' + eid + '" onclick="copyText(\'' + eid + '\')">Copiar</button><button class="outline-btn" id="sbtn-' + i + '" onclick="saveCopy(' + i + ')">Guardar</button></div></div>';
    });
    document.getElementById("out-copy").innerHTML = html;
  } catch(e) {
    document.getElementById("out-copy").innerHTML = '<p style="color:#A32D2D;font-size:13px;margin-top:10px;">Error: ' + e.message + '</p>';
  }
  setBtn("btn-copy", false, "Generar copy");
}

async function genGuion() {
  var ctx = document.getElementById("ctx-guion").value.trim();
  if (!ctx) {
    document.getElementById("out-guion").innerHTML = '<p style="color:#A32D2D;font-size:13px;margin-top:10px;">Escribe tu idea primero.</p>';
    return;
  }
  var plat = selGPVal;
  var dur = document.getElementById("dur-guion").value;
  var obj = document.getElementById("obj-guion").value;
  setBtn("btn-guion", true);
  document.getElementById("out-guion").innerHTML = "";

  var sys = "Eres el director de contenido de CARMEN VICTORIA PARDO. " + BRAND + " Crea un guion de video COMPLETO para " + plat + ", duracion " + dur + ", objetivo: " + obj + ". Estructura por ESCENAS con tiempo exacto, texto oral exacto en voz de Carmen Victoria, nota de direccion. Devuelve SOLO JSON sin markdown: {\"titulo\":\"titulo\",\"hook_segundos\":3,\"duracion_total\":\"" + dur + "\",\"escenas\":[{\"seg\":\"0-3s\",\"oral\":\"texto exacto\",\"direccion\":\"indicacion\"}],\"caption\":\"texto del caption\",\"hashtags\":[\"#tag1\"],\"cta\":\"CTA final\",\"movimiento\":\"movimiento que activa\",\"formula\":\"formula usada\"}";

  try {
    var raw = await callAPI(sys, "Idea: " + ctx, 1400);
    var g = JSON.parse(raw.replace(/```json|```/g, "").trim());
    var html = '<hr class="divider"><div class="card">';
    html += '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px;"><span class="tag-p">' + g.titulo + '</span><span class="tag-t">Movimiento: ' + g.movimiento + '</span><span class="tag-a">Formula: ' + g.formula + '</span></div>';
    html += '<div style="font-size:12px;color:var(--text2);margin-bottom:12px;">Duracion: ' + g.duracion_total + ' &middot; Hook: primeros ' + g.hook_segundos + 's</div>';
    html += '<div style="font-size:13px;font-weight:500;margin-bottom:8px;">Escenas</div>';
    g.escenas.forEach(function(e) {
      html += '<div class="scene-card"><div style="font-size:11px;font-weight:500;color:#3C3489;margin-bottom:4px;">' + e.seg + '</div><div style="font-size:13px;font-weight:500;margin-bottom:4px;">"' + e.oral + '"</div><div style="font-size:12px;color:var(--text2);">Direccion: ' + e.direccion + '</div></div>';
    });
    var capId = "guion-cap";
    html += '<div style="margin-top:14px;"><div style="font-size:13px;font-weight:500;margin-bottom:6px;">Caption</div><div class="ctext" id="' + capId + '" style="background:var(--bg2);padding:12px;border-radius:var(--radius);">' + g.caption + '\n\n' + g.hashtags.join(' ') + '</div><div style="display:flex;gap:8px;margin-top:8px;"><button class="outline-btn" id="cbtn-' + capId + '" onclick="copyText(\'' + capId + '\')">Copiar caption</button></div></div></div>';
    document.getElementById("out-guion").innerHTML = html;
  } catch(e) {
    document.getElementById("out-guion").innerHTML = '<p style="color:#A32D2D;font-size:13px;margin-top:10px;">Error: ' + e.message + '</p>';
  }
  setBtn("btn-guion", false, "Generar guion");
}

async function genIdea() {
  var ctx = document.getElementById("ctx-idea").value.trim();
  if (!ctx) {
    document.getElementById("out-idea").innerHTML = '<p style="color:#A32D2D;font-size:13px;margin-top:10px;">Escribe tu idea primero.</p>';
    return;
  }
  setBtn("btn-idea", true);
  document.getElementById("out-idea").innerHTML = "";

  var sys = "Eres el estratega de contenido de CARMEN VICTORIA PARDO. " + BRAND + " Analiza la idea en bruto y devuelve SOLO JSON sin markdown: {\"movimiento\":\"nombre\",\"razon_movimiento\":\"por que encaja\",\"plataformas\":[{\"plat\":\"nombre\",\"razon\":\"por que\"}],\"formulas\":[{\"formula\":\"nombre\",\"razon\":\"por que\"}],\"contexto_listo\":\"el contexto pulido para el generador\",\"hooks\":[\"hook1\",\"hook2\"]}";

  try {
    var raw = await callAPI(sys, "Idea: " + ctx, 800);
    var r = JSON.parse(raw.replace(/```json|```/g, "").trim());
    var html = '<hr class="divider"><div class="card">';
    html += '<div style="margin-bottom:12px;"><span class="tag-p">Movimiento ' + r.movimiento + '</span><span style="font-size:13px;color:var(--text2);margin-left:8px;">' + r.razon_movimiento + '</span></div>';
    html += '<div style="margin-bottom:12px;"><div style="font-size:13px;font-weight:500;margin-bottom:6px;">Mejores plataformas</div>' + r.plataformas.map(function(p) { return '<div style="font-size:13px;margin-bottom:4px;"><span class="tag-b">' + p.plat + '</span> <span style="color:var(--text2);">' + p.razon + '</span></div>'; }).join('') + '</div>';
    html += '<div style="margin-bottom:12px;"><div style="font-size:13px;font-weight:500;margin-bottom:6px;">Formulas recomendadas</div>' + r.formulas.map(function(f) { return '<div style="font-size:13px;margin-bottom:4px;"><span class="tag-t">' + f.formula + '</span> <span style="color:var(--text2);">' + f.razon + '</span></div>'; }).join('') + '</div>';
    html += '<div style="margin-bottom:12px;"><div style="font-size:13px;font-weight:500;margin-bottom:6px;">Hooks sugeridos</div>' + r.hooks.map(function(h) { return '<div style="font-size:13px;background:var(--bg2);padding:8px 12px;border-radius:var(--radius);margin-bottom:6px;font-style:italic;">"' + h + '"</div>'; }).join('') + '</div>';
    var ctxId = "idea-ctx";
    html += '<div><div style="font-size:13px;font-weight:500;margin-bottom:6px;">Contexto listo para el generador</div><div class="ctext" id="' + ctxId + '" style="background:var(--bg2);padding:12px;border-radius:var(--radius);">' + r.contexto_listo + '</div><div style="display:flex;gap:8px;margin-top:8px;"><button class="outline-btn" id="cbtn-' + ctxId + '" onclick="copyText(\'' + ctxId + '\')">Copiar</button></div></div></div>';
    document.getElementById("out-idea").innerHTML = html;
  } catch(e) {
    document.getElementById("out-idea").innerHTML = '<p style="color:#A32D2D;font-size:13px;margin-top:10px;">Error: ' + e.message + '</p>';
  }
  setBtn("btn-idea", false, "Analizar y desarrollar idea");
}

async function genVoz() {
  var ctx = document.getElementById("ctx-voz").value.trim();
  if (!ctx) {
    document.getElementById("out-voz").innerHTML = '<p style="color:#A32D2D;font-size:13px;margin-top:10px;">Pega el copy a verificar.</p>';
    return;
  }
  setBtn("btn-voz", true);
  document.getElementById("out-voz").innerHTML = "";

  var sys = "Eres el guardian de la voz de marca de CARMEN VICTORIA PARDO. " + BRAND + " Analiza el copy y devuelve SOLO JSON sin markdown: {\"score\":85,\"nivel\":\"Alto / Medio / Bajo\",\"aspectos_ok\":[\"lo que si esta en voz\"],\"aspectos_fuera_de_voz\":[\"lo que no encaja\"],\"frases_problematicas\":[{\"original\":\"frase\",\"problema\":\"por que\",\"correccion\":\"como sonaria en voz de CV\"}],\"version_corregida\":\"el copy completo reescrito en voz perfecta de Carmen Victoria\"}";

  try {
    var raw = await callAPI(sys, "Copy a verificar: " + ctx, 900);
    var r = JSON.parse(raw.replace(/```json|```/g, "").trim());
    var sc = r.score;
    var scoreColor = sc >= 80 ? "#1D9E75" : sc >= 60 ? "#BA7517" : "#A32D2D";
    var barColor = sc >= 80 ? "#5DCAA5" : sc >= 60 ? "#EF9F27" : "#E24B4A";
    var nivelCls = sc >= 80 ? "tag-t" : sc >= 60 ? "tag-a" : "tag-c";
    var html = '<hr class="divider"><div class="card">';
    html += '<div style="display:flex;align-items:center;gap:16px;margin-bottom:16px;"><div style="text-align:center;"><div class="snum" style="color:' + scoreColor + ';">' + sc + '</div><div style="font-size:12px;color:var(--text2);">/ 100</div></div><div style="flex:1;"><div style="display:flex;justify-content:space-between;margin-bottom:4px;"><span style="font-size:13px;font-weight:500;">Fidelidad de voz</span><span class="' + nivelCls + '" style="font-size:11px;padding:2px 8px;border-radius:20px;">' + r.nivel + '</span></div><div class="sbar-wrap"><div class="sbar" style="width:' + sc + '%;background:' + barColor + ';"></div></div></div></div>';
    if (r.aspectos_ok && r.aspectos_ok.length) {
      html += '<div style="margin-bottom:12px;"><div style="font-size:13px;font-weight:500;margin-bottom:6px;">Lo que suena bien</div>' + r.aspectos_ok.map(function(a) { return '<div class="fi fi-ok">' + a + '</div>'; }).join('') + '</div>';
    }
    if (r.aspectos_fuera_de_voz && r.aspectos_fuera_de_voz.length) {
      html += '<div style="margin-bottom:12px;"><div style="font-size:13px;font-weight:500;margin-bottom:6px;">Fuera de voz</div>' + r.aspectos_fuera_de_voz.map(function(a) { return '<div class="fi fi-warn">' + a + '</div>'; }).join('') + '</div>';
    }
    if (r.frases_problematicas && r.frases_problematicas.length) {
      html += '<div style="margin-bottom:12px;"><div style="font-size:13px;font-weight:500;margin-bottom:8px;">Correcciones</div>' + r.frases_problematicas.map(function(f) { return '<div style="margin-bottom:8px;"><div class="fi fi-fix"><strong>Original:</strong> "' + f.original + '"<br><span style="font-size:12px;">' + f.problema + '</span></div><div class="fi fi-ok" style="margin-top:4px;"><strong>Correccion:</strong> "' + f.correccion + '"</div></div>'; }).join('') + '</div>';
    }
    var cvId = "voz-corrected";
    html += '<div><div style="font-size:13px;font-weight:500;margin-bottom:6px;">Version corregida</div><div class="ctext" id="' + cvId + '" style="background:var(--bg2);padding:12px;border-radius:var(--radius);">' + r.version_corregida + '</div><div style="display:flex;gap:8px;margin-top:8px;"><button class="outline-btn" id="cbtn-' + cvId + '" onclick="copyText(\'' + cvId + '\')">Copiar version corregida</button></div></div></div>';
    document.getElementById("out-voz").innerHTML = html;
  } catch(e) {
    document.getElementById("out-voz").innerHTML = '<p style="color:#A32D2D;font-size:13px;margin-top:10px;">Error: ' + e.message + '</p>';
  }
  setBtn("btn-voz", false, "Verificar voz de marca");
}

async function genHashtags() {
  var plat = selHPVal;
  var cat = getChip("hcat-grid") || "coaching personal";
  setBtn("btn-hash", true);
  document.getElementById("out-hash").innerHTML = "";

  var sys = "Eres el experto SEO de CARMEN VICTORIA PARDO, activa en Miami Doral FL. " + BRAND + " Genera banco de hashtags para " + plat + ", categoria: " + cat + ". Devuelve SOLO JSON sin markdown: {\"nicho\":[\"#tag1\"],\"local_seo\":[\"#tag1\"],\"comunidad\":[\"#tag1\"],\"marca\":[\"#carmenvictoriapardo\"],\"virales_2026\":[\"#tag1\"],\"combo_recomendado\":[\"7-8 mejores combinados\"]}";

  try {
    var raw = await callAPI(sys, "Plataforma: " + plat + ", Categoria: " + cat, 600);
    var r = JSON.parse(raw.replace(/```json|```/g, "").trim());
    var allId = "all-hash";
    var html = '<hr class="divider"><div class="card">';
    var secs = [["Nicho", "nicho", "tag-p"], ["SEO local Miami-Doral", "local_seo", "tag-b"], ["Comunidad latina", "comunidad", "tag-t"], ["Marca personal", "marca", "tag-c"], ["Virales 2026", "virales_2026", "tag-a"]];
    secs.forEach(function(s) {
      var label = s[0], key = s[1], cls = s[2];
      if (r[key] && r[key].length) {
        html += '<div style="margin-bottom:12px;"><div style="font-size:12px;font-weight:500;color:var(--text2);margin-bottom:6px;">' + label + '</div>' + r[key].map(function(h) { return '<span class="hpill" onclick="copyHash(\'' + h + '\')">' + h + '</span>'; }).join('') + '</div>';
      }
    });
    html += '<div style="margin-top:14px;"><div style="font-size:13px;font-weight:500;margin-bottom:6px;">Combo recomendado</div><div class="ctext" id="' + allId + '" style="background:var(--bg2);padding:12px;border-radius:var(--radius);">' + (r.combo_recomendado || []).join(' ') + '</div><div style="margin-top:8px;"><button class="outline-btn" id="cbtn-' + allId + '" onclick="copyText(\'' + allId + '\')">Copiar combo</button></div></div></div>';
    document.getElementById("out-hash").innerHTML = html;
  } catch(e) {
    document.getElementById("out-hash").innerHTML = '<p style="color:#A32D2D;font-size:13px;margin-top:10px;">Error: ' + e.message + '</p>';
  }
  setBtn("btn-hash", false, "Generar banco de hashtags");
}

function copyHash(h) { navigator.clipboard.writeText(h); }

function renderHist() {
  var el = document.getElementById("hist-list");
  if (!sessionHistory.length) {
    el.innerHTML = '<div class="empty-state">Aun no has guardado copys.<br>Genera y presiona Guardar en cualquier resultado.</div>';
    return;
  }
  el.innerHTML = sessionHistory.map(function(h, i) {
    return '<div style="background:var(--bg);border:0.5px solid var(--border);border-radius:var(--radius-lg);padding:12px 14px;margin-bottom:10px;"><div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-bottom:6px;"><span class="tag-b" style="font-size:11px;padding:2px 8px;">' + h.plat + '</span><span class="tag-p" style="font-size:11px;padding:2px 8px;">' + h.formula + '</span><span style="font-size:11px;color:var(--text3);">' + h.fecha + '</span></div><div style="font-size:11px;color:var(--text3);margin-bottom:4px;">"' + h.ctx + (h.ctx.length >= 80 ? '...' : '') + '"</div><div class="hist-preview ' + (h.expanded ? 'exp' : '') + '">' + h.copy + '</div><div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px;"><button class="outline-btn" onclick="copyHistIdx(' + i + ')">Copiar</button><button class="outline-btn" onclick="toggleH(' + i + ')">' + (h.expanded ? 'Ver menos' : 'Ver completo') + '</button><button class="outline-btn del-btn" onclick="delHist(' + i + ')">Eliminar</button></div></div>';
  }).join('');
}

function copyHistIdx(i) { navigator.clipboard.writeText(sessionHistory[i].copy); }
function toggleH(i) { sessionHistory[i].expanded = !sessionHistory[i].expanded; renderHist(); }
function delHist(i) { sessionHistory.splice(i, 1); document.getElementById("hbadge").textContent = sessionHistory.length; renderHist(); }
function clearAll() { sessionHistory = []; document.getElementById("hbadge").textContent = 0; renderHist(); }
