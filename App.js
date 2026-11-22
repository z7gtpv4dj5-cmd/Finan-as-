// ============================================================
//  MEU DINHEIRO — carregador com atualização automática
//  Cole este arquivo UMA VEZ no App.js do Snack e salve.
//  Toda vez que o app abre (ou volta para a tela), ele baixa a
//  versão mais nova do GitHub. Sem internet, usa a última versão.
//  Seus dados ficam no iPhone e não são apagados nas atualizações.
// ============================================================
import React, { useEffect, useState, useRef } from 'react';
import * as RN from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const REPO = 'z7gtpv4dj5-cmd/Finan-as-';
const FILE = 'app.bundle.js';
const CODE_KEY = '@meu_dinheiro_code';
const { View, Text, TouchableOpacity, ActivityIndicator, AppState, ScrollView } = RN;

async function download() {
  const t = Date.now();
  const urls = [
    [`https://api.github.com/repos/${REPO}/contents/${FILE}?ref=main&t=${t}`, { headers: { Accept: 'application/vnd.github.raw' } }],
    [`https://raw.githubusercontent.com/${REPO}/main/${FILE}?t=${t}`, {}],
  ];
  for (const [url, opts] of urls) {
    try {
      const r = await fetch(url, { ...opts, cache: 'no-store' });
      if (r.ok) {
        const txt = await r.text();
        if (txt.indexOf('function __factory') >= 0) return txt;
      }
    } catch (e) { /* tenta a próxima */ }
  }
  return null;
}

function build(code) {
  // eslint-disable-next-line no-new-func
  const factory = new Function(code + '\n;return __factory;')();
  return factory(React, RN, AsyncStorage);
}

class Boundary extends React.Component {
  constructor(p) { super(p); this.state = { err: null }; }
  static getDerivedStateFromError(err) { return { err }; }
  render() { return this.state.err ? this.props.fallback(String(this.state.err && this.state.err.message || this.state.err)) : this.props.children; }
}

export default function Loader() {
  const [Comp, setComp] = useState(null);
  const [err, setErr] = useState('');
  const [key, setKey] = useState(0);
  const current = useRef(null);

  const apply = async (code, save) => {
    try {
      const C = build(code);
      current.current = code;
      setComp(() => C);
      setErr('');
      setKey((k) => k + 1);
      if (save) await AsyncStorage.setItem(CODE_KEY, code);
      return true;
    } catch (e) {
      setErr('Erro ao montar a versão nova: ' + (e && e.message || e));
      return false;
    }
  };

  const check = async () => {
    const fresh = await download();
    if (fresh && fresh !== current.current) await apply(fresh, true);
    return fresh;
  };

  const start = async () => {
    setErr('');
    const cached = await AsyncStorage.getItem(CODE_KEY);
    if (cached) await apply(cached, false);
    const fresh = await check();
    if (!fresh && !cached) setErr('Não consegui baixar o app. Verifique a internet e toque em Tentar de novo.');
  };

  useEffect(() => {
    start();
    const sub = AppState.addEventListener('change', (s) => { if (s === 'active') check(); });
    return () => sub.remove();
  }, []);

  const box = { flex: 1, backgroundColor: '#0B0F14', alignItems: 'center', justifyContent: 'center', padding: 24 };
  const retry = (
    <TouchableOpacity onPress={start} style={{ marginTop: 16, backgroundColor: '#22C55E', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12 }}>
      <Text style={{ color: '#fff', fontWeight: '700' }}>Tentar de novo</Text>
    </TouchableOpacity>
  );
  const fallback = (msg) => (
    <ScrollView contentContainerStyle={box}>
      <Text style={{ color: '#EF4444', fontWeight: '700', fontSize: 16, textAlign: 'center' }}>O app encontrou um erro</Text>
      <Text style={{ color: '#8A97A8', marginTop: 8, textAlign: 'center' }}>{msg}</Text>
      <Text style={{ color: '#8A97A8', marginTop: 8, textAlign: 'center' }}>Mande um print disso para o Claude. Seus dados estão salvos.</Text>
      {retry}
    </ScrollView>
  );

  if (!Comp) {
    return (
      <View style={box}>
        {err ? fallback(err) : <ActivityIndicator color="#22C55E" size="large" />}
      </View>
    );
  }
  return <Boundary key={key} fallback={fallback}><Comp /></Boundary>;
}
