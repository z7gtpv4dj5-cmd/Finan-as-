// ============================================================
//  MEU DINHEIRO v2 — código do app (carregado automaticamente)
//  Este arquivo é compilado para app.bundle.js e baixado pelo
//  carregador (App.js) que fica no Snack/Expo Go.
//
//  Regra do orçamento:
//  Salário + extras − Fixos − Mercado − Cartão compras grandes
//  − Investimento/Reserva (20%) = SALDO
//  SALDO ÷ dias do mês = limite por dia (dia a dia / besteiras)
//  Gastou mais que o limite? O excesso come os próximos dias.
// ============================================================
function __factory(React, RN, AsyncStorage) {
  var useState = React.useState, useEffect = React.useEffect, useMemo = React.useMemo;
  var View = RN.View, Text = RN.Text, TextInput = RN.TextInput, TouchableOpacity = RN.TouchableOpacity;
  var ScrollView = RN.ScrollView, StyleSheet = RN.StyleSheet, SafeAreaView = RN.SafeAreaView, Alert = RN.Alert;
  var Modal = RN.Modal, KeyboardAvoidingView = RN.KeyboardAvoidingView, Platform = RN.Platform, Share = RN.Share;
  var StatusBar = RN.StatusBar;

  var VERSION = '2.0 (22/11/2026)';
  var STORAGE_KEY = '@meu_dinheiro_v2';
  var OLD_KEY = '@meu_dinheiro_v1';

  // ---------- Cores ----------
  var C = {
    bg: '#0B0F14', card: '#151B23', card2: '#1C2430', border: '#263040',
    text: '#E8EEF5', muted: '#8A97A8', green: '#22C55E', red: '#EF4444',
    yellow: '#F59E0B', blue: '#3B82F6', purple: '#A855F7',
  };

  // ---------- Categorias ----------
  var DIA_CATS = [
    { id: 'lanche', label: 'Lanche', icon: '🍔' },
    { id: 'delivery', label: 'Delivery', icon: '🛵' },
    { id: 'cafe', label: 'Café', icon: '☕' },
    { id: 'doces', label: 'Doces', icon: '🍫' },
    { id: 'bebida', label: 'Bebida', icon: '🍺' },
    { id: 'apps', label: 'Apps/Jogos', icon: '📱' },
    { id: 'comprinhas', label: 'Comprinhas', icon: '🛍️' },
    { id: 'lazer', label: 'Lazer', icon: '🎉' },
    { id: 'combustivel', label: 'Combustível', icon: '⛽' },
    { id: 'uber', label: 'Uber/Ônibus', icon: '🚕' },
    { id: 'farmacia', label: 'Farmácia', icon: '💊' },
    { id: 'roupas', label: 'Roupas', icon: '👕' },
    { id: 'presentes', label: 'Presentes', icon: '🎁' },
    { id: 'outros', label: 'Outros', icon: '📦' },
  ];
  var OTHER_CATS = [
    { id: 'mercado', label: 'Mercado', icon: '🛒' },
    { id: 'grande', label: 'Compra grande', icon: '🛋️' },
    { id: 'extra', label: 'Receita extra', icon: '💰' },
  ];
  var QUICK_CATS = ['lanche', 'delivery', 'cafe', 'doces', 'bebida', 'outros'];
  var QUICK_VALUES = [5, 10, 15, 20, 30, 40, 50, 70];
  var GOAL_ICONS = ['🛟', '📈', '🏠', '🚗', '🏍️', '✈️', '🎓', '💻', '🎯'];
  var FIXED_ICONS = ['💡', '💧', '🌐', '🏠', '🏍️', '🚗', '📱', '📺', '🏋️', '🎓', '🐶', '🧾'];

  var GROUPS = {
    dia: { label: 'Dia a dia', icon: '💳', color: C.red },
    mercado: { label: 'Mercado', icon: '🛒', color: C.yellow },
    grande: { label: 'Compra grande', icon: '🛋️', color: C.purple },
    extra: { label: 'Receita extra', icon: '💰', color: C.green },
  };
  var PAYS_BASE = [{ id: 'pix', label: 'Pix' }, { id: 'debito', label: 'Débito' }, { id: 'dinheiro', label: 'Dinheiro' }];
  var WEEKDAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  var MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

  var DEFAULT_FIXED = [
    { name: 'Energia', icon: '💡', varia: true },
    { name: 'Financiamento casa', icon: '🏠', varia: false },
    { name: 'Água', icon: '💧', varia: true },
    { name: 'Internet', icon: '🌐', varia: false },
    { name: 'Financiamento moto', icon: '🏍️', varia: false },
  ];
  var DEFAULT_CARDS = [
    { id: 'dia', name: 'Cartão dia a dia', role: 'dia', closingDay: 1, dueDay: 10, limit: 0 },
    { id: 'grandes', name: 'Cartão compras grandes', role: 'grandes', closingDay: 1, dueDay: 10, limit: 0 },
  ];
  var DEFAULT_SETTINGS = {
    salario: 0, investPct: 20, mercado: 0, pequeno: 30, horasMes: 176, taxaMes: 0.8,
    defaultPay: 'card:dia', grandePay: 'card:grandes',
  };
  function emptyData() {
    return { v: 2, setupDone: false, tx: [], fixed: [], fixedMonth: {}, cards: [], goals: [], settings: Object.assign({}, DEFAULT_SETTINGS) };
  }

  // ---------- Utilidades ----------
  var uid = function () { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); };
  function num(v) { var n = Number(v); return isNaN(n) ? 0 : n; }
  function fmt(v) {
    var n = Math.round((Number(v) || 0) * 100) / 100;
    var s = Math.abs(n).toFixed(2);
    var parts = s.split('.');
    var i = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return (n < 0 ? '-' : '') + 'R$ ' + i + ',' + parts[1];
  }
  function parseMoney(str) {
    if (typeof str === 'number') return str;
    var s = String(str || '').replace(/\s|R\$/g, '');
    if (s.indexOf(',') >= 0) s = s.replace(/\./g, '').replace(',', '.');
    var n = parseFloat(s);
    return isNaN(n) ? 0 : n;
  }
  function moneyStr(v) { return v ? String(Math.round(v * 100) / 100).replace('.', ',') : ''; }
  var pct = function (a, b) { return b > 0 ? (a / b) * 100 : 0; };
  var sum = function (arr, f) { f = f || function (x) { return x.amount; }; return arr.reduce(function (s, x) { return s + (Number(f(x)) || 0); }, 0); };
  var pad = function (n) { return String(n).padStart(2, '0'); };
  var mkOf = function (d0) { var d = new Date(d0); return d.getFullYear() + '-' + pad(d.getMonth() + 1); };
  var currentMk = function (now) { return mkOf(now || new Date()); };
  function addMonths(mk, n) {
    var p = mk.split('-').map(Number);
    var d = new Date(p[0], p[1] - 1 + n, 1);
    return d.getFullYear() + '-' + pad(d.getMonth() + 1);
  }
  var mkLabel = function (mk) { var p = mk.split('-').map(Number); return MONTHS[p[1] - 1] + ' ' + p[0]; };
  var daysInMonth = function (mk) { var p = mk.split('-').map(Number); return new Date(p[0], p[1], 0).getDate(); };
  var dateBR = function (iso) { var d = new Date(iso); return pad(d.getDate()) + '/' + pad(d.getMonth() + 1) + '/' + d.getFullYear(); };
  function parseDateBR(s) {
    var m = String(s || '').trim().match(/^(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?$/);
    if (!m) return null;
    var y = m[3] ? Number(m[3]) : new Date().getFullYear();
    if (y < 100) y += 2000;
    var d = new Date(y, Number(m[2]) - 1, Number(m[1]), 12, 0, 0);
    return isNaN(d.getTime()) ? null : d;
  }
  function dateInMonth(mk, day, hour) {
    var p = mk.split('-').map(Number);
    var dim = new Date(p[0], p[1], 0).getDate();
    return new Date(p[0], p[1] - 1, Math.min(Math.max(1, day || 1), dim), hour == null ? 12 : hour, 0, 0);
  }
  function catOf(id) {
    return DIA_CATS.find(function (c) { return c.id === id; }) || OTHER_CATS.find(function (c) { return c.id === id; }) || { id: id, label: id || 'Outros', icon: '•' };
  }
  var fv = function (pmt, ratePct, months) {
    var i = ratePct / 100;
    return i === 0 ? pmt * months : pmt * ((Math.pow(1 + i, months) - 1) / i);
  };
  var goalSaved = function (g) { return sum(g.moves || []); };
  function allPays(cards) {
    return PAYS_BASE.concat(cards.map(function (c) { return { id: 'card:' + c.id, label: '💳 ' + c.name }; }));
  }
  function payLabel(pay, cards) {
    if (pay && pay.indexOf('card:') === 0) {
      var c = cards.find(function (k) { return 'card:' + k.id === pay; });
      return c ? '💳 ' + c.name : '💳 Cartão';
    }
    var p = PAYS_BASE.find(function (x) { return x.id === pay; });
    return p ? p.label : '';
  }
  function plural(n, s, p) { return n === 1 ? s : p; }

  // Ciclo de fatura do cartão
  function cardCycle(card, ref) {
    ref = ref || new Date();
    var c = Number(card.closingDay) || 1;
    var y = ref.getFullYear(), m = ref.getMonth(), start, end;
    if (ref.getDate() <= c) { start = new Date(y, m - 1, c + 1); end = new Date(y, m, c, 23, 59, 59); }
    else { start = new Date(y, m, c + 1); end = new Date(y, m + 1, c, 23, 59, 59); }
    return { start: start, end: end };
  }
  function cardInfo(card, tx) {
    var cy = cardCycle(card);
    var mine = tx.filter(function (t) { return t.group !== 'extra' && t.pay === 'card:' + card.id; });
    var fatura = sum(mine.filter(function (t) { var d = new Date(t.date); return d >= cy.start && d <= cy.end; }));
    var usado = sum(mine.filter(function (t) { return new Date(t.date) >= cy.start; }));
    return { fatura: fatura, usado: usado, start: cy.start, end: cy.end };
  }

  // ---------- Gastos fixos do mês ----------
  function fixedOf(data, mk) {
    var fm = (data.fixedMonth || {})[mk] || {};
    return data.fixed.map(function (f) {
      var m = fm[f.id] || {};
      return {
        f: f, id: f.id,
        amount: m.amount != null ? Number(m.amount) : Number(f.amount) || 0,
        confirmed: !!m.confirmed || !f.varia,
        paid: !!m.paid,
      };
    });
  }

  // ============================================================
  //  CÁLCULO PRINCIPAL: orçamento do mês e limite diário
  // ============================================================
  function budget(data, mk, now) {
    now = now || new Date();
    var s = data.settings;
    var txM = data.tx.filter(function (t) { return mkOf(t.date) === mk; });
    var byG = function (g) { return txM.filter(function (t) { return t.group === g; }); };
    var salario = num(s.salario);
    var extras = sum(byG('extra'));
    var R = salario + extras;
    var fixos = fixedOf(data, mk);
    var F = sum(fixos);
    var M = num(s.mercado);
    var mercadoTx = byG('mercado').sort(function (a, b) { return new Date(a.date) - new Date(b.date); });
    var mercadoReal = sum(mercadoTx);
    var grandes = byG('grande');
    var G = sum(grandes);
    var I = (salario * num(s.investPct)) / 100;
    var saldo = R - F - M - G - I;
    var dim = daysInMonth(mk);
    var base = saldo > 0 ? saldo / dim : 0;

    // gasto do dia a dia por dia do mês (+ o que passar do orçamento do mercado)
    var perDay = [];
    for (var i = 0; i < dim; i++) perDay.push(0);
    var diaTx = byG('dia');
    diaTx.forEach(function (t) { perDay[new Date(t.date).getDate() - 1] += t.amount; });
    var acc = 0, mercadoExc = 0;
    mercadoTx.forEach(function (t) {
      var before = Math.max(0, acc - M);
      acc += t.amount;
      var exc = Math.max(0, acc - M) - before;
      if (exc > 0) { perDay[new Date(t.date).getDate() - 1] += exc; mercadoExc += exc; }
    });

    var curMk = currentMk(now);
    var isCur = mk === curMk;
    var isPast = mk < curMk;
    var today = isCur ? now.getDate() : isPast ? dim : 0;
    // mês em que começou a usar: o limite conta a partir do dia da configuração
    var start = data.startDate ? new Date(data.startDate) : null;
    var startMk = start ? mkOf(start) : null;
    var firstDay = start && startMk === mk ? start.getDate() : start && mk < startMk ? dim + 1 : 1;
    var id = function (x) { return x; };
    var diasCorridos = Math.max(0, today - firstDay + 1);
    var diasPeriodo = Math.max(0, dim - firstDay + 1);
    var saldoDiaMes = base * diasPeriodo;
    var diaGasto = sum(perDay.slice(firstDay - 1), id);
    var gastoAteHoje = sum(perDay.slice(firstDay - 1, today), id);
    var gastoAntesHoje = sum(perDay.slice(firstDay - 1, Math.max(firstDay - 1, today - 1)), id);
    var gastoHoje = isCur ? perDay[today - 1] : 0;
    var liberadoAteHoje = base * diasCorridos;
    var saldoDia = liberadoAteHoje - gastoAteHoje; // >0 disponível; <0 dívida com os próximos dias
    var disponivelHoje = Math.max(0, saldoDia);
    var limiteHoje = Math.max(0, liberadoAteHoje - gastoAntesHoje);
    var divida = Math.max(0, -saldoDia);
    var diasComidos = base > 0 ? divida / base : 0;
    var sobraAnterior = Math.max(0, limiteHoje - base);
    var proximos = [];
    for (var j = 1; j <= 7 && today + j <= dim; j++) {
      var eaten = Math.min(base, Math.max(0, divida - base * (j - 1)));
      var d = dateInMonth(mk, today + j);
      proximos.push({ day: today + j, wd: d.getDay(), livre: base - eaten, eaten: eaten });
    }
    var diasAcima = 0;
    for (var k = firstDay - 1; k < today; k++) if (perDay[k] > base + 0.001) diasAcima++;
    var restanteMes = saldoDiaMes - diaGasto;
    var diasRest = isCur ? dim - today + 1 : 0;
    var invested = sum((data.goals || []).reduce(function (a, g) {
      return a.concat((g.moves || []).filter(function (mv) { return mkOf(mv.date) === mk; }));
    }, []));
    var fixosPendentes = fixos.filter(function (x) { return !x.confirmed; });
    var fixosPagos = fixos.filter(function (x) { return x.paid; }).length;

    return {
      mk: mk, txM: txM, salario: salario, extras: extras, R: R, fixos: fixos, F: F, M: M, mercadoReal: mercadoReal,
      mercadoExc: mercadoExc, grandes: grandes, G: G, I: I, saldo: saldo, dim: dim, base: base, perDay: perDay,
      diaTx: diaTx, diaGasto: diaGasto, isCur: isCur, isPast: isPast, today: today, gastoAteHoje: gastoAteHoje,
      gastoHoje: gastoHoje, limiteHoje: limiteHoje, disponivelHoje: disponivelHoje, divida: divida,
      diasComidos: diasComidos, sobraAnterior: sobraAnterior, proximos: proximos, diasAcima: diasAcima,
      restanteMes: restanteMes, firstDay: firstDay, diasCorridos: diasCorridos, diasPeriodo: diasPeriodo, saldoDiaMes: saldoDiaMes, diasRest: diasRest, invested: invested, fixosPendentes: fixosPendentes, fixosPagos: fixosPagos,
    };
  }

  // ---------- Análise ----------
  function analyze(data, mk) {
    var s = data.settings;
    var b = budget(data, mk);
    var prev = budget(data, addMonths(mk, -1));
    var dia = b.diaTx;
    var byCat = {};
    dia.forEach(function (t) { byCat[t.cat] = byCat[t.cat] || { total: 0, count: 0 }; byCat[t.cat].total += t.amount; byCat[t.cat].count++; });
    var topCats = Object.keys(byCat).map(function (id) { return { id: id, total: byCat[id].total, count: byCat[id].count }; }).sort(function (a, c) { return c.total - a.total; });
    var wd = [0, 0, 0, 0, 0, 0, 0];
    var per = { Madrugada: 0, Manhã: 0, Tarde: 0, Noite: 0 };
    dia.forEach(function (t) {
      var d = new Date(t.date);
      wd[d.getDay()] += t.amount;
      if (t.hasTime) { var h = d.getHours(); per[h < 6 ? 'Madrugada' : h < 12 ? 'Manhã' : h < 18 ? 'Tarde' : 'Noite'] += t.amount; }
    });
    var topWd = wd.indexOf(Math.max.apply(null, wd));
    var topPer = Object.keys(per).map(function (k) { return [k, per[k]]; }).sort(function (a, c) { return c[1] - a[1]; })[0];
    var small = dia.filter(function (t) { return t.amount <= (num(s.pequeno) || 30); });
    var smallTotal = sum(small);
    var ritmo = b.isCur && b.diasCorridos > 0 ? (b.gastoAteHoje / b.diasCorridos) * b.diasPeriodo : b.diaGasto;
    var mediaDia = b.diasCorridos > 0 ? b.gastoAteHoje / b.diasCorridos : 0;
    var hourly = b.salario > 0 ? b.salario / (num(s.horasMes) || 176) : 0;
    var horas = hourly > 0 ? b.diaGasto / hourly : 0;
    var worst = b.perDay.map(function (v, i) { return { day: i + 1, v: v }; }).filter(function (x) { return x.v > 0; }).sort(function (a, c) { return c.v - a.v; }).slice(0, 3);

    var score = 100;
    if (b.salario <= 0) score = 0;
    else {
      if (b.saldo <= 0) score -= 40;
      if (ritmo > b.saldoDiaMes * 1.1) score -= 25; else if (ritmo > b.saldoDiaMes) score -= 15;
      if (b.diasCorridos > 0) { var pa = b.diasAcima / b.diasCorridos; if (pa > 0.5) score -= 15; else if (pa > 0.3) score -= 8; }
      if (b.mercadoExc > 0) score -= 8;
      if (b.isPast && b.invested < b.I) score -= 10;
      if (pct(b.F, b.salario) > 60) score -= 10;
      if (b.fixosPendentes.length > 0) score -= 5;
    }
    score = Math.max(0, Math.min(100, Math.round(score)));

    var ins = [];
    if (b.saldo <= 0 && b.salario > 0) ins.push({ c: C.red, t: 'O mês não fecha: fixos + mercado + parcelas + investimento já passam do salário em ' + fmt(-b.saldo) + '. Não há limite diário até isso mudar.' });
    if (b.diasCorridos > 0 && b.base > 0) {
      ins.push({ c: mediaDia > b.base ? C.red : C.green, t: 'Média diária no dia a dia: ' + fmt(mediaDia) + ' para um limite de ' + fmt(b.base) + '.' });
      ins.push({ c: b.diasAcima > 0 ? C.yellow : C.green, t: 'Passou do limite em ' + b.diasAcima + ' de ' + b.diasCorridos + ' ' + plural(b.diasCorridos, 'dia', 'dias') + '.' });
    }
    if (b.isCur && ritmo > 0 && b.saldoDiaMes > 0) {
      ins.push({ c: ritmo > b.saldoDiaMes ? C.red : C.green, t: ritmo > b.saldoDiaMes
        ? 'No ritmo atual o dia a dia fecha o mês em ' + fmt(ritmo) + ', ' + fmt(ritmo - b.saldoDiaMes) + ' acima do saldo. Isso sai do investimento ou vira dívida.'
        : 'No ritmo atual sobra ' + fmt(b.saldoDiaMes - ritmo) + ' no fim do mês. Mande essa sobra para a reserva.' });
    }
    if (b.divida > 0) ins.push({ c: C.red, t: 'Você está ' + fmt(b.divida) + ' à frente do limite: ' + b.diasComidos.toFixed(1).replace('.', ',') + ' ' + plural(Math.ceil(b.diasComidos), 'dia já está gasto', 'dias já estão gastos') + '.' });
    if (topCats[0]) ins.push({ c: C.red, t: 'Maior ralo: ' + catOf(topCats[0].id).icon + ' ' + catOf(topCats[0].id).label + ', ' + fmt(topCats[0].total) + ' em ' + topCats[0].count + 'x.' });
    if (wd[topWd] > 0) ins.push({ c: C.muted, t: WEEKDAYS[topWd] + ' é o dia em que você mais gasta no dia a dia.' });
    if (topPer && topPer[1] > 0) ins.push({ c: C.muted, t: 'A maior parte acontece de ' + topPer[0].toLowerCase() + ' (' + fmt(topPer[1]) + ').' });
    if (small.length >= 5) ins.push({ c: C.yellow, t: small.length + ' compras pequenas (até ' + fmt(s.pequeno) + ') somaram ' + fmt(smallTotal) + '.' });
    if (horas >= 1) ins.push({ c: C.yellow, t: 'Você trabalhou ~' + horas.toFixed(1).replace('.', ',') + ' horas para pagar o dia a dia deste mês.' });
    if (b.mercadoExc > 0) ins.push({ c: C.red, t: 'Mercado passou ' + fmt(b.mercadoExc) + ' do orçamento. Esse excesso saiu do seu limite diário.' });
    if (b.G > 0) ins.push({ c: C.purple, t: 'Parcelas de compras grandes: ' + fmt(b.G) + ' neste mês, ' + fmt(b.G / b.dim) + ' a menos por dia.' });
    if (b.fixosPendentes.length > 0) ins.push({ c: C.yellow, t: 'Falta informar o valor real de: ' + b.fixosPendentes.map(function (x) { return x.f.name; }).join(', ') + '.' });
    if (prev.diaGasto > 0 && b.diaGasto > 0 && b.isPast) {
      var v = pct(b.diaGasto - prev.diaGasto, prev.diaGasto);
      ins.push({ c: v > 0 ? C.red : C.green, t: 'Dia a dia ' + (v > 0 ? 'subiu' : 'caiu') + ' ' + Math.abs(Math.round(v)) + '% em relação ao mês anterior.' });
    }
    if (b.diaGasto > 0) {
      var half = (ritmo || b.diaGasto) / 2;
      ins.push({ c: C.blue, t: 'Se cortar metade do dia a dia (' + fmt(half) + '/mês) e investir a ' + String(s.taxaMes).replace('.', ',') + '% a.m., vira ' + fmt(fv(half, num(s.taxaMes), 60)) + ' em 5 anos.' });
    }
    data.cards.forEach(function (c) {
      var ci = cardInfo(c, data.tx);
      if (c.limit > 0 && ci.usado > c.limit * 0.7) ins.push({ c: C.red, t: c.name + ' já usou ' + Math.round(pct(ci.usado, c.limit)) + '% do limite.' });
    });
    if (b.invested > 0) ins.push({ c: C.green, t: 'Guardado/investido no mês: ' + fmt(b.invested) + (b.I > 0 ? ' (' + Math.round(pct(b.invested, b.I)) + '% da meta).' : '.') });
    return { b: b, prev: prev, topCats: topCats, wd: wd, small: small, smallTotal: smallTotal, ritmo: ritmo, mediaDia: mediaDia, horas: horas, worst: worst, score: score, ins: ins };
  }

  // ============================================================
  //  Componentes de UI
  // ============================================================
  var Card = function (p) { return <View style={[st.card, p.style]}>{p.children}</View>; };
  var H = function (p) { return <Text style={[st.h, p.style]}>{p.children}</Text>; };
  var Muted = function (p) { return <Text style={[st.muted, p.style]} numberOfLines={p.numberOfLines}>{p.children}</Text>; };
  var Row = function (p) { return <View style={[st.row, p.style]}>{p.children}</View>; };
  function Chip(p) {
    var color = p.color || C.green;
    return (
      <TouchableOpacity onPress={p.onPress} style={[st.chip, p.active && { backgroundColor: color + '33', borderColor: color }, p.style]}>
        <Text style={[st.chipTxt, p.active && { color: color }]}>{p.label}</Text>
      </TouchableOpacity>
    );
  }
  function Btn(p) {
    var color = p.color || C.green;
    return (
      <TouchableOpacity disabled={p.disabled} onPress={p.onPress} style={[st.btn, p.small && { paddingVertical: 8, paddingHorizontal: 12 }, p.outline ? { borderWidth: 1, borderColor: color, backgroundColor: 'transparent' } : { backgroundColor: color }, p.disabled && { opacity: 0.4 }, p.style]}>
        <Text style={[st.btnTxt, p.outline && { color: color }, p.small && { fontSize: 13 }]}>{p.label}</Text>
      </TouchableOpacity>
    );
  }
  function Bar(p) {
    var h = p.height || 8;
    var v = p.max > 0 ? Math.min(100, (p.value / p.max) * 100) : 0;
    return (
      <View style={[st.barBg, { height: h }]}>
        <View style={{ width: v + '%', height: h, backgroundColor: p.color || C.green, borderRadius: h }} />
      </View>
    );
  }
  function Field(p) {
    return (
      <View style={[{ marginBottom: 10 }, p.wrap]}>
        {p.label ? <Muted style={{ marginBottom: 4 }}>{p.label}</Muted> : null}
        <TextInput placeholderTextColor={C.muted} style={[st.input, p.err && { borderColor: C.red }]} value={p.value} onChangeText={p.onChangeText}
          placeholder={p.placeholder} keyboardType={p.keyboardType} onEndEditing={p.onEndEditing} autoFocus={p.autoFocus} />
      </View>
    );
  }
  function MonthNav(p) {
    return (
      <Row style={{ justifyContent: 'space-between', marginBottom: 12 }}>
        <TouchableOpacity onPress={function () { p.setMk(addMonths(p.mk, -1)); }} style={st.navBtn}><Text style={st.navTxt}>‹</Text></TouchableOpacity>
        <Text style={[st.h, { fontSize: 18 }]}>{mkLabel(p.mk)}</Text>
        <TouchableOpacity onPress={function () { p.setMk(addMonths(p.mk, 1)); }} style={st.navBtn}><Text style={st.navTxt}>›</Text></TouchableOpacity>
      </Row>
    );
  }
  function Stat(p) {
    return (
      <View style={{ flex: 1 }}>
        <Muted style={{ fontSize: 12 }}>{p.label}</Muted>
        <Text style={{ color: p.color || C.text, fontSize: 16, fontWeight: '700', marginTop: 2 }}>{p.value}</Text>
      </View>
    );
  }
  function Line(p) {
    return (
      <Row style={{ justifyContent: 'space-between', paddingVertical: 5 }}>
        <Text style={[st.txt, p.bold && { fontWeight: '800' }]}>{p.label}</Text>
        <Text style={[st.txt, { color: p.color || C.text, fontWeight: p.bold ? '800' : '600' }]}>{p.value}</Text>
      </Row>
    );
  }
  function Header(p) {
    return (
      <Row style={{ marginBottom: 12 }}>
        {p.back ? <TouchableOpacity onPress={p.back} style={[st.navBtn, { marginRight: 10 }]}><Text style={st.navTxt}>‹</Text></TouchableOpacity> : null}
        <Text style={[st.h, { fontSize: 24, flex: 1 }]}>{p.title}</Text>
      </Row>
    );
  }

  // Fórmula do mês (cascata)
  function Formula(p) {
    var b = p.b;
    return (
      <Card>
        <H style={{ marginBottom: 6 }}>🧮 Conta do mês</H>
        <Line label="💼 Salário" value={fmt(b.salario)} color={C.green} />
        {b.extras > 0 ? <Line label="💰 Receitas extras" value={'+ ' + fmt(b.extras)} color={C.green} /> : null}
        <Line label="📌 Gastos fixos" value={'− ' + fmt(b.F)} color={C.red} />
        <Line label="🛒 Mercado" value={'− ' + fmt(b.M)} color={C.red} />
        <Line label="🛋️ Cartão compras grandes" value={'− ' + fmt(b.G)} color={C.red} />
        <Line label={'🛟 Investimento + reserva (' + p.investPct + '%)'} value={'− ' + fmt(b.I)} color={C.blue} />
        <View style={{ height: 1, backgroundColor: C.border, marginVertical: 6 }} />
        <Line bold label="= Saldo para o dia a dia" value={fmt(b.saldo)} color={b.saldo > 0 ? C.green : C.red} />
        <Line bold label={'÷ ' + b.dim + ' dias = limite por dia'} value={fmt(b.base)} color={C.green} />
      </Card>
    );
  }

  function TxItem(p) {
    var t = p.t, c = catOf(t.cat), isIn = t.group === 'extra';
    var g = GROUPS[t.group] || GROUPS.dia;
    return (
      <TouchableOpacity onPress={p.onPress} style={st.txItem}>
        <Text style={{ fontSize: 22, marginRight: 10 }}>{c.icon}</Text>
        <View style={{ flex: 1 }}>
          <Text style={st.txTitle} numberOfLines={1}>{t.desc || c.label}</Text>
          <Muted style={{ fontSize: 12 }} numberOfLines={1}>
            {dateBR(t.date)} · {g.label}{!isIn && t.pay ? ' · ' + payLabel(t.pay, p.cards) : ''}
          </Muted>
        </View>
        <Text style={{ color: isIn ? C.green : C.text, fontWeight: '700' }}>{isIn ? '+' : '-'}{fmt(t.amount)}</Text>
      </TouchableOpacity>
    );
  }

  // Faixa dos próximos dias
  function NextDays(p) {
    var b = p.b;
    if (!b.isCur || b.proximos.length === 0) return null;
    return (
      <Card>
        <H style={{ marginBottom: 8 }}>📅 Próximos dias</H>
        <Row style={{ justifyContent: 'space-between' }}>
          {b.proximos.map(function (d) {
            var full = d.eaten <= 0.005, none = d.livre <= 0.005;
            var col = none ? C.red : full ? C.green : C.yellow;
            return (
              <View key={d.day} style={[st.dayBox, { borderColor: col }]}>
                <Text style={{ color: C.muted, fontSize: 10 }}>{WEEKDAYS[d.wd].slice(0, 3)}</Text>
                <Text style={{ color: C.text, fontWeight: '700', fontSize: 13 }}>{d.day}</Text>
                <Text style={{ color: col, fontSize: 10, fontWeight: '700' }}>{none ? 'gasto' : Math.round(d.livre)}</Text>
              </View>
            );
          })}
        </Row>
        <Muted style={{ fontSize: 12, marginTop: 8 }}>
          {b.divida > 0 ? 'Vermelho = dia já gasto. Amarelo = dia com limite reduzido.' : 'Todos os próximos dias estão com o limite cheio.'}
        </Muted>
      </Card>
    );
  }

  // ============================================================
  //  Tela: Configuração inicial (obrigatória)
  // ============================================================
  function SetupScreen(p) {
    var data = p.data, s = data.settings;
    var _a = useState(0), step = _a[0], setStep = _a[1];
    var _b = useState(s.salario ? moneyStr(s.salario) : ''), salario = _b[0], setSalario = _b[1];
    var initialFixed = data.fixed.length
      ? data.fixed.map(function (f) { return { id: f.id, name: f.name, icon: f.icon, varia: f.varia, day: f.day ? String(f.day) : '', amount: moneyStr(f.amount) }; })
      : DEFAULT_FIXED.map(function (f) { return { id: uid(), name: f.name, icon: f.icon, varia: f.varia, day: '', amount: '' }; });
    var _c = useState(initialFixed), fixed = _c[0], setFixed = _c[1];
    var _d = useState(''), newFixed = _d[0], setNewFixed = _d[1];
    var _e = useState(s.mercado || data.setupDone ? moneyStr(s.mercado) || '0' : ''), mercado = _e[0], setMercado = _e[1];
    var _f = useState(String(s.investPct != null ? s.investPct : 20)), invest = _f[0], setInvest = _f[1];
    var _g = useState([]), parc = _g[0], setParc = _g[1];
    var _h = useState({ desc: '', valor: '', rest: '' }), np = _h[0], setNp = _h[1];
    var _i = useState(false), tried = _i[0], setTried = _i[1];

    var sal = parseMoney(salario);
    var fixedVals = fixed.map(function (f) { return parseMoney(f.amount); });
    var F = sum(fixedVals, function (x) { return x; });
    var M = parseMoney(mercado);
    var mk = currentMk();
    var G = sum(parc.filter(function (x) { return x.rest > 0; }), function (x) { return x.valor; });
    var I = (sal * parseMoney(invest)) / 100;
    var saldo = sal - F - M - G - I;
    var dim = daysInMonth(mk);

    var setF = function (i, k, v) { setFixed(fixed.map(function (f, j) { if (j !== i) return f; var n = Object.assign({}, f); n[k] = v; return n; })); };
    var next = function () {
      setTried(true);
      if (step === 0 && sal <= 0) return Alert.alert('Obrigatório', 'Informe seu salário líquido mensal.');
      if (step === 1) {
        var miss = fixed.filter(function (f) { return parseMoney(f.amount) <= 0; });
        if (miss.length) return Alert.alert('Gastos fixos obrigatórios', 'Informe o valor de: ' + miss.map(function (f) { return f.name; }).join(', ') + '.\n\nSe o valor muda todo mês, coloque uma estimativa. Você confirma o valor real a cada mês.\n\nSe algum não existe para você, exclua no 🗑.');
      }
      if (step === 2 && String(mercado).trim() === '') return Alert.alert('Obrigatório', 'Informe quanto você gasta de mercado por mês (pode ser uma estimativa).');
      setTried(false);
      setStep(step + 1);
    };
    var addParc = function () {
      var v = parseMoney(np.valor), r = parseInt(np.rest, 10) || 0;
      if (!np.desc || v <= 0 || r <= 0) return Alert.alert('Preencha', 'Descrição, valor da parcela e quantas parcelas faltam (contando a deste mês).');
      setParc(parc.concat([{ desc: np.desc, valor: v, rest: r }]));
      setNp({ desc: '', valor: '', rest: '' });
    };
    var finish = function () {
      p.update(function (d) {
        var cards = d.cards.length ? d.cards : DEFAULT_CARDS.map(function (c) { return Object.assign({}, c); });
        var newTx = [];
        parc.forEach(function (x) {
          var pid = uid();
          for (var i = 0; i < x.rest; i++) {
            newTx.push({ id: uid(), group: 'grande', cat: 'grande', amount: x.valor, desc: x.desc + ' (faltam ' + (x.rest - i) + ')', date: dateInMonth(addMonths(mk, i), 10).toISOString(), pay: 'card:grandes', parentId: pid });
          }
        });
        return Object.assign({}, d, {
          setupDone: true, startDate: d.startDate || new Date().toISOString(), cards: cards, tx: d.tx.concat(newTx),
          fixed: fixed.map(function (f) { return { id: f.id, name: f.name, icon: f.icon, varia: f.varia, day: parseInt(f.day, 10) || 10, amount: parseMoney(f.amount) }; }),
          settings: Object.assign({}, d.settings, { salario: sal, mercado: M, investPct: parseMoney(invest) }),
        });
      });
      p.toast('✅ Pronto! Seu limite diário foi calculado.');
    };

    var steps = ['Salário', 'Fixos', 'Mercado', 'Parcelas', 'Resumo'];
    return (
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={st.screen} keyboardShouldPersistTaps="handled">
          <Text style={[st.h, { fontSize: 24 }]}>Configuração do mês</Text>
          <Muted style={{ marginBottom: 12 }}>Passo {step + 1} de 5 · {steps[step]}</Muted>
          <Bar value={step + 1} max={5} color={C.yellow} />
          <View style={{ height: 14 }} />

          {step === 0 ? (
            <Card>
              <H>💼 Quanto você recebe por mês?</H>
              <Muted style={{ marginVertical: 6 }}>Salário líquido, o que cai na conta.</Muted>
              <TextInput autoFocus value={salario} onChangeText={setSalario} placeholder="0,00" placeholderTextColor={C.border} keyboardType="decimal-pad" style={st.bigInput} />
            </Card>
          ) : null}

          {step === 1 ? (
            <Card>
              <H>📌 Gastos fixos (obrigatório)</H>
              <Muted style={{ marginVertical: 6 }}>Todos precisam de valor. Os que variam (luz, água) entram como estimativa e você confirma o valor real todo mês.</Muted>
              {fixed.map(function (f, i) {
                var err = tried && parseMoney(f.amount) <= 0;
                return (
                  <View key={f.id} style={st.listRow}>
                    <Text style={{ fontSize: 22, marginRight: 8 }}>{f.icon}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={st.txt}>{f.name}</Text>
                      <TouchableOpacity onPress={function () { setF(i, 'varia', !f.varia); }}>
                        <Text style={{ color: f.varia ? C.yellow : C.muted, fontSize: 12, marginTop: 2 }}>{f.varia ? '↕ valor varia (confirmar todo mês)' : '= valor fixo · toque se variar'}</Text>
                      </TouchableOpacity>
                    </View>
                    <TextInput value={f.amount} onChangeText={function (v) { setF(i, 'amount', v); }} placeholder="R$" placeholderTextColor={C.muted} keyboardType="decimal-pad" style={[st.input, { width: 95, marginRight: 6 }, err && { borderColor: C.red }]} />
                    <TextInput value={f.day} onChangeText={function (v) { setF(i, 'day', v); }} placeholder="dia" placeholderTextColor={C.muted} keyboardType="number-pad" style={[st.input, { width: 50, marginRight: 6 }]} />
                    <TouchableOpacity onPress={function () { setFixed(fixed.filter(function (_, j) { return j !== i; })); }}><Text style={{ color: C.muted }}>🗑</Text></TouchableOpacity>
                  </View>
                );
              })}
              <Row style={{ marginTop: 8 }}>
                <TextInput value={newFixed} onChangeText={setNewFixed} placeholder="Outro fixo (ex: celular)" placeholderTextColor={C.muted} style={[st.input, { flex: 1, marginRight: 8 }]} />
                <Btn small label="+ Add" outline onPress={function () { if (!newFixed.trim()) return; setFixed(fixed.concat([{ id: uid(), name: newFixed.trim(), icon: '🧾', varia: false, day: '', amount: '' }])); setNewFixed(''); }} />
              </Row>
              <Muted style={{ marginTop: 10 }}>Total fixo: {fmt(F)}/mês</Muted>
            </Card>
          ) : null}

          {step === 2 ? (
            <Card>
              <H>🛒 Orçamento de mercado por mês</H>
              <Muted style={{ marginVertical: 6 }}>Quanto você separa para mercado. Se passar disso, o excesso sai do seu limite diário.</Muted>
              <TextInput autoFocus value={mercado} onChangeText={setMercado} placeholder="0,00" placeholderTextColor={C.border} keyboardType="decimal-pad" style={st.bigInput} />
            </Card>
          ) : null}

          {step === 3 ? (
            <Card>
              <H>🛋️ Compras grandes já parceladas</H>
              <Muted style={{ marginVertical: 6 }}>Geladeira, guarda-roupa, cama… que ainda estão no cartão. Coloque o valor da parcela e quantas faltam (contando a deste mês). Se não tiver, só avance.</Muted>
              {parc.map(function (x, i) {
                return (
                  <Row key={i} style={st.listRow}>
                    <Text style={[st.txt, { flex: 1 }]}>{x.desc}</Text>
                    <Text style={[st.txt, { marginRight: 10 }]}>{fmt(x.valor)} × {x.rest}</Text>
                    <TouchableOpacity onPress={function () { setParc(parc.filter(function (_, j) { return j !== i; })); }}><Text style={{ color: C.muted }}>🗑</Text></TouchableOpacity>
                  </Row>
                );
              })}
              <Field label="O que foi" value={np.desc} onChangeText={function (v) { setNp(Object.assign({}, np, { desc: v })); }} placeholder="Ex: Geladeira" />
              <Row>
                <Field wrap={{ flex: 1, marginRight: 8 }} label="Valor da parcela" value={np.valor} onChangeText={function (v) { setNp(Object.assign({}, np, { valor: v })); }} keyboardType="decimal-pad" />
                <Field wrap={{ width: 110 }} label="Faltam" value={np.rest} onChangeText={function (v) { setNp(Object.assign({}, np, { rest: v })); }} keyboardType="number-pad" />
              </Row>
              <Btn label="+ Adicionar parcela" outline color={C.purple} onPress={addParc} />
            </Card>
          ) : null}

          {step === 4 ? (
            <View>
              <Card>
                <H>🛟 Investimento + reserva de segurança</H>
                <Muted style={{ marginVertical: 6 }}>% do salário separado antes de tudo.</Muted>
                <Field value={invest} onChangeText={setInvest} keyboardType="decimal-pad" />
              </Card>
              <Formula investPct={parseMoney(invest)} b={{ salario: sal, extras: 0, F: F, M: M, G: G, I: I, saldo: saldo, dim: dim, base: saldo > 0 ? saldo / dim : 0 }} />
              {saldo <= 0 ? <Card style={{ borderColor: C.red }}><Text style={[st.txt, { color: C.red }]}>A conta não fecha: faltam {fmt(-saldo)}. Revise os valores ou reduza a % de investimento.</Text></Card> : null}
            </View>
          ) : null}

          <Row style={{ marginTop: 4 }}>
            {step > 0 ? <Btn label="Voltar" outline color={C.muted} onPress={function () { setStep(step - 1); }} style={{ marginRight: 8 }} /> : null}
            {step < 4 ? <Btn label="Continuar" color={C.yellow} onPress={next} style={{ flex: 1 }} /> : <Btn label="Começar a usar" onPress={finish} style={{ flex: 1 }} />}
          </Row>
          {p.cancel ? <Btn label="Cancelar" outline color={C.muted} onPress={p.cancel} style={{ marginTop: 10 }} /> : null}
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // ============================================================
  //  Tela: Início
  // ============================================================
  function HomeScreen(p) {
    var data = p.data;
    var mk = currentMk();
    var b = useMemo(function () { return budget(data, mk); }, [data]);
    var _a = useState('lanche'), qCat = _a[0], setQCat = _a[1];
    var _b = useState(''), qVal = _b[0], setQVal = _b[1];
    var recent = b.diaTx.slice().sort(function (x, y) { return new Date(y.date) - new Date(x.date); }).slice(0, 5);
    var color = b.divida > 0 || b.saldo <= 0 ? C.red : b.disponivelHoje < b.base * 0.3 ? C.yellow : C.green;

    var quick = function (v) {
      var val = parseMoney(v);
      if (val <= 0) return;
      p.addTx([{ id: uid(), group: 'dia', amount: val, cat: qCat, desc: catOf(qCat).label, date: new Date().toISOString(), hasTime: true, pay: data.settings.defaultPay || 'card:dia' }]);
      setQVal('');
    };

    return (
      <ScrollView contentContainerStyle={st.screen} keyboardShouldPersistTaps="handled">
        <Row style={{ justifyContent: 'space-between', marginBottom: 14 }}>
          <View>
            <Muted>{mkLabel(mk)} · dia {b.today} de {b.dim}</Muted>
            <Text style={[st.h, { fontSize: 24 }]}>Meu Dinheiro</Text>
          </View>
          <TouchableOpacity onPress={p.goAjustes} style={st.navBtn}><Text style={{ fontSize: 20 }}>⚙️</Text></TouchableOpacity>
        </Row>

        {b.fixosPendentes.length > 0 ? (
          <TouchableOpacity onPress={p.goFixos}>
            <Card style={{ borderColor: C.yellow, backgroundColor: C.yellow + '18' }}>
              <H>⚠️ Informe o valor real de {mkLabel(mk)}</H>
              <Muted style={{ marginTop: 4 }}>{b.fixosPendentes.map(function (x) { return x.f.icon + ' ' + x.f.name; }).join('  ·  ')}</Muted>
              <Muted style={{ marginTop: 4, fontSize: 12 }}>Usando estimativa até você confirmar. Toque aqui.</Muted>
            </Card>
          </TouchableOpacity>
        ) : null}

        {b.saldo <= 0 ? (
          <Card style={{ borderColor: C.red }}>
            <H style={{ color: C.red }}>O mês não fecha</H>
            <Muted style={{ marginTop: 4 }}>Fixos + mercado + parcelas + investimento passam do salário em {fmt(-b.saldo)}. Não sobra nada para o dia a dia.</Muted>
          </Card>
        ) : null}

        <Card style={{ alignItems: 'center', paddingVertical: 20, borderColor: color }}>
          <Muted>Hoje você ainda pode gastar</Muted>
          <Text style={{ fontSize: 42, fontWeight: '800', color: color, marginVertical: 4 }}>{fmt(b.disponivelHoje)}</Text>
          <Muted style={{ textAlign: 'center' }}>Limite diário {fmt(b.base)} · gasto hoje {fmt(b.gastoHoje)}</Muted>
          {b.sobraAnterior > 0.01 ? <Text style={{ color: C.green, fontSize: 13, marginTop: 6, textAlign: 'center' }}>Inclui {fmt(b.sobraAnterior)} que sobrou dos dias anteriores</Text> : null}
          {b.divida > 0 ? (
            <View style={{ marginTop: 10, padding: 10, borderRadius: 10, backgroundColor: C.red + '22', alignSelf: 'stretch' }}>
              <Text style={{ color: C.red, fontWeight: '700', textAlign: 'center' }}>Você já gastou {fmt(b.divida)} dos próximos dias</Text>
              <Text style={{ color: C.text, fontSize: 13, textAlign: 'center', marginTop: 2 }}>
                {b.proximos.length ? 'Amanhã: ' + fmt(b.proximos[0].livre) + ' de ' + fmt(b.base) + ' · ' + b.diasComidos.toFixed(1).replace('.', ',') + ' dia(s) comido(s)' : 'Último dia do mês: o excesso sai da sobra/investimento.'}
              </Text>
            </View>
          ) : null}
        </Card>

        <Card>
          <H>💳 Lançar gasto do dia a dia</H>
          <Muted style={{ fontSize: 12, marginTop: 2 }}>Vai no {payLabel(data.settings.defaultPay, data.cards) || 'Pix'} · 1 toque lança</Muted>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 8 }}>
            {QUICK_CATS.map(function (id) {
              return <Chip key={id} label={catOf(id).icon + ' ' + catOf(id).label} active={qCat === id} onPress={function () { setQCat(id); }} color={C.red} />;
            })}
          </ScrollView>
          <View style={st.grid}>
            {QUICK_VALUES.map(function (v) {
              return <TouchableOpacity key={v} style={st.quickBtn} onPress={function () { quick(v); }}><Text style={st.quickTxt}>R$ {v}</Text></TouchableOpacity>;
            })}
          </View>
          <Row>
            <TextInput value={qVal} onChangeText={setQVal} placeholder="Outro valor" placeholderTextColor={C.muted} keyboardType="decimal-pad" style={[st.input, { flex: 1, marginRight: 8 }]} />
            <Btn label="Lançar" onPress={function () { quick(qVal); }} color={C.red} />
          </Row>
        </Card>

        <NextDays b={b} />

        <Card>
          <H style={{ marginBottom: 8 }}>📊 Controle do mês</H>
          <Row style={{ justifyContent: 'space-between' }}><Text style={st.txt}>💳 Dia a dia</Text><Text style={st.txt}>{fmt(b.diaGasto)} de {fmt(b.saldoDiaMes)}</Text></Row>
          <View style={{ marginVertical: 6 }}><Bar value={b.diaGasto} max={b.saldoDiaMes} color={b.gastoAteHoje > b.base * b.diasCorridos ? C.red : C.green} height={10} /></View>
          <Muted style={{ fontSize: 12, marginBottom: 10 }}>{b.firstDay > 1 ? 'Contando a partir do dia ' + b.firstDay + ' (quando você começou). ' : ''}Sobra no mês: {fmt(b.restanteMes)} · {b.diasRest} dia(s) restantes · passou do limite em {b.diasAcima} dia(s)</Muted>

          <Row style={{ justifyContent: 'space-between' }}><Text style={st.txt}>🛒 Mercado</Text><Text style={st.txt}>{fmt(b.mercadoReal)} de {fmt(b.M)}</Text></Row>
          <View style={{ marginVertical: 6 }}><Bar value={b.mercadoReal} max={b.M} color={b.mercadoReal > b.M ? C.red : C.yellow} /></View>

          <TouchableOpacity onPress={p.goFixos}>
            <Row style={{ justifyContent: 'space-between', marginTop: 6 }}><Text style={st.txt}>📌 Fixos ({b.fixosPagos}/{b.fixos.length} pagos)</Text><Text style={st.txt}>{fmt(b.F)} ›</Text></Row>
          </TouchableOpacity>
          <Row style={{ justifyContent: 'space-between', marginTop: 8 }}><Text style={st.txt}>🛋️ Parcelas compras grandes</Text><Text style={st.txt}>{fmt(b.G)}</Text></Row>
          <Row style={{ justifyContent: 'space-between', marginTop: 8 }}><Text style={st.txt}>🛟 Investir/reservar</Text><Text style={[st.txt, { color: C.blue }]}>{fmt(b.invested)} de {fmt(b.I)}</Text></Row>
        </Card>

        <Formula b={b} investPct={data.settings.investPct} />

        <Row style={{ justifyContent: 'space-between', marginTop: 6, marginBottom: 8 }}>
          <H>Últimos gastos do dia a dia</H>
          <TouchableOpacity onPress={function () { p.goTab('extrato'); }}><Text style={{ color: C.blue }}>Ver tudo</Text></TouchableOpacity>
        </Row>
        <Card style={{ paddingVertical: 4 }}>
          {recent.length === 0 ? <Muted style={{ padding: 10 }}>Nenhum gasto ainda este mês.</Muted> :
            recent.map(function (t) { return <TxItem key={t.id} t={t} cards={data.cards} onPress={function () { p.openTx(t); }} />; })}
        </Card>
      </ScrollView>
    );
  }

  // ============================================================
  //  Tela: Gastos fixos do mês
  // ============================================================
  function FixosScreen(p) {
    var data = p.data;
    var _a = useState(currentMk()), mk = _a[0], setMk = _a[1];
    var list = fixedOf(data, mk);
    var _b = useState({}), edit = _b[0], setEdit = _b[1];
    var _c = useState({ name: '', amount: '', day: '', icon: '🧾', varia: false }), nf = _c[0], setNf = _c[1];

    var setMonth = function (id, patch) {
      p.update(function (d) {
        var fm = Object.assign({}, d.fixedMonth || {});
        var m = Object.assign({}, fm[mk] || {});
        m[id] = Object.assign({}, m[id] || {}, patch);
        fm[mk] = m;
        var fixed = d.fixed;
        if (patch.amount != null && mk >= currentMk()) fixed = d.fixed.map(function (f) { return f.id === id ? Object.assign({}, f, { amount: patch.amount }) : f; });
        return Object.assign({}, d, { fixedMonth: fm, fixed: fixed });
      });
    };
    var confirm = function (x) {
      var raw = edit[x.id];
      var v = raw != null ? parseMoney(raw) : x.amount;
      if (v <= 0) return Alert.alert('Valor obrigatório', 'Informe o valor de ' + x.f.name + '.');
      setMonth(x.id, { amount: v, confirmed: true });
      var e = Object.assign({}, edit); delete e[x.id]; setEdit(e);
      p.toast('✅ ' + x.f.name + ': ' + fmt(v) + ' em ' + mkLabel(mk));
    };
    var addFixed = function () {
      var a = parseMoney(nf.amount);
      if (!nf.name || a <= 0) return Alert.alert('Obrigatório', 'Nome e valor do gasto fixo.');
      p.update(function (d) { return Object.assign({}, d, { fixed: d.fixed.concat([{ id: uid(), name: nf.name, icon: nf.icon, amount: a, day: parseInt(nf.day, 10) || 10, varia: nf.varia }]) }); });
      setNf({ name: '', amount: '', day: '', icon: '🧾', varia: false });
    };
    var del = function (f) {
      Alert.alert('Excluir gasto fixo', 'Excluir ' + f.name + ' de todos os meses?', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: function () { p.update(function (d) { return Object.assign({}, d, { fixed: d.fixed.filter(function (x) { return x.id !== f.id; }) }); }); } },
      ]);
    };

    return (
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={st.screen} keyboardShouldPersistTaps="handled">
          <Header title="📌 Gastos fixos" back={p.back} />
          <MonthNav mk={mk} setMk={setMk} />
          <Card>
            <Row>
              <Stat label="Total do mês" value={fmt(sum(list))} color={C.red} />
              <Stat label="Pagos" value={list.filter(function (x) { return x.paid; }).length + ' de ' + list.length} />
            </Row>
          </Card>
          {list.map(function (x) {
            var val = edit[x.id] != null ? edit[x.id] : moneyStr(x.amount);
            return (
              <Card key={x.id} style={!x.confirmed ? { borderColor: C.yellow } : null}>
                <Row style={{ justifyContent: 'space-between' }}>
                  <Text style={[st.h, { flex: 1 }]}>{x.f.icon} {x.f.name}</Text>
                  <TouchableOpacity onPress={function () { del(x.f); }}><Text style={{ color: C.muted }}>🗑</Text></TouchableOpacity>
                </Row>
                <Muted style={{ fontSize: 12, marginTop: 2 }}>Vence dia {x.f.day || 10} · {x.f.varia ? (x.confirmed ? 'valor confirmado' : 'ESTIMATIVA, confirme o valor real') : 'valor fixo'}</Muted>
                <Row style={{ marginTop: 10 }}>
                  <TextInput value={val} onChangeText={function (v) { var e = Object.assign({}, edit); e[x.id] = v; setEdit(e); }} keyboardType="decimal-pad" placeholder="R$" placeholderTextColor={C.muted} style={[st.input, { flex: 1, marginRight: 8 }]} />
                  <Btn small label={x.confirmed && edit[x.id] == null ? 'Salvo' : 'Confirmar'} color={x.confirmed && edit[x.id] == null ? C.card2 : C.yellow} onPress={function () { confirm(x); }} style={{ marginRight: 8 }} />
                  <Btn small label={x.paid ? '✅ Pago' : 'Pagar'} outline={!x.paid} color={C.green} onPress={function () { setMonth(x.id, x.paid ? { paid: false } : { paid: true, amount: x.amount, confirmed: true }); }} />
                </Row>
              </Card>
            );
          })}
          <Card>
            <H style={{ marginBottom: 8 }}>+ Novo gasto fixo</H>
            <Field label="Nome" value={nf.name} onChangeText={function (v) { setNf(Object.assign({}, nf, { name: v })); }} placeholder="Ex: Celular" />
            <Row>
              <Field wrap={{ flex: 1, marginRight: 8 }} label="Valor" value={nf.amount} onChangeText={function (v) { setNf(Object.assign({}, nf, { amount: v })); }} keyboardType="decimal-pad" />
              <Field wrap={{ width: 90 }} label="Dia venc." value={nf.day} onChangeText={function (v) { setNf(Object.assign({}, nf, { day: v })); }} keyboardType="number-pad" />
            </Row>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
              {FIXED_ICONS.map(function (i) { return <Chip key={i} label={i} active={nf.icon === i} onPress={function () { setNf(Object.assign({}, nf, { icon: i })); }} color={C.blue} />; })}
            </ScrollView>
            <Row style={{ marginBottom: 10 }}>
              <Chip label="Valor fixo" active={!nf.varia} onPress={function () { setNf(Object.assign({}, nf, { varia: false })); }} />
              <Chip label="Valor varia" active={nf.varia} color={C.yellow} onPress={function () { setNf(Object.assign({}, nf, { varia: true })); }} />
            </Row>
            <Btn label="Adicionar" outline onPress={addFixed} />
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // ============================================================
  //  Tela: Lançar
  // ============================================================
  function AddScreen(p) {
    var data = p.data, s = data.settings;
    var _a = useState('dia'), group = _a[0], setGroup = _a[1];
    var _b = useState(''), amount = _b[0], setAmount = _b[1];
    var _c = useState(''), desc = _c[0], setDesc = _c[1];
    var _d = useState('lanche'), cat = _d[0], setCat = _d[1];
    var _e = useState(s.defaultPay || 'card:dia'), pay = _e[0], setPay = _e[1];
    var _f = useState('1'), parcelas = _f[0], setParcelas = _f[1];
    var _g = useState('proximo'), start = _g[0], setStart = _g[1];
    var _h = useState('nova'), gMode = _h[0], setGMode = _h[1];
    var _i = useState('hoje'), dateMode = _i[0], setDateMode = _i[1];
    var _j = useState(''), dateStr = _j[0], setDateStr = _j[1];

    var pays = allPays(data.cards);
    var switchGroup = function (g) {
      setGroup(g);
      setPay(g === 'grande' ? (s.grandePay || 'card:grandes') : (s.defaultPay || 'card:dia'));
      if (g === 'dia') setCat('lanche');
    };

    var buildList = function () {
      var val = parseMoney(amount);
      if (val <= 0) { Alert.alert('Valor inválido', 'Digite um valor maior que zero.'); return null; }
      if (group === 'grande') {
        if (!desc.trim()) { Alert.alert('Descrição', 'O que você comprou? (ex: geladeira)'); return null; }
        var n = Math.max(1, Math.min(48, parseInt(parcelas, 10) || 1));
        var mk0 = gMode === 'andamento' ? currentMk() : start === 'este' ? currentMk() : addMonths(currentMk(), 1);
        var each = gMode === 'andamento' ? val : Math.floor((val / n) * 100) / 100;
        var pid = uid(), list = [];
        for (var i = 0; i < n; i++) {
          var amt = gMode === 'andamento' ? val : i === n - 1 ? Math.round((val - each * (n - 1)) * 100) / 100 : each;
          var lbl = gMode === 'andamento' ? ' (faltam ' + (n - i) + ')' : n > 1 ? ' (' + (i + 1) + '/' + n + ')' : '';
          list.push({ id: uid(), group: 'grande', cat: 'grande', amount: amt, desc: desc.trim() + lbl, date: dateInMonth(addMonths(mk0, i), 10).toISOString(), pay: pay, parentId: pid });
        }
        return list;
      }
      var base, hasTime = false;
      if (dateMode === 'hoje') { base = new Date(); hasTime = true; }
      else if (dateMode === 'ontem') { base = new Date(); base.setDate(base.getDate() - 1); base.setHours(12, 0, 0, 0); }
      else { base = parseDateBR(dateStr); if (!base) { Alert.alert('Data inválida', 'Use o formato DD/MM/AAAA.'); return null; } }
      var c = group === 'dia' ? cat : group;
      return [{ id: uid(), group: group, cat: c, amount: val, desc: desc.trim() || catOf(c).label, date: base.toISOString(), hasTime: hasTime, pay: group === 'extra' ? undefined : pay }];
    };

    // prévia do impacto de compra grande
    var preview = null;
    if (group === 'grande' && parseMoney(amount) > 0) {
      var mkNow = currentMk();
      var cur = budget(data, mkNow);
      var n = Math.max(1, parseInt(parcelas, 10) || 1);
      var parcela = gMode === 'andamento' ? parseMoney(amount) : parseMoney(amount) / n;
      var hitsNow = gMode === 'andamento' || start === 'este';
      var targetMk = hitsNow ? mkNow : addMonths(mkNow, 1);
      var tb = budget(data, targetMk);
      preview = { parcela: parcela, n: n, mk: targetMk, antes: tb.base, depois: Math.max(0, (tb.saldo - parcela) / tb.dim), cur: cur };
    }

    var save = function () {
      var list = buildList();
      if (!list) return;
      p.addTx(list);
      setAmount(''); setDesc(''); setParcelas('1'); setDateMode('hoje'); setDateStr('');
    };

    var tabs = [['dia', '💳 Dia a dia', C.red], ['mercado', '🛒 Mercado', C.yellow], ['grande', '🛋️ Grande', C.purple], ['extra', '💰 Receita', C.green]];
    var gc = GROUPS[group].color;
    return (
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={st.screen} keyboardShouldPersistTaps="handled">
          <Text style={[st.h, { fontSize: 24, marginBottom: 12 }]}>Novo lançamento</Text>
          <View style={st.grid}>
            {tabs.map(function (t) { return <Chip key={t[0]} label={t[1]} active={group === t[0]} onPress={function () { switchGroup(t[0]); }} color={t[2]} />; })}
          </View>
          <Muted style={{ fontSize: 12, marginBottom: 10 }}>
            {group === 'dia' ? 'Sai do seu limite diário. Se passar, come os próximos dias.' :
              group === 'mercado' ? 'Sai do orçamento de mercado (' + fmt(s.mercado) + '/mês). O que passar sai do limite diário.' :
                group === 'grande' ? 'Geladeira, guarda-roupa, cama… As parcelas entram na conta de cada mês e reduzem o limite diário.' :
                  'Dinheiro a mais que entrou no mês. Aumenta o saldo e o limite diário.'}
          </Muted>

          {group === 'grande' ? (
            <Row style={{ marginBottom: 8 }}>
              <Chip label="Compra nova" active={gMode === 'nova'} onPress={function () { setGMode('nova'); }} color={C.purple} />
              <Chip label="Já estava parcelada" active={gMode === 'andamento'} onPress={function () { setGMode('andamento'); }} color={C.purple} />
            </Row>
          ) : null}

          <Card>
            <Muted>{group === 'grande' && gMode === 'andamento' ? 'Valor da parcela' : group === 'grande' ? 'Valor total' : 'Valor'}</Muted>
            <TextInput value={amount} onChangeText={setAmount} placeholder="0,00" placeholderTextColor={C.border} keyboardType="decimal-pad" style={st.bigInput} />
            <Field label={group === 'grande' ? 'O que comprou' : 'Descrição (opcional)'} value={desc} onChangeText={setDesc} placeholder={group === 'grande' ? 'Ex: Geladeira' : 'Ex: coxinha na padaria'} />
            {group === 'grande' ? (
              <View>
                <Field label={gMode === 'andamento' ? 'Quantas parcelas faltam (contando este mês)' : 'Parcelas'} value={parcelas} onChangeText={setParcelas} keyboardType="number-pad" />
                {gMode === 'nova' ? (
                  <View>
                    <Muted style={{ marginBottom: 6 }}>Primeira parcela cai em:</Muted>
                    <Row>
                      <Chip label="Este mês" active={start === 'este'} onPress={function () { setStart('este'); }} color={C.purple} />
                      <Chip label="Próximo mês" active={start === 'proximo'} onPress={function () { setStart('proximo'); }} color={C.purple} />
                    </Row>
                  </View>
                ) : null}
              </View>
            ) : null}
          </Card>

          {preview ? (
            <Card style={{ borderColor: C.purple }}>
              <H>Impacto</H>
              <Text style={[st.txt, { marginTop: 6 }]}>{preview.n}x de {fmt(preview.parcela)} a partir de {mkLabel(preview.mk)}.</Text>
              <Text style={[st.txt, { marginTop: 4 }]}>Limite diário em {mkLabel(preview.mk)}: <Text style={{ color: C.red, fontWeight: '700' }}>{fmt(preview.antes)} → {fmt(preview.depois)}</Text></Text>
            </Card>
          ) : null}

          {group === 'dia' ? (
            <View>
              <Text style={st.label}>Categoria</Text>
              <View style={st.grid}>
                {DIA_CATS.map(function (c) {
                  return (
                    <TouchableOpacity key={c.id} onPress={function () { setCat(c.id); }} style={[st.catBtn, cat === c.id && { borderColor: C.red, backgroundColor: C.card2 }]}>
                      <Text style={{ fontSize: 22 }}>{c.icon}</Text>
                      <Text style={st.catTxt} numberOfLines={1}>{c.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ) : null}

          {group !== 'extra' ? (
            <View>
              <Text style={st.label}>Forma de pagamento</Text>
              <View style={[st.grid, { marginBottom: 6 }]}>
                {pays.map(function (x) { return <Chip key={x.id} label={x.label} active={pay === x.id} onPress={function () { setPay(x.id); }} color={C.blue} />; })}
              </View>
            </View>
          ) : null}

          {group !== 'grande' ? (
            <View>
              <Text style={st.label}>Data</Text>
              <Row style={{ marginBottom: 8 }}>
                <Chip label="Hoje" active={dateMode === 'hoje'} onPress={function () { setDateMode('hoje'); }} />
                <Chip label="Ontem" active={dateMode === 'ontem'} onPress={function () { setDateMode('ontem'); }} />
                <Chip label="Outra" active={dateMode === 'outra'} onPress={function () { setDateMode('outra'); }} />
              </Row>
              {dateMode === 'outra' ? <Field value={dateStr} onChangeText={setDateStr} placeholder="DD/MM/AAAA" keyboardType="numbers-and-punctuation" /> : null}
            </View>
          ) : null}

          <Btn label="Salvar" onPress={save} color={gc} style={{ marginTop: 10, marginBottom: 30 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // ============================================================
  //  Tela: Extrato
  // ============================================================
  function ExtratoScreen(p) {
    var data = p.data, mk = p.mk;
    var _a = useState('todos'), filter = _a[0], setFilter = _a[1];
    var b = budget(data, mk);
    var list = b.txM.slice().sort(function (x, y) { return new Date(y.date) - new Date(x.date); });
    if (filter !== 'todos') list = list.filter(function (t) { return t.group === filter; });
    var groups = {}, order = [];
    list.forEach(function (t) { var k = dateBR(t.date); if (!groups[k]) { groups[k] = []; order.push(k); } groups[k].push(t); });
    var total = sum(list, function (t) { return t.group === 'extra' ? t.amount : -t.amount; });

    return (
      <ScrollView contentContainerStyle={st.screen}>
        <MonthNav mk={mk} setMk={p.setMk} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
          <Chip label="Todos" active={filter === 'todos'} onPress={function () { setFilter('todos'); }} />
          {Object.keys(GROUPS).map(function (g) { return <Chip key={g} label={GROUPS[g].icon + ' ' + GROUPS[g].label} active={filter === g} color={GROUPS[g].color} onPress={function () { setFilter(g); }} />; })}
        </ScrollView>
        <Card>
          <Row>
            <Stat label="Itens" value={String(list.length)} />
            <Stat label="Total" value={fmt(total)} />
          </Row>
        </Card>
        {order.length === 0 ? <Muted>Nada neste mês.</Muted> : null}
        {order.map(function (day) {
          var items = groups[day];
          var dnum = new Date(items[0].date).getDate();
          var diaDay = b.perDay[dnum - 1] || 0;
          var over = diaDay > b.base + 0.001;
          return (
            <View key={day}>
              <Row style={{ justifyContent: 'space-between', marginTop: 8, marginBottom: 4 }}>
                <Muted>{day} · {WEEKDAYS[new Date(items[0].date).getDay()]}</Muted>
                {diaDay > 0 ? <Text style={{ color: over ? C.red : C.green, fontSize: 12, fontWeight: '700' }}>dia a dia {fmt(diaDay)} / {fmt(b.base)}</Text> : null}
              </Row>
              <Card style={{ paddingVertical: 4 }}>
                {items.map(function (t) { return <TxItem key={t.id} t={t} cards={data.cards} onPress={function () { p.openTx(t); }} />; })}
              </Card>
            </View>
          );
        })}
        <Muted style={{ textAlign: 'center', marginTop: 10, fontSize: 12 }}>Toque em um lançamento para excluir.</Muted>
      </ScrollView>
    );
  }

  // ============================================================
  //  Tela: Análise
  // ============================================================
  function AnaliseScreen(p) {
    var data = p.data, mk = p.mk;
    var a = useMemo(function () { return analyze(data, mk); }, [data, mk]);
    var b = a.b;
    var scoreColor = a.score >= 75 ? C.green : a.score >= 50 ? C.yellow : C.red;
    var scoreTxt = a.score >= 75 ? 'No controle' : a.score >= 50 ? 'Atenção' : 'Crítico';
    var maxDay = Math.max.apply(null, b.perDay.concat([b.base, 1]));
    var maxWd = Math.max.apply(null, a.wd.concat([1]));
    var chartH = 90;

    return (
      <ScrollView contentContainerStyle={st.screen}>
        <MonthNav mk={mk} setMk={p.setMk} />

        <Card style={{ alignItems: 'center' }}>
          <Muted>Controle do mês</Muted>
          <Text style={{ fontSize: 48, fontWeight: '800', color: scoreColor }}>{a.score}</Text>
          <Text style={{ color: scoreColor, fontWeight: '700' }}>{scoreTxt}</Text>
          <Row style={{ marginTop: 12 }}>
            <Stat label="Limite/dia" value={fmt(b.base)} color={C.green} />
            <Stat label="Média/dia" value={fmt(a.mediaDia)} color={a.mediaDia > b.base ? C.red : C.green} />
            <Stat label="Dias acima" value={b.diasAcima + '/' + b.diasCorridos} color={b.diasAcima > 0 ? C.yellow : C.green} />
          </Row>
        </Card>

        <Card>
          <H style={{ marginBottom: 4 }}>Gasto do dia a dia por dia</H>
          <Muted style={{ fontSize: 12, marginBottom: 10 }}>Linha = limite diário ({fmt(b.base)}). Vermelho passou.</Muted>
          <View style={{ height: chartH + 16 }}>
            <View style={{ position: 'absolute', left: 0, right: 0, top: chartH - (b.base / maxDay) * chartH, height: 1, backgroundColor: C.green }} />
            <Row style={{ alignItems: 'flex-end', height: chartH }}>
              {b.perDay.map(function (v, i) {
                return <View key={i} style={{ flex: 1, marginHorizontal: 1, height: Math.max(1, (v / maxDay) * chartH), backgroundColor: i < b.firstDay - 1 ? C.card2 : v > b.base + 0.001 ? C.red : i < b.today ? C.blue : C.border, borderRadius: 2 }} />;
              })}
            </Row>
            <Row style={{ justifyContent: 'space-between', marginTop: 2 }}>
              <Text style={{ color: C.muted, fontSize: 10 }}>1</Text>
              <Text style={{ color: C.muted, fontSize: 10 }}>{Math.ceil(b.dim / 2)}</Text>
              <Text style={{ color: C.muted, fontSize: 10 }}>{b.dim}</Text>
            </Row>
          </View>
          {a.worst.length ? <Muted style={{ fontSize: 12, marginTop: 8 }}>Piores dias: {a.worst.map(function (w) { return 'dia ' + w.day + ' (' + fmt(w.v) + ')'; }).join(', ')}</Muted> : null}
        </Card>

        <Formula b={b} investPct={data.settings.investPct} />

        <Card style={{ borderColor: C.red }}>
          <H style={{ marginBottom: 8 }}>🔎 Raio-X do dia a dia</H>
          <Row style={{ marginBottom: 10 }}>
            <Stat label="Total" value={fmt(b.diaGasto)} color={C.red} />
            <Stat label="Compras" value={String(b.diaTx.length)} />
            <Stat label="Ritmo do mês" value={fmt(a.ritmo)} color={a.ritmo > b.saldoDiaMes ? C.red : C.yellow} />
          </Row>
          <Muted style={{ marginBottom: 6 }}>Por dia da semana</Muted>
          <Row style={{ alignItems: 'flex-end', height: 80 }}>
            {a.wd.map(function (v, i) {
              return (
                <View key={i} style={{ flex: 1, alignItems: 'center' }}>
                  <View style={{ width: 18, height: Math.max(2, (v / maxWd) * 60), backgroundColor: v === maxWd && v > 0 ? C.red : C.border, borderRadius: 4 }} />
                  <Text style={{ color: C.muted, fontSize: 11, marginTop: 4 }}>{WEEKDAYS[i].slice(0, 3)}</Text>
                </View>
              );
            })}
          </Row>
          <Muted style={{ marginTop: 10, fontSize: 12 }}>Compras pequenas (até {fmt(data.settings.pequeno)}): {a.small.length}x = {fmt(a.smallTotal)}</Muted>
        </Card>

        <Card>
          <H style={{ marginBottom: 10 }}>Para onde foi o dia a dia</H>
          {a.topCats.length === 0 ? <Muted>Sem gastos neste mês.</Muted> : null}
          {a.topCats.slice(0, 8).map(function (c) {
            return (
              <View key={c.id} style={{ marginBottom: 8 }}>
                <Row style={{ justifyContent: 'space-between', marginBottom: 3 }}>
                  <Text style={st.txt}>{catOf(c.id).icon} {catOf(c.id).label} <Text style={{ color: C.muted }}>({c.count}x)</Text></Text>
                  <Text style={st.txt}>{fmt(c.total)}</Text>
                </Row>
                <Bar value={c.total} max={a.topCats[0].total} color={C.purple} height={6} />
              </View>
            );
          })}
        </Card>

        <Card>
          <H style={{ marginBottom: 8 }}>💳 Cartões (fatura atual)</H>
          {data.cards.length === 0 ? <Muted>Nenhum cartão.</Muted> : null}
          {data.cards.map(function (c) {
            var ci = cardInfo(c, data.tx);
            return (
              <View key={c.id} style={{ marginBottom: 10 }}>
                <Row style={{ justifyContent: 'space-between' }}>
                  <Text style={st.txt}>{c.name}</Text>
                  <Text style={[st.txt, { color: C.red, fontWeight: '700' }]}>{fmt(ci.fatura)}</Text>
                </Row>
                {c.limit > 0 ? <View style={{ marginTop: 4 }}><Bar value={ci.usado} max={c.limit} color={pct(ci.usado, c.limit) > 70 ? C.red : C.blue} /></View> : null}
                <Muted style={{ fontSize: 12, marginTop: 2 }}>Fecha dia {c.closingDay} · vence dia {c.dueDay}{c.limit > 0 ? ' · usado ' + fmt(ci.usado) + ' de ' + fmt(c.limit) : ''}</Muted>
              </View>
            );
          })}
        </Card>

        <H style={{ marginBottom: 8, marginTop: 4 }}>💡 Diagnóstico</H>
        {a.ins.length === 0 ? <Muted>Lance seus gastos para receber o diagnóstico.</Muted> : null}
        {a.ins.map(function (x, i) {
          return <Card key={i} style={{ borderLeftWidth: 4, borderLeftColor: x.c }}><Text style={st.txt}>{x.t}</Text></Card>;
        })}
      </ScrollView>
    );
  }

  // ============================================================
  //  Tela: Metas
  // ============================================================
  function MetasScreen(p) {
    var data = p.data, update = p.update;
    var b = budget(data, currentMk());
    var patrimonio = sum(data.goals, goalSaved);
    var _a = useState(false), showNew = _a[0], setShowNew = _a[1];
    var _b = useState(''), name = _b[0], setName = _b[1];
    var _c = useState('🎯'), icon = _c[0], setIcon = _c[1];
    var _d = useState(''), target = _d[0], setTarget = _d[1];
    var _e = useState(''), deadline = _e[0], setDeadline = _e[1];
    var _f = useState(null), moveGoal = _f[0], setMoveGoal = _f[1];
    var _g = useState(''), moveVal = _g[0], setMoveVal = _g[1];
    var _h = useState(1), moveSign = _h[0], setMoveSign = _h[1];
    var reservaIdeal = (b.F + b.M) * 6;
    var hasReserva = data.goals.some(function (g) { return g.kind === 'reserva'; });

    var addGoal = function (g) { update(function (d) { return Object.assign({}, d, { goals: d.goals.concat([Object.assign({ id: uid(), moves: [] }, g)]) }); }); };
    var createGoal = function () {
      var t = parseMoney(target);
      if (!name || t <= 0) return Alert.alert('Preencha', 'Informe nome e valor da meta.');
      addGoal({ name: name, icon: icon, target: t, deadline: deadline.trim() });
      setName(''); setTarget(''); setDeadline(''); setShowNew(false);
    };
    var doMove = function () {
      var v = parseMoney(moveVal);
      if (v <= 0) return;
      var g0 = moveGoal;
      update(function (d) { return Object.assign({}, d, { goals: d.goals.map(function (g) { return g.id === g0.id ? Object.assign({}, g, { moves: (g.moves || []).concat([{ id: uid(), amount: v * moveSign, date: new Date().toISOString() }]) }) : g; }) }); });
      p.toast(moveSign > 0 ? '💰 ' + fmt(v) + ' guardados em ' + g0.name : 'Retirada de ' + fmt(v) + ' registrada.');
      setMoveGoal(null); setMoveVal('');
    };
    var delGoal = function (g) {
      Alert.alert('Excluir meta', 'Excluir "' + g.name + '"?', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: function () { update(function (d) { return Object.assign({}, d, { goals: d.goals.filter(function (x) { return x.id !== g.id; }) }); }); } },
      ]);
    };
    var monthsUntil = function (dl) {
      var m = String(dl || '').match(/^(\d{1,2})\/(\d{4})$/);
      if (!m) return 0;
      var now = new Date();
      return (Number(m[2]) - now.getFullYear()) * 12 + (Number(m[1]) - 1 - now.getMonth());
    };

    return (
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={st.screen} keyboardShouldPersistTaps="handled">
          <Text style={[st.h, { fontSize: 24, marginBottom: 12 }]}>Metas e Patrimônio</Text>
          <Card style={{ alignItems: 'center' }}>
            <Muted>Patrimônio guardado</Muted>
            <Text style={{ fontSize: 34, fontWeight: '800', color: C.blue }}>{fmt(patrimonio)}</Text>
          </Card>
          <Card>
            <Row style={{ justifyContent: 'space-between', marginBottom: 6 }}>
              <H>Investimento + reserva do mês</H>
              <Text style={{ color: C.blue, fontWeight: '700' }}>{Math.round(pct(b.invested, b.I))}%</Text>
            </Row>
            <Bar value={b.invested} max={b.I} color={C.blue} height={10} />
            <Muted style={{ marginTop: 6 }}>{fmt(b.invested)} de {fmt(b.I)} ({data.settings.investPct}% do salário)</Muted>
            <Muted style={{ marginTop: 8, fontSize: 12 }}>Assim que o salário cair, transfira {fmt(b.I)} e registre aqui em “+ Guardar”.</Muted>
          </Card>
          {!hasReserva ? (
            <Card style={{ borderColor: C.yellow }}>
              <H>🛟 Reserva de segurança</H>
              <Muted style={{ marginVertical: 6 }}>Meta: 6 meses de fixos + mercado = {fmt(reservaIdeal)}. Guarde em algo com liquidez diária (CDB 100% CDI ou Tesouro Selic).</Muted>
              <Btn label="Criar meta de reserva" color={C.yellow} onPress={function () { addGoal({ name: 'Reserva de segurança', icon: '🛟', target: reservaIdeal || 10000, kind: 'reserva' }); }} />
            </Card>
          ) : null}
          {data.goals.map(function (g) {
            var saved = goalSaved(g), falta = Math.max(0, g.target - saved), mu = monthsUntil(g.deadline);
            return (
              <Card key={g.id}>
                <Row style={{ justifyContent: 'space-between' }}>
                  <Text style={[st.h, { flex: 1 }]}>{g.icon} {g.name}</Text>
                  <TouchableOpacity onPress={function () { delGoal(g); }}><Text style={{ color: C.muted }}>🗑</Text></TouchableOpacity>
                </Row>
                <Text style={{ color: C.text, marginVertical: 6 }}><Text style={{ color: C.blue, fontWeight: '700' }}>{fmt(saved)}</Text> de {fmt(g.target)}</Text>
                <Bar value={saved} max={g.target} color={C.blue} height={10} />
                <Muted style={{ marginTop: 6, fontSize: 12 }}>{falta <= 0 ? '🎉 Meta atingida!' : 'Faltam ' + fmt(falta)}{falta > 0 && mu > 0 ? ' · guarde ' + fmt(falta / mu) + '/mês até ' + g.deadline : ''}</Muted>
                <Row style={{ marginTop: 10 }}>
                  <Btn small label="+ Guardar" color={C.blue} onPress={function () { setMoveGoal(g); setMoveSign(1); }} style={{ marginRight: 8 }} />
                  <Btn small label="− Retirar" outline color={C.muted} onPress={function () { setMoveGoal(g); setMoveSign(-1); }} />
                </Row>
              </Card>
            );
          })}
          {showNew ? (
            <Card>
              <H style={{ marginBottom: 8 }}>Nova meta</H>
              <Field label="Nome" value={name} onChangeText={setName} placeholder="Ex: Quitar moto, viagem" />
              <View style={[st.grid, { marginBottom: 8 }]}>
                {GOAL_ICONS.map(function (i) { return <Chip key={i} label={i} active={icon === i} onPress={function () { setIcon(i); }} color={C.blue} />; })}
              </View>
              <Field label="Valor alvo" value={target} onChangeText={setTarget} keyboardType="decimal-pad" placeholder="0,00" />
              <Field label="Prazo (opcional, MM/AAAA)" value={deadline} onChangeText={setDeadline} placeholder="12/2027" keyboardType="numbers-and-punctuation" />
              <Row>
                <Btn label="Criar" onPress={createGoal} color={C.blue} style={{ flex: 1, marginRight: 8 }} />
                <Btn label="Cancelar" outline color={C.muted} onPress={function () { setShowNew(false); }} />
              </Row>
            </Card>
          ) : <Btn label="+ Nova meta" outline color={C.blue} onPress={function () { setShowNew(true); }} />}

          <Modal visible={!!moveGoal} transparent animationType="fade" onRequestClose={function () { setMoveGoal(null); }}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={st.modalBg}>
              <View style={st.modalBox}>
                <H style={{ marginBottom: 8 }}>{moveSign > 0 ? 'Guardar em' : 'Retirar de'} {moveGoal ? moveGoal.name : ''}</H>
                <TextInput autoFocus value={moveVal} onChangeText={setMoveVal} placeholder="0,00" placeholderTextColor={C.border} keyboardType="decimal-pad" style={st.bigInput} />
                <Row>
                  <Btn label="Confirmar" onPress={doMove} color={C.blue} style={{ flex: 1, marginRight: 8 }} />
                  <Btn label="Cancelar" outline color={C.muted} onPress={function () { setMoveGoal(null); }} />
                </Row>
              </View>
            </KeyboardAvoidingView>
          </Modal>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // ============================================================
  //  Tela: Ajustes
  // ============================================================
  function AjustesScreen(p) {
    var data = p.data, update = p.update, s = data.settings;
    var _a = useState({
      salario: moneyStr(s.salario), investPct: String(s.investPct), mercado: moneyStr(s.mercado) || '0',
      pequeno: String(s.pequeno), horasMes: String(s.horasMes), taxaMes: String(s.taxaMes).replace('.', ','),
    }), form = _a[0], setForm = _a[1];
    var _b = useState({ name: '', limit: '', closingDay: '', dueDay: '', role: 'dia' }), card = _b[0], setCard = _b[1];
    var _c = useState(''), importTxt = _c[0], setImportTxt = _c[1];

    var saveSettings = function () {
      if (parseMoney(form.salario) <= 0) return Alert.alert('Obrigatório', 'Informe o salário.');
      update(function (d) {
        return Object.assign({}, d, { settings: Object.assign({}, d.settings, {
          salario: parseMoney(form.salario), investPct: parseMoney(form.investPct), mercado: parseMoney(form.mercado),
          pequeno: parseMoney(form.pequeno) || 30, horasMes: parseMoney(form.horasMes) || 176, taxaMes: parseMoney(form.taxaMes),
        }) });
      });
      p.toast('✅ Ajustes salvos');
    };
    var addCard = function () {
      if (!card.name) return Alert.alert('Informe o nome do cartão');
      update(function (d) { return Object.assign({}, d, { cards: d.cards.concat([{ id: uid(), name: card.name, role: card.role, limit: parseMoney(card.limit), closingDay: parseInt(card.closingDay, 10) || 1, dueDay: parseInt(card.dueDay, 10) || 10 }]) }); });
      setCard({ name: '', limit: '', closingDay: '', dueDay: '', role: 'dia' });
    };
    var editCard = function (c, k, v) {
      update(function (d) { return Object.assign({}, d, { cards: d.cards.map(function (x) { if (x.id !== c.id) return x; var n = Object.assign({}, x); n[k] = v; return n; }) }); });
    };
    var delCard = function (c) {
      Alert.alert('Excluir cartão', 'Excluir ' + c.name + '? Os lançamentos continuam.', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: function () { update(function (d) { return Object.assign({}, d, { cards: d.cards.filter(function (x) { return x.id !== c.id; }) }); }); } },
      ]);
    };
    var doExport = function () { Share.share({ message: JSON.stringify(data) }); };
    var doImport = function () {
      try {
        var obj = JSON.parse(importTxt);
        if (!obj || !Array.isArray(obj.tx)) throw new Error('formato');
        Alert.alert('Importar backup', 'Isso substitui todos os dados atuais. Continuar?', [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Importar', style: 'destructive', onPress: function () { update(function () { return normalize(obj); }); setImportTxt(''); p.toast('✅ Backup importado'); } },
        ]);
      } catch (e) { Alert.alert('Backup inválido', 'Cole o texto completo exportado pelo app.'); }
    };
    var wipe = function () {
      Alert.alert('Apagar tudo', 'Todos os dados serão apagados e você refaz a configuração. Tem certeza?', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Apagar', style: 'destructive', onPress: function () { update(function () { return emptyData(); }); } },
      ]);
    };
    var F = function (k, label, extra) {
      return <Field label={label} value={form[k]} onChangeText={function (v) { var n = Object.assign({}, form); n[k] = v; setForm(n); }} keyboardType="decimal-pad" placeholder={extra} />;
    };
    var pays = allPays(data.cards);

    return (
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={st.screen} keyboardShouldPersistTaps="handled">
          <Header title="Ajustes" back={p.back} />
          <Card>
            <H style={{ marginBottom: 10 }}>💼 Renda e orçamento</H>
            {F('salario', 'Salário líquido mensal (R$)')}
            {F('investPct', '% para investimento + reserva de segurança')}
            {F('mercado', 'Orçamento de mercado por mês (R$)')}
            {F('pequeno', 'Considerar "compra pequena" até (R$)')}
            {F('horasMes', 'Horas trabalhadas por mês')}
            {F('taxaMes', 'Rendimento estimado ao mês (%) p/ simulações')}
            <Btn label="Salvar" onPress={saveSettings} />
          </Card>

          <TouchableOpacity onPress={p.goFixos}>
            <Card><Row style={{ justifyContent: 'space-between' }}><H>📌 Gastos fixos</H><Text style={st.txt}>{data.fixed.length} itens ›</Text></Row></Card>
          </TouchableOpacity>

          <Card>
            <H style={{ marginBottom: 6 }}>Pagamento padrão</H>
            <Muted style={{ fontSize: 12, marginBottom: 6 }}>Dia a dia e lançamento rápido:</Muted>
            <View style={st.grid}>
              {pays.map(function (x) { return <Chip key={x.id} label={x.label} active={s.defaultPay === x.id} color={C.blue} onPress={function () { update(function (d) { return Object.assign({}, d, { settings: Object.assign({}, d.settings, { defaultPay: x.id }) }); }); }} />; })}
            </View>
            <Muted style={{ fontSize: 12, marginBottom: 6 }}>Compras grandes:</Muted>
            <View style={st.grid}>
              {pays.map(function (x) { return <Chip key={x.id} label={x.label} active={s.grandePay === x.id} color={C.purple} onPress={function () { update(function (d) { return Object.assign({}, d, { settings: Object.assign({}, d.settings, { grandePay: x.id }) }); }); }} />; })}
            </View>
          </Card>

          <Card>
            <H style={{ marginBottom: 10 }}>💳 Cartões de crédito</H>
            {data.cards.map(function (c) {
              var ci = cardInfo(c, data.tx);
              return (
                <View key={c.id} style={[st.listRow, { flexDirection: 'column', alignItems: 'stretch' }]}>
                  <Row style={{ justifyContent: 'space-between' }}>
                    <Text style={st.txt}>{c.name} · {c.role === 'grandes' ? 'compras grandes' : 'dia a dia'}</Text>
                    <TouchableOpacity onPress={function () { delCard(c); }}><Text style={{ color: C.muted }}>🗑</Text></TouchableOpacity>
                  </Row>
                  <Text style={{ color: C.red, fontWeight: '700', marginVertical: 4 }}>Fatura atual: {fmt(ci.fatura)}</Text>
                  <Row>
                    <Field wrap={{ flex: 1, marginRight: 6 }} label="Limite" value={moneyStr(c.limit)} onChangeText={function (v) { editCard(c, 'limit', parseMoney(v)); }} keyboardType="decimal-pad" />
                    <Field wrap={{ width: 70, marginRight: 6 }} label="Fecha" value={String(c.closingDay || '')} onChangeText={function (v) { editCard(c, 'closingDay', parseInt(v, 10) || 0); }} keyboardType="number-pad" />
                    <Field wrap={{ width: 70 }} label="Vence" value={String(c.dueDay || '')} onChangeText={function (v) { editCard(c, 'dueDay', parseInt(v, 10) || 0); }} keyboardType="number-pad" />
                  </Row>
                </View>
              );
            })}
            <Field label="Novo cartão" value={card.name} onChangeText={function (v) { setCard(Object.assign({}, card, { name: v })); }} placeholder="Ex: Nubank" />
            <Row style={{ marginBottom: 8 }}>
              <Chip label="Dia a dia" active={card.role === 'dia'} color={C.red} onPress={function () { setCard(Object.assign({}, card, { role: 'dia' })); }} />
              <Chip label="Compras grandes" active={card.role === 'grandes'} color={C.purple} onPress={function () { setCard(Object.assign({}, card, { role: 'grandes' })); }} />
            </Row>
            <Btn label="+ Adicionar cartão" outline onPress={addCard} />
          </Card>

          <Btn label="Refazer configuração do mês" outline color={C.yellow} onPress={p.redoSetup} style={{ marginBottom: 12 }} />

          <Card>
            <H style={{ marginBottom: 6 }}>💾 Backup</H>
            <Muted style={{ marginBottom: 10, fontSize: 12 }}>Exporte de vez em quando e salve nas Notas. Para restaurar, cole o texto abaixo.</Muted>
            <Btn label="Exportar backup" onPress={doExport} color={C.blue} style={{ marginBottom: 10 }} />
            <TextInput value={importTxt} onChangeText={setImportTxt} multiline placeholder="Cole aqui o backup..." placeholderTextColor={C.muted} style={[st.input, { height: 80, textAlignVertical: 'top' }]} />
            <Btn label="Importar backup" outline color={C.blue} onPress={doImport} style={{ marginTop: 8 }} />
          </Card>
          <Btn label="Apagar todos os dados" outline color={C.red} onPress={wipe} style={{ marginBottom: 12 }} />
          <Muted style={{ textAlign: 'center', fontSize: 12, marginBottom: 30 }}>Versão {VERSION} · atualiza sozinho ao abrir</Muted>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // ============================================================
  //  Modal de lançamento
  // ============================================================
  function TxModal(p) {
    var t = p.t;
    if (!t) return null;
    var c = catOf(t.cat);
    var siblings = t.parentId ? p.data.tx.filter(function (x) { return x.parentId === t.parentId; }) : [];
    var del = function (all) {
      Alert.alert('Excluir', all ? 'Excluir todas as ' + siblings.length + ' parcelas?' : 'Excluir este lançamento?', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: function () {
          p.update(function (d) { return Object.assign({}, d, { tx: d.tx.filter(function (x) { return all ? x.parentId !== t.parentId : x.id !== t.id; }) }); });
          p.close();
        } },
      ]);
    };
    return (
      <Modal visible transparent animationType="slide" onRequestClose={p.close}>
        <TouchableOpacity activeOpacity={1} onPress={p.close} style={st.modalBg}>
          <TouchableOpacity activeOpacity={1} style={st.modalBox}>
            <Text style={{ fontSize: 34, textAlign: 'center' }}>{c.icon}</Text>
            <Text style={[st.h, { textAlign: 'center' }]}>{t.desc || c.label}</Text>
            <Text style={{ color: t.group === 'extra' ? C.green : C.red, fontSize: 28, fontWeight: '800', textAlign: 'center', marginVertical: 6 }}>{fmt(t.amount)}</Text>
            <Muted style={{ textAlign: 'center', marginBottom: 12 }}>{dateBR(t.date)} · {(GROUPS[t.group] || GROUPS.dia).label}{t.pay ? ' · ' + payLabel(t.pay, p.data.cards) : ''}</Muted>
            {siblings.length > 1 ? <Btn label={'Excluir todas as parcelas (' + siblings.length + ')'} outline color={C.red} onPress={function () { del(true); }} style={{ marginBottom: 8 }} /> : null}
            <Row>
              <Btn label="Excluir" outline color={C.red} onPress={function () { del(false); }} style={{ flex: 1, marginRight: 8 }} />
              <Btn label="Fechar" color={C.card2} onPress={p.close} style={{ flex: 1 }} />
            </Row>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    );
  }

  // ---------- Dados: normalizar e migrar ----------
  function normalize(obj) {
    var d = Object.assign(emptyData(), obj || {});
    d.settings = Object.assign({}, DEFAULT_SETTINGS, (obj && obj.settings) || {});
    d.fixedMonth = d.fixedMonth || {};
    d.fixed = (d.fixed || []).map(function (f) { return Object.assign({ icon: '🧾', varia: false, day: 10 }, f); });
    d.cards = (d.cards || []).map(function (c) { return Object.assign({ role: 'dia', closingDay: 1, dueDay: 10, limit: 0 }, c); });
    d.goals = d.goals || [];
    d.tx = (d.tx || []).filter(function (t) { return t && t.amount > 0; });
    return d;
  }
  function migrateV1(old) {
    var d = emptyData();
    if (!old) return d;
    var s = old.settings || {};
    d.settings.salario = Number(s.renda) || 0;
    d.settings.investPct = s.investPct != null ? Number(s.investPct) : 20;
    d.goals = old.goals || [];
    d.cards = (old.cards || []).map(function (c) { return Object.assign({ role: 'dia' }, c); });
    d.fixed = (old.fixed || []).map(function (f) { return { id: f.id, name: f.name, icon: '🧾', amount: f.amount, day: f.day || 10, varia: false }; });
    d.tx = (old.tx || []).filter(function (t) { return !t.fixedId; }).map(function (t) {
      if (t.type === 'in') return { id: t.id, group: 'extra', cat: 'extra', amount: t.amount, desc: t.desc, date: t.date };
      return { id: t.id, group: t.cat === 'mercado' ? 'mercado' : 'dia', cat: t.cat === 'mercado' ? 'mercado' : (catOf(t.cat).icon !== '•' ? t.cat : 'outros'), amount: t.amount, desc: t.desc, date: t.date, hasTime: t.hasTime, pay: t.pay };
    }).filter(function (t) { return !(t.group === 'extra' && /sal[aá]rio/i.test(t.desc || '')); });
    return d;
  }

  // ============================================================
  //  App principal
  // ============================================================
  var TABS = [
    { id: 'home', label: 'Início', icon: '🏠' },
    { id: 'extrato', label: 'Extrato', icon: '📄' },
    { id: 'add', label: 'Lançar', icon: '➕' },
    { id: 'analise', label: 'Análise', icon: '📊' },
    { id: 'metas', label: 'Metas', icon: '🎯' },
  ];

  function App() {
    var _a = useState(emptyData), data = _a[0], setData = _a[1];
    var _b = useState(false), loaded = _b[0], setLoaded = _b[1];
    var _c = useState('home'), tab = _c[0], setTab = _c[1];
    var _d = useState(currentMk()), mk = _d[0], setMk = _d[1];
    var _e = useState(null), txOpen = _e[0], setTxOpen = _e[1];
    var _f = useState(''), msg = _f[0], setMsg = _f[1];
    var _g = useState(false), redo = _g[0], setRedo = _g[1];

    useEffect(function () {
      AsyncStorage.getItem(STORAGE_KEY).then(function (raw) {
        if (raw) {
          try { setData(normalize(JSON.parse(raw))); } catch (e) { /* começa vazio */ }
          setLoaded(true);
          return null;
        }
        return AsyncStorage.getItem(OLD_KEY).then(function (old) {
          if (old) { try { setData(migrateV1(JSON.parse(old))); } catch (e) { /* ignora */ } }
          setLoaded(true);
        });
      }).catch(function () { setLoaded(true); });
    }, []);
    useEffect(function () { if (loaded) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }, [data, loaded]);

    var update = function (fn) { setData(function (d) { return fn(d); }); };
    var toast = function (m) { setMsg(m); setTimeout(function () { setMsg(''); }, 4500); };

    var addTx = function (list) {
      var next = Object.assign({}, data, { tx: data.tx.concat(list) });
      setData(function (d) { return Object.assign({}, d, { tx: d.tx.concat(list) }); });
      var t = list[0];
      var tmk = mkOf(t.date);
      if (t.group === 'dia' || t.group === 'mercado') {
        var a = budget(next, tmk);
        if (!a.isCur) toast('✅ ' + fmt(t.amount) + ' lançado em ' + mkLabel(tmk));
        else if (t.group === 'mercado' && a.mercadoExc <= 0) toast('🛒 Mercado: ' + fmt(a.mercadoReal) + ' de ' + fmt(a.M) + ' (resta ' + fmt(a.M - a.mercadoReal) + ')');
        else if (a.divida > 0) toast('⚠️ Passou ' + fmt(a.divida) + ' do limite. ' + (a.proximos.length ? 'Amanhã você terá ' + fmt(a.proximos[0].livre) + ' de ' + fmt(a.base) + '.' : 'Último dia: excesso sai da sobra do mês.'));
        else toast('✅ ' + fmt(t.amount) + ' lançado. Ainda pode gastar hoje: ' + fmt(a.disponivelHoje));
      } else if (t.group === 'grande') {
        var b2 = budget(next, tmk);
        toast('🛋️ ' + list.length + 'x de ' + fmt(t.amount) + '. Limite diário em ' + mkLabel(tmk) + ': ' + fmt(b2.base));
      } else toast('💰 Receita de ' + fmt(t.amount) + ' lançada');
    };

    if (!loaded) return <View style={{ flex: 1, backgroundColor: C.bg }} />;

    var toastView = msg ? <View style={st.toast}><Text style={st.toastTxt}>{msg}</Text></View> : null;

    if (!data.setupDone || redo) {
      return (
        <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
          <StatusBar barStyle="light-content" />
          <SetupScreen data={data} update={function (fn) { update(fn); setRedo(false); setTab('home'); }} toast={toast} cancel={redo ? function () { setRedo(false); } : null} />
          {toastView}
        </SafeAreaView>
      );
    }

    var screen;
    if (tab === 'home') screen = <HomeScreen data={data} addTx={addTx} openTx={setTxOpen} goAjustes={function () { setTab('ajustes'); }} goFixos={function () { setTab('fixos'); }} goTab={setTab} />;
    else if (tab === 'add') screen = <AddScreen data={data} addTx={addTx} />;
    else if (tab === 'extrato') screen = <ExtratoScreen data={data} mk={mk} setMk={setMk} openTx={setTxOpen} />;
    else if (tab === 'analise') screen = <AnaliseScreen data={data} mk={mk} setMk={setMk} />;
    else if (tab === 'metas') screen = <MetasScreen data={data} update={update} toast={toast} />;
    else if (tab === 'fixos') screen = <FixosScreen data={data} update={update} toast={toast} back={function () { setTab('home'); }} />;
    else screen = <AjustesScreen data={data} update={update} toast={toast} back={function () { setTab('home'); }} goFixos={function () { setTab('fixos'); }} redoSetup={function () { setRedo(true); }} />;

    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
        <StatusBar barStyle="light-content" />
        <View style={{ flex: 1 }}>{screen}</View>
        {toastView}
        <View style={st.tabBar}>
          {TABS.map(function (t) {
            return (
              <TouchableOpacity key={t.id} onPress={function () { setTab(t.id); }} style={st.tabItem}>
                {t.id === 'add' ? (
                  <View style={st.addBtn}><Text style={{ fontSize: 22, color: '#fff' }}>＋</Text></View>
                ) : (
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ fontSize: 20, opacity: tab === t.id ? 1 : 0.5 }}>{t.icon}</Text>
                    <Text style={{ fontSize: 11, color: tab === t.id ? C.green : C.muted, marginTop: 2 }}>{t.label}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
        <TxModal t={txOpen} data={data} close={function () { setTxOpen(null); }} update={update} />
      </SafeAreaView>
    );
  }

  // ---------- Estilos ----------
  var st = StyleSheet.create({
    screen: { padding: 16, paddingBottom: 40 },
    card: { backgroundColor: C.card, borderRadius: 16, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: C.border },
    h: { color: C.text, fontSize: 16, fontWeight: '700' },
    muted: { color: C.muted, fontSize: 14 },
    txt: { color: C.text, fontSize: 14 },
    label: { color: C.text, fontSize: 14, fontWeight: '600', marginBottom: 8, marginTop: 4 },
    row: { flexDirection: 'row', alignItems: 'center' },
    grid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 },
    chip: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1, borderColor: C.border, backgroundColor: C.card, marginRight: 8, marginBottom: 8 },
    chipTxt: { color: C.muted, fontSize: 13, fontWeight: '600' },
    btn: { paddingVertical: 13, paddingHorizontal: 18, borderRadius: 12, alignItems: 'center' },
    btnTxt: { color: '#fff', fontWeight: '700', fontSize: 15 },
    barBg: { backgroundColor: C.card2, borderRadius: 8, overflow: 'hidden', width: '100%' },
    input: { backgroundColor: C.card2, color: C.text, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, borderWidth: 1, borderColor: C.border },
    bigInput: { color: C.text, fontSize: 36, fontWeight: '800', paddingVertical: 8, marginBottom: 8 },
    navBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.border },
    navTxt: { color: C.text, fontSize: 24, marginTop: -2 },
    txItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.border },
    txTitle: { color: C.text, fontSize: 15, fontWeight: '600' },
    quickBtn: { width: '23%', marginRight: '2%', marginBottom: 8, backgroundColor: C.card2, borderRadius: 12, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: C.red + '55' },
    quickTxt: { color: C.text, fontWeight: '700', fontSize: 15 },
    catBtn: { width: '23%', marginRight: '2%', marginBottom: 8, backgroundColor: C.card, borderRadius: 12, paddingVertical: 10, alignItems: 'center', borderWidth: 1, borderColor: C.border },
    catTxt: { color: C.text, fontSize: 11, marginTop: 4 },
    listRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.border, marginBottom: 6 },
    dayBox: { width: '13%', alignItems: 'center', paddingVertical: 6, borderRadius: 10, borderWidth: 1, backgroundColor: C.card2 },
    tabBar: { flexDirection: 'row', backgroundColor: C.card, borderTopWidth: 1, borderTopColor: C.border, paddingTop: 8, paddingBottom: 6 },
    tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    addBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: C.green, alignItems: 'center', justifyContent: 'center', marginTop: -18, borderWidth: 3, borderColor: C.bg },
    toast: { position: 'absolute', top: 60, left: 16, right: 16, backgroundColor: C.card2, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: C.border, shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 10, elevation: 6 },
    toastTxt: { color: C.text, fontSize: 14, fontWeight: '600' },
    modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 20 },
    modalBox: { backgroundColor: C.card, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: C.border },
  });

  App.VERSION = VERSION;
  App.__test = { budget: budget, analyze: analyze, emptyData: emptyData, normalize: normalize, migrateV1: migrateV1, uid: uid,
    HomeScreen: HomeScreen, SetupScreen: SetupScreen, FixosScreen: FixosScreen, AddScreen: AddScreen, ExtratoScreen: ExtratoScreen,
    AnaliseScreen: AnaliseScreen, MetasScreen: MetasScreen, AjustesScreen: AjustesScreen, DEFAULT_CARDS: DEFAULT_CARDS };
  return App;
}
