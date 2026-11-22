// ============================================================
//  MEU DINHEIRO — Gestão financeira contra as "besteiras"
//  App nativo (React Native / Expo). Rode no Expo Snack + Expo Go.
//  Dados ficam salvos no próprio iPhone (AsyncStorage).
// ============================================================
import React, { useState, useEffect, useMemo } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet,
  SafeAreaView, Alert, Modal, KeyboardAvoidingView, Platform, Share, StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@meu_dinheiro_v1';

// ---------- Cores ----------
const C = {
  bg: '#0B0F14', card: '#151B23', card2: '#1C2430', border: '#263040',
  text: '#E8EEF5', muted: '#8A97A8', green: '#22C55E', red: '#EF4444',
  yellow: '#F59E0B', blue: '#3B82F6', purple: '#A855F7',
};

// ---------- Categorias ----------
// need padrão: essencial | importante (dava pra evitar) | superfluo (besteira)
const EXPENSE_CATS = [
  { id: 'lanche', label: 'Lanche', icon: '🍔', need: 'superfluo' },
  { id: 'delivery', label: 'Delivery', icon: '🛵', need: 'superfluo' },
  { id: 'cafe', label: 'Café', icon: '☕', need: 'superfluo' },
  { id: 'doces', label: 'Doces', icon: '🍫', need: 'superfluo' },
  { id: 'bebida', label: 'Bebida', icon: '🍺', need: 'superfluo' },
  { id: 'apps', label: 'Apps/Jogos', icon: '📱', need: 'superfluo' },
  { id: 'compras', label: 'Compras', icon: '🛍️', need: 'importante' },
  { id: 'lazer', label: 'Lazer', icon: '🎉', need: 'importante' },
  { id: 'assinaturas', label: 'Assinaturas', icon: '📺', need: 'importante' },
  { id: 'vestuario', label: 'Roupas', icon: '👕', need: 'importante' },
  { id: 'mercado', label: 'Mercado', icon: '🛒', need: 'essencial' },
  { id: 'moradia', label: 'Moradia', icon: '🏠', need: 'essencial' },
  { id: 'contas', label: 'Contas', icon: '💡', need: 'essencial' },
  { id: 'transporte', label: 'Transporte', icon: '🚗', need: 'essencial' },
  { id: 'saude', label: 'Saúde', icon: '💊', need: 'essencial' },
  { id: 'educacao', label: 'Educação', icon: '📚', need: 'essencial' },
  { id: 'pets', label: 'Pets', icon: '🐶', need: 'essencial' },
  { id: 'outros', label: 'Outros', icon: '📦', need: 'importante' },
];
const INCOME_CATS = [
  { id: 'salario', label: 'Salário', icon: '💼' },
  { id: 'freela', label: 'Freela/Extra', icon: '🧰' },
  { id: 'vendas', label: 'Vendas', icon: '🏷️' },
  { id: 'rendimentos', label: 'Rendimentos', icon: '📈' },
  { id: 'outros_in', label: 'Outros', icon: '💰' },
];
const QUICK_CATS = ['lanche', 'delivery', 'cafe', 'doces', 'bebida', 'apps'];
const QUICK_VALUES = [5, 10, 15, 20, 30, 40, 50];
const GOAL_ICONS = ['🛟', '📈', '🏠', '🚗', '✈️', '🎓', '💍', '💻', '🎯'];

const NEEDS = {
  essencial: { label: 'Precisava', icon: '✅', color: C.green },
  importante: { label: 'Dava pra evitar', icon: '🤔', color: C.yellow },
  superfluo: { label: 'Besteira', icon: '❌', color: C.red },
};
const PAYS_BASE = [
  { id: 'pix', label: 'Pix' }, { id: 'debito', label: 'Débito' }, { id: 'dinheiro', label: 'Dinheiro' },
];
const WEEKDAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

const DEFAULT_SETTINGS = {
  renda: 0,            // renda mensal prevista
  investPct: 20,       // % da renda para investir/guardar
  limiteBesteira: 0,   // 0 = automático (5% da renda)
  pequeno: 50,         // até quanto é "gasto pequeno"
  horasMes: 176,       // horas trabalhadas por mês
  taxaMes: 0.8,        // rendimento estimado % ao mês (simulações)
  defaultPay: 'pix',
};
const EMPTY = { tx: [], cards: [], fixed: [], goals: [], settings: DEFAULT_SETTINGS };

// ---------- Utilidades ----------
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
function fmt(v) {
  const n = Number(v) || 0;
  const s = Math.abs(n).toFixed(2);
  let [i, d] = s.split('.');
  i = i.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return (n < 0 ? '-' : '') + 'R$ ' + i + ',' + d;
}
function parseMoney(str) {
  if (typeof str === 'number') return str;
  let s = String(str || '').replace(/\s|R\$/g, '');
  if (s.includes(',')) s = s.replace(/\./g, '').replace(',', '.');
  const n = parseFloat(s);
  return isNaN(n) ? 0 : n;
}
const pct = (a, b) => (b > 0 ? (a / b) * 100 : 0);
const sum = (arr, f = (x) => x.amount) => arr.reduce((s, x) => s + (Number(f(x)) || 0), 0);
const pad = (n) => String(n).padStart(2, '0');
const mkOf = (dateLike) => { const d = new Date(dateLike); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`; };
const currentMk = () => mkOf(new Date());
function addMonths(mk, n) {
  const [y, m] = mk.split('-').map(Number);
  const d = new Date(y, m - 1 + n, 1);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
}
const mkLabel = (mk) => { const [y, m] = mk.split('-').map(Number); return `${MONTHS[m - 1]} ${y}`; };
const daysInMonth = (mk) => { const [y, m] = mk.split('-').map(Number); return new Date(y, m, 0).getDate(); };
const dateBR = (iso) => { const d = new Date(iso); return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`; };
function parseDateBR(s) {
  const m = String(s || '').trim().match(/^(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?$/);
  if (!m) return null;
  let y = m[3] ? Number(m[3]) : new Date().getFullYear();
  if (y < 100) y += 2000;
  const d = new Date(y, Number(m[2]) - 1, Number(m[1]), 12, 0, 0);
  return isNaN(d.getTime()) ? null : d;
}
const catOf = (id) => EXPENSE_CATS.find((c) => c.id === id) || INCOME_CATS.find((c) => c.id === id) || { label: id, icon: '•' };
const fv = (pmt, ratePct, months) => {
  const i = ratePct / 100;
  return i === 0 ? pmt * months : pmt * ((Math.pow(1 + i, months) - 1) / i);
};
const goalSaved = (g) => sum(g.moves || []);

function payLabel(pay, cards) {
  if (pay && pay.startsWith('card:')) {
    const c = cards.find((k) => 'card:' + k.id === pay);
    return c ? '💳 ' + c.name : '💳 Cartão';
  }
  const p = PAYS_BASE.find((x) => x.id === pay);
  return p ? p.label : '';
}

// Ciclo de fatura atual de um cartão
function cardCycle(card, ref = new Date()) {
  const c = Number(card.closingDay) || 1;
  const y = ref.getFullYear(), m = ref.getMonth();
  let start, end;
  if (ref.getDate() <= c) { start = new Date(y, m - 1, c + 1); end = new Date(y, m, c, 23, 59, 59); }
  else { start = new Date(y, m, c + 1); end = new Date(y, m + 1, c, 23, 59, 59); }
  return { start, end };
}
function cardInfo(card, tx) {
  const { start, end } = cardCycle(card);
  const mine = tx.filter((t) => t.type === 'out' && t.pay === 'card:' + card.id);
  const fatura = sum(mine.filter((t) => { const d = new Date(t.date); return d >= start && d <= end; }));
  const usado = sum(mine.filter((t) => new Date(t.date) >= start));
  return { fatura, usado, start, end };
}

// ---------- Cálculos do mês (orçamento) ----------
function monthNumbers(data, mk) {
  const s = data.settings;
  const txM = data.tx.filter((t) => mkOf(t.date) === mk);
  const outs = txM.filter((t) => t.type === 'out');
  const incomeM = sum(txM.filter((t) => t.type === 'in'));
  const R = Math.max(incomeM, Number(s.renda) || 0);
  const fixedTx = outs.filter((t) => t.fixedId);
  const paidIds = new Set(fixedTx.map((t) => t.fixedId));
  const unpaidFixed = data.fixed.filter((f) => !paidIds.has(f.id));
  const F = sum(fixedTx) + sum(unpaidFixed);
  const V = sum(outs.filter((t) => !t.fixedId));
  const despesas = sum(outs);
  const invested = sum(data.goals.flatMap((g) => (g.moves || []).filter((mv) => mkOf(mv.date) === mk)));
  const I = (R * (Number(s.investPct) || 0)) / 100;
  const disp = R - F - I;
  const restante = disp - V;
  const dim = daysInMonth(mk);
  const isCur = mk === currentMk();
  const today = new Date().getDate();
  const diasRest = isCur ? dim - today + 1 : 0;
  const porDia = isCur && diasRest > 0 ? Math.max(0, restante) / diasRest : 0;
  const besteiras = outs.filter((t) => t.need === 'superfluo');
  const besteiraM = sum(besteiras);
  const limite = Number(s.limiteBesteira) > 0 ? Number(s.limiteBesteira) : R * 0.05;
  return { txM, outs, incomeM, R, F, V, despesas, invested, I, disp, restante, dim, isCur, today, diasRest, porDia, besteiras, besteiraM, limite, unpaidFixed };
}

// ---------- Análise criteriosa ----------
function analyze(data, mk) {
  const s = data.settings;
  const n = monthNumbers(data, mk);
  const prev = monthNumbers(data, addMonths(mk, -1));
  const { outs, R, despesas, besteiras, besteiraM, limite, isCur, today, dim } = n;

  const byNeed = { essencial: 0, importante: 0, superfluo: 0 };
  outs.forEach((t) => { byNeed[t.need || 'importante'] += t.amount; });

  const small = outs.filter((t) => !t.fixedId && t.amount <= (Number(s.pequeno) || 50));
  const smallTotal = sum(small);

  const byCat = {};
  outs.forEach((t) => { byCat[t.cat] = byCat[t.cat] || { total: 0, count: 0 }; byCat[t.cat].total += t.amount; byCat[t.cat].count++; });
  const topCats = Object.entries(byCat).map(([id, v]) => ({ id, ...v })).sort((a, b) => b.total - a.total);

  const bCat = {};
  besteiras.forEach((t) => { bCat[t.cat] = bCat[t.cat] || { total: 0, count: 0 }; bCat[t.cat].total += t.amount; bCat[t.cat].count++; });
  const topBesteira = Object.entries(bCat).map(([id, v]) => ({ id, ...v })).sort((a, b) => b.total - a.total)[0];

  const wd = [0, 0, 0, 0, 0, 0, 0];
  const per = { Madrugada: 0, Manhã: 0, Tarde: 0, Noite: 0 };
  besteiras.forEach((t) => {
    const d = new Date(t.date);
    wd[d.getDay()] += t.amount;
    if (t.hasTime) {
      const h = d.getHours();
      per[h < 6 ? 'Madrugada' : h < 12 ? 'Manhã' : h < 18 ? 'Tarde' : 'Noite'] += t.amount;
    }
  });
  const topWd = wd.indexOf(Math.max(...wd));
  const topPer = Object.entries(per).sort((a, b) => b[1] - a[1])[0];

  const projBesteira = isCur && today > 0 ? (besteiraM / today) * dim : besteiraM;
  const hourly = R > 0 ? R / (Number(s.horasMes) || 176) : 0;
  const horasBesteira = hourly > 0 ? besteiraM / hourly : 0;
  const fv5 = fv(projBesteira, Number(s.taxaMes) || 0, 60);
  const fv10 = fv(projBesteira, Number(s.taxaMes) || 0, 120);
  const comprometido = despesas + (isCur ? sum(n.unpaidFixed) : 0); // inclui fixos ainda não pagos
  const sobra = R - comprometido - n.invested;
  const poupanca = pct(R - comprometido, R);
  const fixoPct = pct(n.F, R);
  const evitavel = byNeed.importante;
  const assinaturas = byCat.assinaturas ? byCat.assinaturas.total : 0;

  // Score 0-100
  let score = 100;
  if (R > 0) {
    if (poupanca < 0) score -= 40; else if (poupanca < 10) score -= 25; else if (poupanca < (Number(s.investPct) || 20)) score -= 10;
    if (pct(byNeed.superfluo, R) > 15) score -= 20; else if (pct(byNeed.superfluo, R) > 8) score -= 10;
    if (besteiraM > limite) score -= 15;
    if (fixoPct > 60) score -= 15; else if (fixoPct > 50) score -= 8;
    if (!isCur && n.invested < n.I) score -= 10;
  } else score = 0;
  score = Math.max(0, Math.min(100, Math.round(score)));

  const ins = [];
  if (R === 0) ins.push({ c: C.yellow, t: 'Cadastre sua renda mensal em Ajustes (⚙️ na tela Início) para liberar a análise completa.' });
  if (besteiraM > 0) {
    ins.push({ c: C.red, t: `Você gastou ${fmt(besteiraM)} em ${besteiras.length} besteiras este mês (média de ${fmt(besteiraM / besteiras.length)} cada).` });
    if (isCur && projBesteira > besteiraM) ins.push({ c: projBesteira > limite ? C.red : C.yellow, t: `No ritmo atual, o mês fecha com ${fmt(projBesteira)} em besteiras${projBesteira > limite ? ` — ${Math.round(pct(projBesteira - limite, limite))}% acima do seu limite de ${fmt(limite)}` : ''}. Em 12 meses: ${fmt(projBesteira * 12)}.` });
    if (horasBesteira >= 1) ins.push({ c: C.yellow, t: `Você trabalhou ~${horasBesteira.toFixed(1).replace('.', ',')} horas só para pagar besteiras este mês.` });
    if (projBesteira > 0) ins.push({ c: C.blue, t: `Se esse valor (${fmt(projBesteira)}/mês) fosse investido a ${String(s.taxaMes).replace('.', ',')}% a.m., viraria ${fmt(fv5)} em 5 anos e ${fmt(fv10)} em 10 anos.` });
    if (topBesteira) ins.push({ c: C.red, t: `Seu maior ralo: ${catOf(topBesteira.id).icon} ${catOf(topBesteira.id).label} — ${fmt(topBesteira.total)} em ${topBesteira.count}x.` });
    if (wd[topWd] > 0) ins.push({ c: C.muted, t: `${WEEKDAYS[topWd]} é o dia em que você mais gasta com besteiras. Planeje esse dia com antecedência.` });
    if (topPer && topPer[1] > 0) ins.push({ c: C.muted, t: `A maior parte das besteiras acontece de ${topPer[0].toLowerCase()} (${fmt(topPer[1])}). É nesse horário que a vontade vence.` });
  }
  if (small.length >= 5) ins.push({ c: C.yellow, t: `${small.length} gastos pequenos (até ${fmt(s.pequeno)}) somaram ${fmt(smallTotal)}. Sozinhos parecem nada; juntos são ${Math.round(pct(smallTotal, R))}% da renda.` });
  if (evitavel > 0) ins.push({ c: C.yellow, t: `${fmt(evitavel)} foram gastos que "davam pra evitar". Cortar metade libera ${fmt(evitavel / 2)} por mês.` });
  if (prev.besteiraM > 0 && besteiraM > 0 && !isCur) {
    const var_ = pct(besteiraM - prev.besteiraM, prev.besteiraM);
    ins.push({ c: var_ > 0 ? C.red : C.green, t: `Besteiras ${var_ > 0 ? 'subiram' : 'caíram'} ${Math.abs(Math.round(var_))}% em relação ao mês anterior.` });
  }
  if (R > 0) {
    if (poupanca < 0) ins.push({ c: C.red, t: `Você gastou ${fmt(-(R - comprometido))} a mais do que ganhou. Prioridade nº 1: parar o vazamento antes de investir.` });
    else if (poupanca < (Number(s.investPct) || 20)) ins.push({ c: C.yellow, t: `Sobraram ${Math.round(poupanca)}% da renda. Sua meta é guardar ${s.investPct}%. Faltaram ${fmt(((Number(s.investPct) / 100) * R) - (R - comprometido))}.` });
    else ins.push({ c: C.green, t: `Ótimo: sobraram ${Math.round(poupanca)}% da renda. Garanta que isso vá para investimento, não para a conta corrente.` });
    if (fixoPct > 50) ins.push({ c: C.red, t: `Gastos fixos consomem ${Math.round(fixoPct)}% da renda. Revise contratos, planos e assinaturas.` });
    if (assinaturas > 0) ins.push({ c: C.muted, t: `Assinaturas: ${fmt(assinaturas)}/mês = ${fmt(assinaturas * 12)}/ano. Use todas?` });
  }
  data.cards.forEach((c) => {
    const ci = cardInfo(c, data.tx);
    if (R > 0 && ci.fatura > R * 0.3) ins.push({ c: C.red, t: `Fatura do ${c.name} (${fmt(ci.fatura)}) passa de 30% da renda. Cuidado com a bola de neve.` });
  });
  if (n.invested > 0) ins.push({ c: C.green, t: `Você guardou/investiu ${fmt(n.invested)} neste mês${n.I > 0 ? ` (${Math.round(pct(n.invested, n.I))}% da meta)` : ''}.` });

  return { n, prev, comprometido, byNeed, small, smallTotal, topCats, topBesteira, wd, per, projBesteira, horasBesteira, fv5, fv10, sobra, poupanca, fixoPct, score, ins };
}

// ============================================================
//  Componentes de UI
// ============================================================
const Card = ({ children, style }) => <View style={[st.card, style]}>{children}</View>;
const H = ({ children, style }) => <Text style={[st.h, style]}>{children}</Text>;
const Muted = ({ children, style }) => <Text style={[st.muted, style]}>{children}</Text>;
const Row = ({ children, style }) => <View style={[st.row, style]}>{children}</View>;
const Chip = ({ label, active, onPress, color = C.green, style }) => (
  <TouchableOpacity onPress={onPress} style={[st.chip, active && { backgroundColor: color + '33', borderColor: color }, style]}>
    <Text style={[st.chipTxt, active && { color }]}>{label}</Text>
  </TouchableOpacity>
);
const Btn = ({ label, onPress, color = C.green, outline, style, small }) => (
  <TouchableOpacity onPress={onPress} style={[st.btn, small && { paddingVertical: 8, paddingHorizontal: 12 }, outline ? { borderWidth: 1, borderColor: color, backgroundColor: 'transparent' } : { backgroundColor: color }, style]}>
    <Text style={[st.btnTxt, outline && { color }, small && { fontSize: 13 }]}>{label}</Text>
  </TouchableOpacity>
);
const Bar = ({ value, max, color = C.green, height = 8 }) => {
  const p = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <View style={[st.barBg, { height }]}>
      <View style={{ width: p + '%', height, backgroundColor: color, borderRadius: height }} />
    </View>
  );
};
const Field = ({ label, ...props }) => (
  <View style={{ marginBottom: 10 }}>
    {label ? <Muted style={{ marginBottom: 4 }}>{label}</Muted> : null}
    <TextInput placeholderTextColor={C.muted} style={st.input} {...props} />
  </View>
);
const MonthNav = ({ mk, setMk }) => (
  <Row style={{ justifyContent: 'space-between', marginBottom: 12 }}>
    <TouchableOpacity onPress={() => setMk(addMonths(mk, -1))} style={st.navBtn}><Text style={st.navTxt}>‹</Text></TouchableOpacity>
    <Text style={[st.h, { fontSize: 18 }]}>{mkLabel(mk)}</Text>
    <TouchableOpacity onPress={() => setMk(addMonths(mk, 1))} style={st.navBtn}><Text style={st.navTxt}>›</Text></TouchableOpacity>
  </Row>
);
const Stat = ({ label, value, color = C.text }) => (
  <View style={{ flex: 1 }}>
    <Muted style={{ fontSize: 12 }}>{label}</Muted>
    <Text style={{ color, fontSize: 16, fontWeight: '700', marginTop: 2 }}>{value}</Text>
  </View>
);

function TxItem({ t, cards, onPress }) {
  const c = catOf(t.cat);
  const isIn = t.type === 'in';
  return (
    <TouchableOpacity onPress={onPress} style={st.txItem}>
      <Text style={{ fontSize: 22, marginRight: 10 }}>{c.icon}</Text>
      <View style={{ flex: 1 }}>
        <Text style={st.txTitle} numberOfLines={1}>{t.desc || c.label}</Text>
        <Muted style={{ fontSize: 12 }}>
          {dateBR(t.date)}{!isIn && t.pay ? ' · ' + payLabel(t.pay, cards) : ''}{t.fixedId ? ' · Fixo' : ''}
        </Muted>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={{ color: isIn ? C.green : C.text, fontWeight: '700' }}>{isIn ? '+' : '-'}{fmt(t.amount)}</Text>
        {!isIn && t.need ? <Text style={{ fontSize: 11, color: NEEDS[t.need].color }}>{NEEDS[t.need].icon} {NEEDS[t.need].label}</Text> : null}
      </View>
    </TouchableOpacity>
  );
}

// ============================================================
//  Tela: Início
// ============================================================
function HomeScreen({ data, addTx, openTx, goMais, goTab }) {
  const mk = currentMk();
  const n = useMemo(() => monthNumbers(data, mk), [data]);
  const [qCat, setQCat] = useState('lanche');
  const [qVal, setQVal] = useState('');
  const recent = [...data.tx].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 6);
  const bPct = pct(n.besteiraM, n.limite);
  const bColor = bPct >= 100 ? C.red : bPct >= 70 ? C.yellow : C.green;

  const quick = (v) => {
    const val = parseMoney(v);
    if (val <= 0) return;
    addTx([{ id: uid(), type: 'out', amount: val, cat: qCat, desc: catOf(qCat).label, date: new Date().toISOString(), hasTime: true, pay: data.settings.defaultPay || 'pix', need: 'superfluo' }]);
    setQVal('');
  };

  return (
    <ScrollView contentContainerStyle={st.screen} keyboardShouldPersistTaps="handled">
      <Row style={{ justifyContent: 'space-between', marginBottom: 14 }}>
        <View>
          <Muted>{mkLabel(mk)}</Muted>
          <Text style={[st.h, { fontSize: 24 }]}>Meu Dinheiro</Text>
        </View>
        <TouchableOpacity onPress={goMais} style={st.navBtn}><Text style={{ fontSize: 20 }}>⚙️</Text></TouchableOpacity>
      </Row>

      {n.R === 0 ? (
        <Card style={{ borderColor: C.yellow }}>
          <H>👋 Comece aqui</H>
          <Muted style={{ marginVertical: 6 }}>Informe sua renda mensal e sua meta de investimento para o app calcular quanto você pode gastar por dia.</Muted>
          <Btn label="Configurar renda e metas" onPress={goMais} color={C.yellow} />
        </Card>
      ) : null}

      <Card style={{ alignItems: 'center', paddingVertical: 20 }}>
        <Muted>Você pode gastar hoje</Muted>
        <Text style={{ fontSize: 38, fontWeight: '800', color: n.restante < 0 ? C.red : C.green, marginVertical: 4 }}>
          {n.restante < 0 ? fmt(0) : fmt(n.porDia)}
        </Text>
        <Muted style={{ textAlign: 'center' }}>
          {n.restante < 0
            ? `Orçamento do mês estourado em ${fmt(-n.restante)}`
            : `${fmt(n.restante)} livres para ${n.diasRest} dia(s), já separando fixos e ${fmt(n.I)} para investir`}
        </Muted>
      </Card>

      <Card>
        <Row>
          <Stat label="Receitas" value={fmt(n.R)} color={C.green} />
          <Stat label="Despesas" value={fmt(n.despesas)} color={C.red} />
          <Stat label="Investido" value={fmt(n.invested)} color={C.blue} />
        </Row>
      </Card>

      <Card>
        <Row style={{ justifyContent: 'space-between', marginBottom: 6 }}>
          <H>🍔 Besteiras do mês</H>
          <Text style={{ color: bColor, fontWeight: '700' }}>{fmt(n.besteiraM)}</Text>
        </Row>
        <Bar value={n.besteiraM} max={n.limite} color={bColor} height={10} />
        <Muted style={{ marginTop: 6, fontSize: 12 }}>
          {n.besteiras.length} compras · limite {fmt(n.limite)} ({Math.round(bPct)}% usado)
        </Muted>

        <Text style={[st.label, { marginTop: 14 }]}>Lançamento rápido — 1 toque</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 6 }}>
          {QUICK_CATS.map((id) => (
            <Chip key={id} label={`${catOf(id).icon} ${catOf(id).label}`} active={qCat === id} onPress={() => setQCat(id)} color={C.red} />
          ))}
        </ScrollView>
        <View style={st.grid}>
          {QUICK_VALUES.map((v) => (
            <TouchableOpacity key={v} style={st.quickBtn} onPress={() => quick(v)}>
              <Text style={st.quickTxt}>R$ {v}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Row style={{ marginTop: 8 }}>
          <TextInput value={qVal} onChangeText={setQVal} placeholder="Outro valor" placeholderTextColor={C.muted} keyboardType="decimal-pad" style={[st.input, { flex: 1, marginRight: 8 }]} />
          <Btn label="Lançar" onPress={() => quick(qVal)} color={C.red} />
        </Row>
      </Card>

      {n.isCur && n.unpaidFixed.length > 0 ? (
        <TouchableOpacity onPress={goMais}>
          <Card style={{ borderColor: C.yellow }}>
            <H>📌 {n.unpaidFixed.length} gasto(s) fixo(s) a pagar</H>
            <Muted style={{ marginTop: 4 }}>Total pendente: {fmt(sum(n.unpaidFixed))} · toque para marcar como pago</Muted>
          </Card>
        </TouchableOpacity>
      ) : null}

      <Row style={{ justifyContent: 'space-between', marginTop: 6, marginBottom: 8 }}>
        <H>Últimos lançamentos</H>
        <TouchableOpacity onPress={() => goTab('extrato')}><Text style={{ color: C.blue }}>Ver tudo</Text></TouchableOpacity>
      </Row>
      <Card style={{ paddingVertical: 4 }}>
        {recent.length === 0 ? <Muted style={{ padding: 10 }}>Nenhum lançamento ainda. Toque no ➕ abaixo.</Muted> :
          recent.map((t) => <TxItem key={t.id} t={t} cards={data.cards} onPress={() => openTx(t)} />)}
      </Card>
    </ScrollView>
  );
}

// ============================================================
//  Tela: Lançar
// ============================================================
function AddScreen({ data, addTx }) {
  const [type, setType] = useState('out');
  const [amount, setAmount] = useState('');
  const [desc, setDesc] = useState('');
  const [cat, setCat] = useState('mercado');
  const [need, setNeed] = useState('essencial');
  const [pay, setPay] = useState(data.settings.defaultPay || 'pix');
  const [parcelas, setParcelas] = useState('1');
  const [dateMode, setDateMode] = useState('hoje');
  const [dateStr, setDateStr] = useState('');

  const cats = type === 'out' ? EXPENSE_CATS : INCOME_CATS;
  const pays = [...PAYS_BASE, ...data.cards.map((c) => ({ id: 'card:' + c.id, label: '💳 ' + c.name }))];
  const isCard = pay.startsWith('card:');

  const pickCat = (c) => { setCat(c.id); if (c.need) setNeed(c.need); };
  const switchType = (tp) => { setType(tp); setCat(tp === 'out' ? 'mercado' : 'salario'); setNeed('essencial'); };

  const save = () => {
    const val = parseMoney(amount);
    if (val <= 0) return Alert.alert('Valor inválido', 'Digite um valor maior que zero.');
    let base; let hasTime = false;
    if (dateMode === 'hoje') { base = new Date(); hasTime = true; }
    else if (dateMode === 'ontem') { base = new Date(); base.setDate(base.getDate() - 1); base.setHours(12, 0, 0, 0); }
    else { base = parseDateBR(dateStr); if (!base) return Alert.alert('Data inválida', 'Use o formato DD/MM/AAAA.'); }

    const list = [];
    const np = type === 'out' && isCard ? Math.max(1, Math.min(48, parseInt(parcelas, 10) || 1)) : 1;
    const each = Math.floor((val / np) * 100) / 100;
    for (let i = 0; i < np; i++) {
      const d = new Date(base.getFullYear(), base.getMonth() + i, 1, base.getHours(), base.getMinutes());
      const dim = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
      d.setDate(Math.min(base.getDate(), dim));
      const amt = i === np - 1 ? Math.round((val - each * (np - 1)) * 100) / 100 : each;
      list.push({
        id: uid(), type, amount: amt, cat, date: d.toISOString(), hasTime,
        desc: (desc || catOf(cat).label) + (np > 1 ? ` (${i + 1}/${np})` : ''),
        pay: type === 'out' ? pay : undefined, need: type === 'out' ? need : undefined,
      });
    }
    addTx(list);
    setAmount(''); setDesc(''); setParcelas('1'); setDateMode('hoje'); setDateStr('');
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={st.screen} keyboardShouldPersistTaps="handled">
        <Text style={[st.h, { fontSize: 24, marginBottom: 12 }]}>Novo lançamento</Text>
        <Row style={{ marginBottom: 12 }}>
          <Chip label="Despesa" active={type === 'out'} onPress={() => switchType('out')} color={C.red} style={{ flex: 1, alignItems: 'center' }} />
          <Chip label="Receita" active={type === 'in'} onPress={() => switchType('in')} color={C.green} style={{ flex: 1, alignItems: 'center' }} />
        </Row>

        <Card>
          <Muted>Valor</Muted>
          <TextInput value={amount} onChangeText={setAmount} placeholder="0,00" placeholderTextColor={C.border} keyboardType="decimal-pad" style={st.bigInput} />
          <Field label="Descrição (opcional)" value={desc} onChangeText={setDesc} placeholder="Ex: coxinha na padaria" />
        </Card>

        <Text style={st.label}>Categoria</Text>
        <View style={st.grid}>
          {cats.map((c) => (
            <TouchableOpacity key={c.id} onPress={() => pickCat(c)} style={[st.catBtn, cat === c.id && { borderColor: type === 'out' ? C.red : C.green, backgroundColor: C.card2 }]}>
              <Text style={{ fontSize: 22 }}>{c.icon}</Text>
              <Text style={st.catTxt} numberOfLines={1}>{c.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {type === 'out' ? (
          <>
            <Text style={st.label}>Esse gasto era necessário?</Text>
            <Row style={{ marginBottom: 6 }}>
              {Object.entries(NEEDS).map(([k, v]) => (
                <Chip key={k} label={`${v.icon} ${v.label}`} active={need === k} onPress={() => setNeed(k)} color={v.color} style={{ flex: 1, alignItems: 'center', paddingHorizontal: 4 }} />
              ))}
            </Row>
            <Muted style={{ fontSize: 12, marginBottom: 10 }}>Seja honesto: essa resposta é o que alimenta a análise.</Muted>

            <Text style={st.label}>Forma de pagamento</Text>
            <View style={[st.grid, { marginBottom: 6 }]}>
              {pays.map((p) => <Chip key={p.id} label={p.label} active={pay === p.id} onPress={() => setPay(p.id)} color={C.blue} />)}
            </View>
            {isCard ? <Field label="Parcelas" value={parcelas} onChangeText={setParcelas} keyboardType="number-pad" /> : null}
          </>
        ) : null}

        <Text style={st.label}>Data</Text>
        <Row style={{ marginBottom: 8 }}>
          <Chip label="Hoje" active={dateMode === 'hoje'} onPress={() => setDateMode('hoje')} />
          <Chip label="Ontem" active={dateMode === 'ontem'} onPress={() => setDateMode('ontem')} />
          <Chip label="Outra" active={dateMode === 'outra'} onPress={() => setDateMode('outra')} />
        </Row>
        {dateMode === 'outra' ? <Field value={dateStr} onChangeText={setDateStr} placeholder="DD/MM/AAAA" keyboardType="numbers-and-punctuation" /> : null}

        <Btn label={type === 'out' ? 'Salvar despesa' : 'Salvar receita'} onPress={save} color={type === 'out' ? C.red : C.green} style={{ marginTop: 10 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ============================================================
//  Tela: Extrato
// ============================================================
function ExtratoScreen({ data, mk, setMk, openTx }) {
  const [filter, setFilter] = useState('todos');
  const n = monthNumbers(data, mk);
  let list = [...n.txM].sort((a, b) => new Date(b.date) - new Date(a.date));
  if (filter === 'out') list = list.filter((t) => t.type === 'out');
  if (filter === 'in') list = list.filter((t) => t.type === 'in');
  if (filter === 'besteira') list = list.filter((t) => t.need === 'superfluo');
  if (filter === 'evitavel') list = list.filter((t) => t.need === 'importante');
  const groups = {};
  list.forEach((t) => { const k = dateBR(t.date); (groups[k] = groups[k] || []).push(t); });

  return (
    <ScrollView contentContainerStyle={st.screen}>
      <MonthNav mk={mk} setMk={setMk} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
        <Chip label="Todos" active={filter === 'todos'} onPress={() => setFilter('todos')} />
        <Chip label="Despesas" active={filter === 'out'} onPress={() => setFilter('out')} color={C.red} />
        <Chip label="Receitas" active={filter === 'in'} onPress={() => setFilter('in')} />
        <Chip label="❌ Besteiras" active={filter === 'besteira'} onPress={() => setFilter('besteira')} color={C.red} />
        <Chip label="🤔 Evitáveis" active={filter === 'evitavel'} onPress={() => setFilter('evitavel')} color={C.yellow} />
      </ScrollView>
      <Card>
        <Row>
          <Stat label="Itens" value={String(list.length)} />
          <Stat label="Total filtrado" value={fmt(sum(list, (t) => (t.type === 'in' ? t.amount : -t.amount)))} />
        </Row>
      </Card>
      {Object.keys(groups).length === 0 ? <Muted>Nada neste mês.</Muted> : null}
      {Object.entries(groups).map(([day, items]) => (
        <View key={day}>
          <Muted style={{ marginTop: 8, marginBottom: 4 }}>{day} · {WEEKDAYS[new Date(items[0].date).getDay()]}</Muted>
          <Card style={{ paddingVertical: 4 }}>
            {items.map((t) => <TxItem key={t.id} t={t} cards={data.cards} onPress={() => openTx(t)} />)}
          </Card>
        </View>
      ))}
      <Muted style={{ textAlign: 'center', marginTop: 10, fontSize: 12 }}>Toque em um lançamento para reclassificar ou excluir.</Muted>
    </ScrollView>
  );
}

// ============================================================
//  Tela: Análise
// ============================================================
function AnaliseScreen({ data, mk, setMk }) {
  const a = useMemo(() => analyze(data, mk), [data, mk]);
  const { n, byNeed } = a;
  const scoreColor = a.score >= 75 ? C.green : a.score >= 50 ? C.yellow : C.red;
  const scoreTxt = a.score >= 75 ? 'Saudável' : a.score >= 50 ? 'Atenção' : 'Crítico';
  const R = n.R;
  const ideal = [
    { k: 'Necessidades', v: byNeed.essencial + 0, ideal: 50, color: C.green },
    { k: 'Desejos (evitável + besteira)', v: byNeed.importante + byNeed.superfluo, ideal: 30, color: C.yellow },
    { k: 'Investimento', v: n.invested, ideal: 20, color: C.blue },
  ];
  const maxWd = Math.max(...a.wd, 1);

  return (
    <ScrollView contentContainerStyle={st.screen}>
      <MonthNav mk={mk} setMk={setMk} />

      <Card style={{ alignItems: 'center' }}>
        <Muted>Saúde financeira do mês</Muted>
        <Text style={{ fontSize: 48, fontWeight: '800', color: scoreColor }}>{a.score}</Text>
        <Text style={{ color: scoreColor, fontWeight: '700' }}>{scoreTxt}</Text>
        <Row style={{ marginTop: 12 }}>
          <Stat label={n.isCur ? 'Vai sobrar' : 'Sobrou'} value={fmt(R - a.comprometido)} color={R - a.comprometido >= 0 ? C.green : C.red} />
          <Stat label="Taxa de poupança" value={Math.round(a.poupanca) + '%'} color={a.poupanca >= 20 ? C.green : C.yellow} />
        </Row>
      </Card>

      <Card>
        <H style={{ marginBottom: 10 }}>Necessário x Desnecessário</H>
        {Object.entries(NEEDS).map(([k, v]) => (
          <View key={k} style={{ marginBottom: 10 }}>
            <Row style={{ justifyContent: 'space-between', marginBottom: 4 }}>
              <Text style={st.txt}>{v.icon} {v.label}</Text>
              <Text style={[st.txt, { color: v.color }]}>{fmt(byNeed[k])} · {Math.round(pct(byNeed[k], n.despesas))}%</Text>
            </Row>
            <Bar value={byNeed[k]} max={n.despesas} color={v.color} />
          </View>
        ))}
      </Card>

      <Card>
        <H>Regra 50 / 30 / 20</H>
        <Muted style={{ marginBottom: 10, fontSize: 12 }}>Ideal: 50% necessidades, 30% desejos, 20% investimento (sobre a renda)</Muted>
        {ideal.map((x) => {
          const p = pct(x.v, R);
          const bad = x.k === 'Investimento' ? p < x.ideal : p > x.ideal;
          return (
            <View key={x.k} style={{ marginBottom: 10 }}>
              <Row style={{ justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={st.txt}>{x.k}</Text>
                <Text style={[st.txt, { color: bad ? C.red : C.green }]}>{Math.round(p)}% / {x.ideal}%</Text>
              </Row>
              <Bar value={p} max={100} color={x.color} />
            </View>
          );
        })}
      </Card>

      <Card style={{ borderColor: C.red }}>
        <H style={{ marginBottom: 8 }}>🔎 Raio-X das besteiras</H>
        <Row style={{ marginBottom: 10 }}>
          <Stat label="Total" value={fmt(n.besteiraM)} color={C.red} />
          <Stat label="Compras" value={String(n.besteiras.length)} />
          <Stat label="Projeção mês" value={fmt(a.projBesteira)} color={C.yellow} />
        </Row>
        <Row style={{ marginBottom: 12 }}>
          <Stat label="Em 1 ano" value={fmt(a.projBesteira * 12)} color={C.red} />
          <Stat label="Investido 10 anos" value={fmt(a.fv10)} color={C.blue} />
        </Row>
        <Muted style={{ marginBottom: 6 }}>Por dia da semana</Muted>
        <Row style={{ alignItems: 'flex-end', height: 90 }}>
          {a.wd.map((v, i) => (
            <View key={i} style={{ flex: 1, alignItems: 'center' }}>
              <View style={{ width: 18, height: Math.max(2, (v / maxWd) * 70), backgroundColor: v === Math.max(...a.wd) && v > 0 ? C.red : C.border, borderRadius: 4 }} />
              <Text style={{ color: C.muted, fontSize: 11, marginTop: 4 }}>{WEEKDAYS[i].slice(0, 3)}</Text>
            </View>
          ))}
        </Row>
        <Muted style={{ marginTop: 10, fontSize: 12 }}>Gastos pequenos (até {fmt(data.settings.pequeno)}): {a.small.length}x = {fmt(a.smallTotal)}</Muted>
      </Card>

      <Card>
        <H style={{ marginBottom: 10 }}>Para onde foi o dinheiro</H>
        {a.topCats.length === 0 ? <Muted>Sem despesas neste mês.</Muted> : null}
        {a.topCats.slice(0, 8).map((c) => (
          <View key={c.id} style={{ marginBottom: 8 }}>
            <Row style={{ justifyContent: 'space-between', marginBottom: 3 }}>
              <Text style={st.txt}>{catOf(c.id).icon} {catOf(c.id).label} <Text style={{ color: C.muted }}>({c.count}x)</Text></Text>
              <Text style={st.txt}>{fmt(c.total)}</Text>
            </Row>
            <Bar value={c.total} max={a.topCats[0].total} color={C.purple} height={6} />
          </View>
        ))}
      </Card>

      <H style={{ marginBottom: 8, marginTop: 4 }}>💡 Diagnóstico</H>
      {a.ins.length === 0 ? <Muted>Lance seus gastos para receber o diagnóstico.</Muted> : null}
      {a.ins.map((x, i) => (
        <Card key={i} style={{ borderLeftWidth: 4, borderLeftColor: x.c }}>
          <Text style={st.txt}>{x.t}</Text>
        </Card>
      ))}

      {n.besteiraM > 0 ? (
        <Card style={{ borderColor: C.blue }}>
          <H>🎯 Desafio do próximo mês</H>
          <Text style={[st.txt, { marginTop: 6 }]}>
            Corte metade das besteiras e invista a diferença: {fmt(a.projBesteira / 2)}/mês viram {fmt(fv(a.projBesteira / 2, data.settings.taxaMes, 60))} em 5 anos.
            Defina o limite de besteiras em {fmt(a.projBesteira / 2)} nos Ajustes.
          </Text>
        </Card>
      ) : null}
    </ScrollView>
  );
}

// ============================================================
//  Tela: Metas e Patrimônio
// ============================================================
function MetasScreen({ data, update, toast }) {
  const mk = currentMk();
  const n = monthNumbers(data, mk);
  const patrimonio = sum(data.goals, goalSaved);
  const [showNew, setShowNew] = useState(false);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('🎯');
  const [target, setTarget] = useState('');
  const [deadline, setDeadline] = useState('');
  const [moveGoal, setMoveGoal] = useState(null);
  const [moveVal, setMoveVal] = useState('');
  const [moveSign, setMoveSign] = useState(1);

  // custo essencial médio (últimos 3 meses com dados)
  const essMonths = [0, 1, 2].map((i) => monthNumbers(data, addMonths(mk, -i))).filter((x) => x.despesas > 0);
  const essMedio = essMonths.length ? sum(essMonths, (x) => sum(x.outs.filter((t) => t.need === 'essencial'))) / essMonths.length : 0;
  const reservaIdeal = Math.max(essMedio, sum(data.fixed)) * 6;
  const hasReserva = data.goals.some((g) => g.kind === 'reserva');

  const addGoal = (g) => update((d) => ({ ...d, goals: [...d.goals, { id: uid(), moves: [], ...g }] }));
  const createGoal = () => {
    const t = parseMoney(target);
    if (!name || t <= 0) return Alert.alert('Preencha', 'Informe nome e valor da meta.');
    addGoal({ name, icon, target: t, deadline: deadline.trim() });
    setName(''); setTarget(''); setDeadline(''); setShowNew(false);
  };
  const doMove = () => {
    const v = parseMoney(moveVal);
    if (v <= 0) return;
    update((d) => ({ ...d, goals: d.goals.map((g) => (g.id === moveGoal.id ? { ...g, moves: [...(g.moves || []), { id: uid(), amount: v * moveSign, date: new Date().toISOString() }] } : g)) }));
    toast(moveSign > 0 ? `💰 ${fmt(v)} guardados em ${moveGoal.name}!` : `Retirada de ${fmt(v)} registrada.`);
    setMoveGoal(null); setMoveVal('');
  };
  const delGoal = (g) => Alert.alert('Excluir meta', `Excluir "${g.name}"?`, [
    { text: 'Cancelar', style: 'cancel' },
    { text: 'Excluir', style: 'destructive', onPress: () => update((d) => ({ ...d, goals: d.goals.filter((x) => x.id !== g.id) })) },
  ]);
  const monthsUntil = (dl) => {
    const m = String(dl || '').match(/^(\d{1,2})\/(\d{4})$/);
    if (!m) return 0;
    const now = new Date();
    return (Number(m[2]) - now.getFullYear()) * 12 + (Number(m[1]) - 1 - now.getMonth());
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={st.screen} keyboardShouldPersistTaps="handled">
        <Text style={[st.h, { fontSize: 24, marginBottom: 12 }]}>Metas e Patrimônio</Text>

        <Card style={{ alignItems: 'center' }}>
          <Muted>Patrimônio guardado</Muted>
          <Text style={{ fontSize: 34, fontWeight: '800', color: C.blue }}>{fmt(patrimonio)}</Text>
          <Muted style={{ fontSize: 12 }}>Soma de tudo que você guardou nas metas</Muted>
        </Card>

        <Card>
          <Row style={{ justifyContent: 'space-between', marginBottom: 6 }}>
            <H>Meta de investimento do mês</H>
            <Text style={{ color: C.blue, fontWeight: '700' }}>{Math.round(pct(n.invested, n.I))}%</Text>
          </Row>
          <Bar value={n.invested} max={n.I} color={C.blue} height={10} />
          <Muted style={{ marginTop: 6 }}>{fmt(n.invested)} de {fmt(n.I)} ({data.settings.investPct}% da renda)</Muted>
          <Muted style={{ marginTop: 8, fontSize: 12 }}>
            💡 Pague-se primeiro: assim que o salário cair, transfira {fmt(n.I)} para o investimento e registre o aporte aqui. O que sobrar é o que dá pra gastar.
          </Muted>
        </Card>

        {!hasReserva ? (
          <Card style={{ borderColor: C.yellow }}>
            <H>🛟 Reserva de emergência</H>
            <Muted style={{ marginVertical: 6 }}>
              Antes de qualquer investimento, tenha 6 meses do seu custo essencial guardados em algo com liquidez diária (ex.: CDB 100% CDI ou Tesouro Selic).
              {reservaIdeal > 0 ? ` Sua reserva ideal hoje: ${fmt(reservaIdeal)}.` : ' Lance seus gastos para eu calcular o valor ideal.'}
            </Muted>
            <Btn label="Criar meta de reserva" color={C.yellow} onPress={() => addGoal({ name: 'Reserva de emergência', icon: '🛟', target: reservaIdeal || 10000, kind: 'reserva' })} />
          </Card>
        ) : null}

        {data.goals.map((g) => {
          const saved = goalSaved(g);
          const falta = Math.max(0, g.target - saved);
          const mu = monthsUntil(g.deadline);
          return (
            <Card key={g.id}>
              <Row style={{ justifyContent: 'space-between' }}>
                <Text style={[st.h, { flex: 1 }]}>{g.icon} {g.name}</Text>
                <TouchableOpacity onPress={() => delGoal(g)}><Text style={{ color: C.muted }}>🗑</Text></TouchableOpacity>
              </Row>
              <Text style={{ color: C.text, marginVertical: 6 }}>
                <Text style={{ color: C.blue, fontWeight: '700' }}>{fmt(saved)}</Text> de {fmt(g.target)}
              </Text>
              <Bar value={saved} max={g.target} color={C.blue} height={10} />
              <Muted style={{ marginTop: 6, fontSize: 12 }}>
                {falta <= 0 ? '🎉 Meta atingida!' : `Faltam ${fmt(falta)}`}
                {falta > 0 && mu > 0 ? ` · guarde ${fmt(falta / mu)}/mês até ${g.deadline}` : ''}
              </Muted>
              <Row style={{ marginTop: 10 }}>
                <Btn small label="+ Guardar" color={C.blue} onPress={() => { setMoveGoal(g); setMoveSign(1); }} style={{ marginRight: 8 }} />
                <Btn small label="− Retirar" outline color={C.muted} onPress={() => { setMoveGoal(g); setMoveSign(-1); }} />
              </Row>
            </Card>
          );
        })}

        {showNew ? (
          <Card>
            <H style={{ marginBottom: 8 }}>Nova meta</H>
            <Field label="Nome" value={name} onChangeText={setName} placeholder="Ex: Viagem, carro, investimentos" />
            <View style={[st.grid, { marginBottom: 8 }]}>
              {GOAL_ICONS.map((i) => <Chip key={i} label={i} active={icon === i} onPress={() => setIcon(i)} color={C.blue} />)}
            </View>
            <Field label="Valor alvo" value={target} onChangeText={setTarget} keyboardType="decimal-pad" placeholder="0,00" />
            <Field label="Prazo (opcional, MM/AAAA)" value={deadline} onChangeText={setDeadline} placeholder="12/2027" keyboardType="numbers-and-punctuation" />
            <Row>
              <Btn label="Criar" onPress={createGoal} color={C.blue} style={{ flex: 1, marginRight: 8 }} />
              <Btn label="Cancelar" outline color={C.muted} onPress={() => setShowNew(false)} />
            </Row>
          </Card>
        ) : (
          <Btn label="+ Nova meta" outline color={C.blue} onPress={() => setShowNew(true)} />
        )}

        <Modal visible={!!moveGoal} transparent animationType="fade" onRequestClose={() => setMoveGoal(null)}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={st.modalBg}>
            <View style={st.modalBox}>
              <H style={{ marginBottom: 8 }}>{moveSign > 0 ? 'Guardar em' : 'Retirar de'} {moveGoal ? moveGoal.name : ''}</H>
              <TextInput autoFocus value={moveVal} onChangeText={setMoveVal} placeholder="0,00" placeholderTextColor={C.border} keyboardType="decimal-pad" style={st.bigInput} />
              <Row>
                <Btn label="Confirmar" onPress={doMove} color={C.blue} style={{ flex: 1, marginRight: 8 }} />
                <Btn label="Cancelar" outline color={C.muted} onPress={() => setMoveGoal(null)} />
              </Row>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ============================================================
//  Tela: Ajustes, Cartões, Gastos fixos, Backup
// ============================================================
function MaisScreen({ data, update, back, toast }) {
  const s = data.settings;
  const [form, setForm] = useState({
    renda: s.renda ? String(s.renda).replace('.', ',') : '', investPct: String(s.investPct),
    limiteBesteira: s.limiteBesteira ? String(s.limiteBesteira).replace('.', ',') : '', pequeno: String(s.pequeno),
    horasMes: String(s.horasMes), taxaMes: String(s.taxaMes).replace('.', ','),
  });
  const [card, setCard] = useState({ name: '', limit: '', closingDay: '', dueDay: '' });
  const [fx, setFx] = useState({ name: '', amount: '', day: '', cat: 'moradia' });
  const [importTxt, setImportTxt] = useState('');
  const mk = currentMk();
  const txM = data.tx.filter((t) => mkOf(t.date) === mk);

  const saveSettings = () => {
    update((d) => ({ ...d, settings: { ...d.settings,
      renda: parseMoney(form.renda), investPct: parseMoney(form.investPct), limiteBesteira: parseMoney(form.limiteBesteira),
      pequeno: parseMoney(form.pequeno) || 50, horasMes: parseMoney(form.horasMes) || 176, taxaMes: parseMoney(form.taxaMes) } }));
    toast('✅ Ajustes salvos');
  };
  const addCard = () => {
    if (!card.name) return Alert.alert('Informe o nome do cartão');
    update((d) => ({ ...d, cards: [...d.cards, { id: uid(), name: card.name, limit: parseMoney(card.limit), closingDay: parseInt(card.closingDay, 10) || 1, dueDay: parseInt(card.dueDay, 10) || 10 }] }));
    setCard({ name: '', limit: '', closingDay: '', dueDay: '' });
  };
  const delCard = (c) => Alert.alert('Excluir cartão', `Excluir ${c.name}? Os lançamentos continuam no extrato.`, [
    { text: 'Cancelar', style: 'cancel' },
    { text: 'Excluir', style: 'destructive', onPress: () => update((d) => ({ ...d, cards: d.cards.filter((x) => x.id !== c.id) })) },
  ]);
  const addFixed = () => {
    const a = parseMoney(fx.amount);
    if (!fx.name || a <= 0) return Alert.alert('Preencha nome e valor');
    update((d) => ({ ...d, fixed: [...d.fixed, { id: uid(), name: fx.name, amount: a, day: parseInt(fx.day, 10) || 10, cat: fx.cat }] }));
    setFx({ name: '', amount: '', day: '', cat: 'moradia' });
  };
  const togglePaid = (f) => {
    const paid = txM.find((t) => t.fixedId === f.id);
    if (paid) { update((d) => ({ ...d, tx: d.tx.filter((t) => t.id !== paid.id) })); return; }
    const now = new Date();
    const dim = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const date = new Date(now.getFullYear(), now.getMonth(), Math.min(f.day, dim), 12).toISOString();
    update((d) => ({ ...d, tx: [...d.tx, { id: uid(), type: 'out', amount: f.amount, cat: f.cat, desc: f.name, date, pay: d.settings.defaultPay || 'pix', need: 'essencial', fixedId: f.id }] }));
    toast(`✅ ${f.name} pago`);
  };
  const delFixed = (f) => Alert.alert('Excluir gasto fixo', `Excluir ${f.name}?`, [
    { text: 'Cancelar', style: 'cancel' },
    { text: 'Excluir', style: 'destructive', onPress: () => update((d) => ({ ...d, fixed: d.fixed.filter((x) => x.id !== f.id) })) },
  ]);
  const doExport = () => Share.share({ message: JSON.stringify(data) });
  const doImport = () => {
    try {
      const obj = JSON.parse(importTxt);
      if (!obj || !Array.isArray(obj.tx)) throw new Error('formato');
      Alert.alert('Importar backup', 'Isso substitui todos os dados atuais. Continuar?', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Importar', style: 'destructive', onPress: () => { update(() => ({ ...EMPTY, ...obj, settings: { ...DEFAULT_SETTINGS, ...(obj.settings || {}) } })); setImportTxt(''); toast('✅ Backup importado'); } },
      ]);
    } catch (e) { Alert.alert('Backup inválido', 'Cole o texto completo exportado pelo app.'); }
  };
  const wipe = () => Alert.alert('Apagar tudo', 'Todos os lançamentos, metas e cartões serão apagados. Tem certeza?', [
    { text: 'Cancelar', style: 'cancel' },
    { text: 'Apagar', style: 'destructive', onPress: () => update(() => EMPTY) },
  ]);
  const F = (k, label, extra = {}) => (
    <Field label={label} value={form[k]} onChangeText={(v) => setForm({ ...form, [k]: v })} keyboardType="decimal-pad" {...extra} />
  );

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={st.screen} keyboardShouldPersistTaps="handled">
        <Row style={{ marginBottom: 12 }}>
          <TouchableOpacity onPress={back} style={[st.navBtn, { marginRight: 10 }]}><Text style={st.navTxt}>‹</Text></TouchableOpacity>
          <Text style={[st.h, { fontSize: 24 }]}>Ajustes</Text>
        </Row>

        <Card>
          <H style={{ marginBottom: 10 }}>💼 Renda e metas</H>
          {F('renda', 'Renda mensal líquida (R$)', { placeholder: 'Ex: 3.500,00' })}
          {F('investPct', 'Quanto % da renda quer guardar/investir')}
          {F('limiteBesteira', 'Limite mensal para besteiras (vazio = 5% da renda)', { placeholder: 'Ex: 200,00' })}
          {F('pequeno', 'Considerar "gasto pequeno" até (R$)')}
          {F('horasMes', 'Horas trabalhadas por mês')}
          {F('taxaMes', 'Rendimento estimado ao mês (%) p/ simulações')}
          <Muted style={{ fontSize: 12, marginBottom: 6 }}>Pagamento padrão no lançamento rápido:</Muted>
          <Row style={{ marginBottom: 10, flexWrap: 'wrap' }}>
            {[...PAYS_BASE, ...data.cards.map((c) => ({ id: 'card:' + c.id, label: '💳 ' + c.name }))].map((p) => (
              <Chip key={p.id} label={p.label} active={s.defaultPay === p.id} color={C.blue}
                onPress={() => update((d) => ({ ...d, settings: { ...d.settings, defaultPay: p.id } }))} />
            ))}
          </Row>
          <Btn label="Salvar ajustes" onPress={saveSettings} />
        </Card>

        <Card>
          <H style={{ marginBottom: 10 }}>📌 Gastos fixos (mês atual)</H>
          {data.fixed.length === 0 ? <Muted style={{ marginBottom: 8 }}>Aluguel, luz, internet, academia, assinaturas...</Muted> : null}
          {data.fixed.map((f) => {
            const paid = txM.some((t) => t.fixedId === f.id);
            return (
              <Row key={f.id} style={st.listRow}>
                <TouchableOpacity onPress={() => togglePaid(f)} style={{ marginRight: 10 }}>
                  <Text style={{ fontSize: 22 }}>{paid ? '✅' : '⬜'}</Text>
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                  <Text style={st.txt}>{catOf(f.cat).icon} {f.name}</Text>
                  <Muted style={{ fontSize: 12 }}>Vence dia {f.day} · {paid ? 'pago' : 'pendente'}</Muted>
                </View>
                <Text style={[st.txt, { marginRight: 10 }]}>{fmt(f.amount)}</Text>
                <TouchableOpacity onPress={() => delFixed(f)}><Text style={{ color: C.muted }}>🗑</Text></TouchableOpacity>
              </Row>
            );
          })}
          {data.fixed.length > 0 ? <Muted style={{ marginVertical: 8 }}>Total fixo: {fmt(sum(data.fixed))}/mês · toque no quadrado para marcar pago</Muted> : null}
          <Field label="Nome" value={fx.name} onChangeText={(v) => setFx({ ...fx, name: v })} placeholder="Ex: Aluguel" />
          <Row>
            <View style={{ flex: 1, marginRight: 8 }}><Field label="Valor" value={fx.amount} onChangeText={(v) => setFx({ ...fx, amount: v })} keyboardType="decimal-pad" /></View>
            <View style={{ width: 90 }}><Field label="Dia venc." value={fx.day} onChangeText={(v) => setFx({ ...fx, day: v })} keyboardType="number-pad" /></View>
          </Row>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
            {['moradia', 'contas', 'transporte', 'saude', 'educacao', 'assinaturas', 'pets', 'outros'].map((id) => (
              <Chip key={id} label={`${catOf(id).icon} ${catOf(id).label}`} active={fx.cat === id} onPress={() => setFx({ ...fx, cat: id })} />
            ))}
          </ScrollView>
          <Btn label="+ Adicionar gasto fixo" outline onPress={addFixed} />
        </Card>

        <Card>
          <H style={{ marginBottom: 10 }}>💳 Cartões de crédito</H>
          {data.cards.map((c) => {
            const ci = cardInfo(c, data.tx);
            return (
              <View key={c.id} style={[st.listRow, { flexDirection: 'column', alignItems: 'stretch' }]}>
                <Row style={{ justifyContent: 'space-between' }}>
                  <Text style={st.txt}>{c.name}</Text>
                  <TouchableOpacity onPress={() => delCard(c)}><Text style={{ color: C.muted }}>🗑</Text></TouchableOpacity>
                </Row>
                <Text style={{ color: C.red, fontWeight: '700', marginVertical: 4 }}>Fatura atual: {fmt(ci.fatura)}</Text>
                {c.limit > 0 ? <Bar value={ci.usado} max={c.limit} color={pct(ci.usado, c.limit) > 70 ? C.red : C.blue} /> : null}
                <Muted style={{ fontSize: 12, marginTop: 4 }}>
                  Fecha dia {c.closingDay} · vence dia {c.dueDay}{c.limit > 0 ? ` · limite usado ${fmt(ci.usado)} de ${fmt(c.limit)}` : ''}
                </Muted>
              </View>
            );
          })}
          <Field label="Nome do cartão" value={card.name} onChangeText={(v) => setCard({ ...card, name: v })} placeholder="Ex: Nubank" />
          <Row>
            <View style={{ flex: 1, marginRight: 8 }}><Field label="Limite" value={card.limit} onChangeText={(v) => setCard({ ...card, limit: v })} keyboardType="decimal-pad" /></View>
            <View style={{ width: 80, marginRight: 8 }}><Field label="Fecha dia" value={card.closingDay} onChangeText={(v) => setCard({ ...card, closingDay: v })} keyboardType="number-pad" /></View>
            <View style={{ width: 80 }}><Field label="Vence dia" value={card.dueDay} onChangeText={(v) => setCard({ ...card, dueDay: v })} keyboardType="number-pad" /></View>
          </Row>
          <Btn label="+ Adicionar cartão" outline onPress={addCard} />
        </Card>

        <Card>
          <H style={{ marginBottom: 6 }}>💾 Backup</H>
          <Muted style={{ marginBottom: 10, fontSize: 12 }}>Exporte de vez em quando e salve nas Notas ou mande para você no WhatsApp. Para restaurar, cole o texto abaixo.</Muted>
          <Btn label="Exportar backup" onPress={doExport} color={C.blue} style={{ marginBottom: 10 }} />
          <TextInput value={importTxt} onChangeText={setImportTxt} multiline placeholder="Cole aqui o backup..." placeholderTextColor={C.muted} style={[st.input, { height: 80, textAlignVertical: 'top' }]} />
          <Btn label="Importar backup" outline color={C.blue} onPress={doImport} style={{ marginTop: 8 }} />
        </Card>

        <Btn label="Apagar todos os dados" outline color={C.red} onPress={wipe} style={{ marginBottom: 30 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ============================================================
//  Modal de lançamento (reclassificar / excluir)
// ============================================================
function TxModal({ t, data, close, update }) {
  if (!t) return null;
  const c = catOf(t.cat);
  const setNeed = (need) => { update((d) => ({ ...d, tx: d.tx.map((x) => (x.id === t.id ? { ...x, need } : x)) })); close(); };
  const del = () => Alert.alert('Excluir lançamento', 'Tem certeza?', [
    { text: 'Cancelar', style: 'cancel' },
    { text: 'Excluir', style: 'destructive', onPress: () => { update((d) => ({ ...d, tx: d.tx.filter((x) => x.id !== t.id) })); close(); } },
  ]);
  return (
    <Modal visible transparent animationType="slide" onRequestClose={close}>
      <TouchableOpacity activeOpacity={1} onPress={close} style={st.modalBg}>
        <TouchableOpacity activeOpacity={1} style={st.modalBox}>
          <Text style={{ fontSize: 34, textAlign: 'center' }}>{c.icon}</Text>
          <Text style={[st.h, { textAlign: 'center' }]}>{t.desc || c.label}</Text>
          <Text style={{ color: t.type === 'in' ? C.green : C.red, fontSize: 28, fontWeight: '800', textAlign: 'center', marginVertical: 6 }}>{fmt(t.amount)}</Text>
          <Muted style={{ textAlign: 'center', marginBottom: 12 }}>{dateBR(t.date)} · {c.label}{t.pay ? ' · ' + payLabel(t.pay, data.cards) : ''}</Muted>
          {t.type === 'out' ? (
            <>
              <Muted style={{ marginBottom: 6 }}>Pensando melhor, esse gasto foi:</Muted>
              {Object.entries(NEEDS).map(([k, v]) => (
                <Chip key={k} label={`${v.icon} ${v.label}`} active={t.need === k} color={v.color} onPress={() => setNeed(k)} style={{ marginBottom: 8, alignItems: 'center' }} />
              ))}
            </>
          ) : null}
          <Row style={{ marginTop: 8 }}>
            <Btn label="Excluir" outline color={C.red} onPress={del} style={{ flex: 1, marginRight: 8 }} />
            <Btn label="Fechar" color={C.card2} onPress={close} style={{ flex: 1 }} />
          </Row>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

// ============================================================
//  App principal
// ============================================================
const TABS = [
  { id: 'home', label: 'Início', icon: '🏠' },
  { id: 'extrato', label: 'Extrato', icon: '📄' },
  { id: 'add', label: 'Lançar', icon: '➕' },
  { id: 'analise', label: 'Análise', icon: '📊' },
  { id: 'metas', label: 'Metas', icon: '🎯' },
];

export default function App() {
  const [data, setData] = useState(EMPTY);
  const [loaded, setLoaded] = useState(false);
  const [tab, setTab] = useState('home');
  const [mk, setMk] = useState(currentMk());
  const [txOpen, setTxOpen] = useState(null);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try {
          const obj = JSON.parse(raw);
          setData({ ...EMPTY, ...obj, settings: { ...DEFAULT_SETTINGS, ...(obj.settings || {}) } });
        } catch (e) { /* dados corrompidos: começa vazio */ }
      }
      setLoaded(true);
    });
  }, []);
  useEffect(() => { if (loaded) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }, [data, loaded]);

  const update = (fn) => setData((d) => fn(d));
  const toast = (m) => { setMsg(m); setTimeout(() => setMsg(''), 3500); };

  const addTx = (list) => {
    const next = { ...data, tx: [...data.tx, ...list] };
    setData((d) => ({ ...d, tx: [...d.tx, ...list] }));
    const t = list[0];
    if (t.type === 'out' && t.need === 'superfluo') {
      const n = monthNumbers(next, mkOf(t.date));
      const p = Math.round(pct(n.besteiraM, n.limite));
      toast(`❌ Besteira de ${fmt(t.amount)}. No mês: ${fmt(n.besteiraM)} (${p}% do limite)${p >= 100 ? ' — limite estourado!' : ''}`);
    } else if (t.type === 'out') toast(`✅ Despesa de ${fmt(sum(list))} lançada${list.length > 1 ? ` em ${list.length}x` : ''}`);
    else toast(`💰 Receita de ${fmt(t.amount)} lançada`);
  };

  if (!loaded) return <View style={{ flex: 1, backgroundColor: C.bg }} />;

  let screen;
  if (tab === 'home') screen = <HomeScreen data={data} addTx={addTx} openTx={setTxOpen} goMais={() => setTab('mais')} goTab={setTab} />;
  else if (tab === 'add') screen = <AddScreen data={data} addTx={addTx} />;
  else if (tab === 'extrato') screen = <ExtratoScreen data={data} mk={mk} setMk={setMk} openTx={setTxOpen} />;
  else if (tab === 'analise') screen = <AnaliseScreen data={data} mk={mk} setMk={setMk} />;
  else if (tab === 'metas') screen = <MetasScreen data={data} update={update} toast={toast} />;
  else screen = <MaisScreen data={data} update={update} back={() => setTab('home')} toast={toast} />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <StatusBar barStyle="light-content" />
      <View style={{ flex: 1 }}>{screen}</View>
      {msg ? <View style={st.toast}><Text style={st.toastTxt}>{msg}</Text></View> : null}
      <View style={st.tabBar}>
        {TABS.map((t) => (
          <TouchableOpacity key={t.id} onPress={() => setTab(t.id)} style={st.tabItem}>
            {t.id === 'add' ? (
              <View style={st.addBtn}><Text style={{ fontSize: 22, color: '#fff' }}>＋</Text></View>
            ) : (
              <>
                <Text style={{ fontSize: 20, opacity: tab === t.id ? 1 : 0.5 }}>{t.icon}</Text>
                <Text style={{ fontSize: 11, color: tab === t.id ? C.green : C.muted, marginTop: 2 }}>{t.label}</Text>
              </>
            )}
          </TouchableOpacity>
        ))}
      </View>
      <TxModal t={txOpen} data={data} close={() => setTxOpen(null)} update={update} />
    </SafeAreaView>
  );
}

// ---------- Estilos ----------
const st = StyleSheet.create({
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
  tabBar: { flexDirection: 'row', backgroundColor: C.card, borderTopWidth: 1, borderTopColor: C.border, paddingTop: 8, paddingBottom: 6 },
  tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  addBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: C.green, alignItems: 'center', justifyContent: 'center', marginTop: -18, borderWidth: 3, borderColor: C.bg },
  toast: { position: 'absolute', top: 60, left: 16, right: 16, backgroundColor: C.card2, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: C.border, shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 10, elevation: 6 },
  toastTxt: { color: C.text, fontSize: 14, fontWeight: '600' },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 20 },
  modalBox: { backgroundColor: C.card, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: C.border },
});
