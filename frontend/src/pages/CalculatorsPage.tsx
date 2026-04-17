import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calculator, TrendingUp, Flame, Coffee, Compass, DollarSign, PiggyBank } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '';

function useMacro() {
  return useQuery({
    queryKey: ['macro'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const { data } = await axios.get(`${API_URL}/api/report/macro`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      return data as { selic: number | null; ipca: number | null; usd_brl: number | null };
    },
    staleTime: 60 * 60 * 1000,
  });
}

function fmt(v: number, decimals = 2) {
  return v.toLocaleString('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function fmtBRL(v: number) {
  return `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function Input({ label, value, onChange, suffix, min }: {
  label: string; value: number; onChange: (v: number) => void; suffix?: string; min?: number;
}) {
  return (
    <div>
      <label className="text-[11px] text-text-muted block mb-1">{label}</label>
      <div className="flex items-center gap-1">
        <input
          type="number"
          value={value}
          min={min ?? 0}
          onChange={e => onChange(Number(e.target.value))}
          className="w-full bg-transparent border border-border rounded-md px-3 py-1.5 text-sm text-text-primary tabular-nums focus:outline-none focus:border-text-faint"
        />
        {suffix && <span className="text-[11px] text-text-muted shrink-0">{suffix}</span>}
      </div>
    </div>
  );
}

function ResultRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between py-1.5 border-b border-border/30">
      <span className="text-xs text-text-muted">{label}</span>
      <span className={`text-sm font-medium tabular-nums ${highlight ? 'text-gain' : 'text-text-primary'}`}>{value}</span>
    </div>
  );
}

// ── Calculadora: Rentabilidade e Dividendos ──────────────────────

function RentabilidadeCalc({ selic, ipca }: { selic: number; ipca: number }) {
  const [initial, setInitial] = useState(6700);
  const [monthly, setMonthly] = useState(500);
  const [years, setYears] = useState(20);
  const [rate, setRate] = useState(12);
  const [dy, setDy] = useState(6);
  const [reinvest, setReinvest] = useState(true);

  const result = useMemo(() => {
    const monthlyRate = rate / 100 / 12;
    const months = years * 12;
    let patrimony = initial;
    let totalInvested = initial;
    let totalDividends = 0;
    const yearlyData: { year: number; patrimony: number; invested: number; dividends: number }[] = [];

    for (let m = 1; m <= months; m++) {
      patrimony *= (1 + monthlyRate);
      patrimony += monthly;
      totalInvested += monthly;

      const monthlyDiv = patrimony * (dy / 100 / 12);
      totalDividends += monthlyDiv;
      if (reinvest) patrimony += monthlyDiv;

      if (m % 12 === 0) {
        yearlyData.push({ year: m / 12, patrimony, invested: totalInvested, dividends: totalDividends });
      }
    }

    const monthlyIncome = patrimony * (dy / 100 / 12);
    const realRate = ((1 + rate / 100) / (1 + ipca / 100) - 1) * 100;

    return { patrimony, totalInvested, totalDividends, monthlyIncome, realRate, yearlyData };
  }, [initial, monthly, years, rate, dy, reinvest, ipca]);

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <Input label="Aporte inicial" value={initial} onChange={setInitial} suffix="R$" />
        <Input label="Aporte mensal" value={monthly} onChange={setMonthly} suffix="R$" />
        <Input label="Período" value={years} onChange={setYears} suffix="anos" />
        <Input label="Rentabilidade anual" value={rate} onChange={setRate} suffix="%" />
        <Input label="Dividend Yield anual" value={dy} onChange={setDy} suffix="%" />
        <div className="flex items-end">
          <label className="flex items-center gap-2 text-xs text-text-secondary cursor-pointer">
            <input type="checkbox" checked={reinvest} onChange={e => setReinvest(e.target.checked)}
              className="rounded border-border" />
            Reinvestir dividendos
          </label>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        {[
          { l: 'Patrimônio final', v: fmtBRL(result.patrimony), h: true },
          { l: 'Total investido', v: fmtBRL(result.totalInvested) },
          { l: 'Dividendos acumulados', v: fmtBRL(result.totalDividends), h: true },
          { l: 'Renda mensal (DY)', v: fmtBRL(result.monthlyIncome), h: true },
        ].map(i => (
          <div key={i.l}>
            <p className="text-[11px] text-text-muted mb-0.5">{i.l}</p>
            <p className={`text-lg font-semibold tabular-nums ${i.h ? 'text-gain' : 'text-text-primary'}`}>{i.v}</p>
          </div>
        ))}
      </div>

      <p className="text-[11px] text-text-muted mb-3">
        Rent. real (descontando IPCA {ipca}%): {fmt(result.realRate)}% a.a. | SELIC atual: {selic}%
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead><tr className="border-b border-border/50">
            <th className="text-left py-1.5 text-text-muted">Ano</th>
            <th className="text-right py-1.5 text-text-muted">Patrimônio</th>
            <th className="text-right py-1.5 text-text-muted">Investido</th>
            <th className="text-right py-1.5 text-text-muted">Dividendos acum.</th>
          </tr></thead>
          <tbody>{result.yearlyData.filter((_, i) => i % (years > 10 ? 2 : 1) === 0 || i === result.yearlyData.length - 1).map(r => (
            <tr key={r.year} className="border-b border-border/20">
              <td className="py-1.5 text-text-secondary">{r.year}</td>
              <td className="py-1.5 text-right text-text-primary tabular-nums">{fmtBRL(r.patrimony)}</td>
              <td className="py-1.5 text-right text-text-secondary tabular-nums">{fmtBRL(r.invested)}</td>
              <td className="py-1.5 text-right text-gain tabular-nums">{fmtBRL(r.dividends)}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}

// ── Calculadoras FIRE ──────────────────────────────────────────

function FireCalc({ type, selic, ipca }: { type: string; selic: number; ipca: number }) {
  const defaults: Record<string, { expenses: number; withdrawal: number; extra: string }> = {
    traditional: { expenses: 5000, withdrawal: 4, extra: '' },
    lean: { expenses: 3000, withdrawal: 3.5, extra: 'Gastos mínimos essenciais. Sem luxo.' },
    fat: { expenses: 15000, withdrawal: 3.5, extra: 'Vida confortável. Viagens, hobbies, plano de saúde premium.' },
    coast: { expenses: 5000, withdrawal: 4, extra: 'Quanto investir AGORA e parar. Juros compostos fazem o resto.' },
    barista: { expenses: 5000, withdrawal: 4, extra: 'Aposentadoria parcial. Trabalho meio-período cobre parte dos gastos.' },
    geo: { expenses: 3000, withdrawal: 4, extra: 'Morar num lugar mais barato (interior, Portugal, Tailândia).' },
  };

  const d = defaults[type] || defaults.traditional;
  const [expenses, setExpenses] = useState(d.expenses);
  const [withdrawal, setWithdrawal] = useState(d.withdrawal);
  const [current, setCurrent] = useState(50000);
  const [monthlyContrib, setMonthlyContrib] = useState(2000);
  const [returnRate, setReturnRate] = useState(selic > 0 ? selic : 12);
  const [partTimeIncome, setPartTimeIncome] = useState(2000);
  const [targetAge, setTargetAge] = useState(65);
  const [currentAge, setCurrentAge] = useState(30);

  useEffect(() => {
    if (selic > 0) setReturnRate(selic);
  }, [selic]);

  const result = useMemo(() => {
    const annualExpenses = expenses * 12;
    let effectiveExpenses = annualExpenses;
    if (type === 'barista') effectiveExpenses = Math.max(0, annualExpenses - partTimeIncome * 12);

    const fireNumber = effectiveExpenses / (withdrawal / 100);
    const monthlyRate = returnRate / 100 / 12;

    // How many months to reach FIRE number
    let patrimony = current;
    let months = 0;
    const maxMonths = 12 * 60;
    while (patrimony < fireNumber && months < maxMonths) {
      patrimony *= (1 + monthlyRate);
      patrimony += monthlyContrib;
      months++;
    }
    const yearsToFire = months / 12;

    // Coast FIRE: how much to invest NOW at current age so it grows to fireNumber by targetAge
    let coastAmount = 0;
    if (type === 'coast') {
      const yearsToGrow = targetAge - currentAge;
      const annualRate = returnRate / 100;
      coastAmount = fireNumber / Math.pow(1 + annualRate, yearsToGrow);
    }

    const monthlyPassiveIncome = fireNumber * (withdrawal / 100 / 12);
    const realWithdrawal = ((1 + withdrawal / 100) / (1 + ipca / 100) - 1) * 100;

    return {
      fireNumber, yearsToFire, monthlyPassiveIncome, effectiveExpenses,
      coastAmount, realWithdrawal,
    };
  }, [expenses, withdrawal, current, monthlyContrib, returnRate, partTimeIncome, targetAge, currentAge, type, ipca]);


  return (
    <div>
      {d.extra && <p className="text-xs text-text-secondary mb-4">{d.extra}</p>}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <Input label="Gastos mensais" value={expenses} onChange={setExpenses} suffix="R$" />
        <Input label="Taxa de retirada anual" value={withdrawal} onChange={setWithdrawal} suffix="%" />
        <Input label="Patrimônio atual" value={current} onChange={setCurrent} suffix="R$" />
        <Input label="Aporte mensal" value={monthlyContrib} onChange={setMonthlyContrib} suffix="R$" />
        <Input label="Rentabilidade anual" value={returnRate} onChange={setReturnRate} suffix="%" />
        {type === 'barista' && (
          <Input label="Renda meio-período" value={partTimeIncome} onChange={setPartTimeIncome} suffix="R$/mês" />
        )}
        {type === 'coast' && (
          <>
            <Input label="Idade atual" value={currentAge} onChange={setCurrentAge} suffix="anos" />
            <Input label="Idade alvo" value={targetAge} onChange={setTargetAge} suffix="anos" />
          </>
        )}
      </div>

      <ResultRow label="Patrimônio necessário (FIRE Number)" value={fmtBRL(result.fireNumber)} highlight />
      <ResultRow label={`Gastos anuais ${type === 'barista' ? '(descontando renda parcial)' : ''}`} value={fmtBRL(result.effectiveExpenses)} />
      <ResultRow label="Renda passiva mensal no FIRE" value={fmtBRL(result.monthlyPassiveIncome)} highlight />
      <ResultRow label="Tempo para atingir" value={result.yearsToFire >= 60 ? 'Mais de 60 anos' : `${fmt(result.yearsToFire, 1)} anos`} />
      {type === 'coast' && (
        <ResultRow label={`Investir agora (Coast) e esperar até ${targetAge} anos`} value={fmtBRL(result.coastAmount)} highlight />
      )}
      <ResultRow label={`Taxa de retirada real (descontando IPCA ${ipca}%)`} value={`${fmt(result.realWithdrawal)}%`} />

      <p className="text-[11px] text-text-muted mt-4">
        Regra dos 4%: patrimônio = gastos anuais / taxa de retirada.
        {type === 'geo' && ' Para Geographic Arbitrage, use os gastos do local mais barato (interior do Brasil, Portugal, Ásia).'}
        {type === 'lean' && ' Lean FIRE assume gastos mínimos — alimentação, moradia básica, saúde.'}
        {type === 'fat' && ' Fat FIRE assume vida confortável — viagens, restaurantes, plano de saúde top.'}
        {type === 'coast' && ` Coast FIRE: investir ${fmtBRL(result.coastAmount)} hoje e nunca mais aportar. Os juros compostos a ${returnRate}% a.a. chegam ao FIRE Number em ${targetAge - currentAge} anos.`}
        {type === 'barista' && ` Barista FIRE: trabalhar meio-período gerando R$ ${partTimeIncome}/mês reduz o patrimônio necessário.`}
      </p>
    </div>
  );
}

// ── Page ────────────────────────────────────────────────────────

const CALCS = [
  { id: 'rentabilidade', label: 'Rentabilidade & Dividendos', icon: <TrendingUp size={14} /> },
  { id: 'traditional', label: 'FIRE Tradicional', icon: <Flame size={14} /> },
  { id: 'lean', label: 'Lean FIRE', icon: <PiggyBank size={14} /> },
  { id: 'fat', label: 'Fat FIRE', icon: <DollarSign size={14} /> },
  { id: 'coast', label: 'Coast FIRE', icon: <Coffee size={14} /> },
  { id: 'barista', label: 'Barista FIRE', icon: <Coffee size={14} /> },
  { id: 'geo', label: 'Geographic FIRE', icon: <Compass size={14} /> },
];

export default function CalculatorsPage() {
  const [active, setActive] = useState('rentabilidade');
  const { data: macro } = useMacro();
  const selic = macro?.selic ?? 14.75;
  const ipca = macro?.ipca ?? 4.14;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Calculator size={18} className="text-text-faint" />
        <h1 className="text-xl font-semibold text-text-primary">Calculadoras Financeiras</h1>
      </div>

      <div className="flex gap-1.5 flex-wrap mb-8">
        {CALCS.map(c => (
          <button
            key={c.id}
            onClick={() => setActive(c.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs transition-colors ${
              active === c.id
                ? 'bg-white/[0.07] text-text-primary'
                : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            {c.icon} {c.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3 mb-6 text-[11px] text-text-muted">
        <span>SELIC: {selic}%</span>
        <span>IPCA: {ipca}%</span>
        <span>Juro real: {fmt(((1 + selic/100) / (1 + ipca/100) - 1) * 100)}%</span>
      </div>

      {active === 'rentabilidade' && <RentabilidadeCalc selic={selic} ipca={ipca} />}
      {active !== 'rentabilidade' && <FireCalc type={active} selic={selic} ipca={ipca} />}
    </div>
  );
}
