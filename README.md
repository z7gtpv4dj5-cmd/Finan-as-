# Meu Dinheiro

App de controle financeiro para iPhone (React Native, roda no Expo Go via Snack).

## Como funciona a atualização
- `App.js` é só um **carregador**: fica no Snack e nunca mais precisa mudar.
- Ao abrir, ele baixa `app.bundle.js` deste repositório e roda. Sem internet, usa a última versão salva.
- Para atualizar o app: editar `src/app.jsx`, rodar `node scripts/build.js` e dar push no `main`.

## Regra do orçamento
Salário + extras − gastos fixos − mercado − parcelas de compras grandes − investimento/reserva (20%) = **saldo**.
Saldo ÷ dias do mês = **limite diário** do dia a dia. Gastou mais que o limite, o excesso come os próximos dias.
