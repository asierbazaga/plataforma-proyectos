const fs = require('fs');
const path = 'src/apps/gastos/GastosApp.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add selectedMonth state
content = content.replace(
  `  const [selectedWallet, setSelectedWallet] = useState<'all' | WalletAccount>('all');`,
  `  const [selectedWallet, setSelectedWallet] = useState<'all' | WalletAccount>('all');\n\n  const [selectedMonth, setSelectedMonth] = useState<string>(() => {\n    const now = new Date();\n    return \`\${now.getFullYear()}-\${String(now.getMonth() + 1).padStart(2, '0')}\`;\n  });`
);

// 2. Update useMemo
const oldUseMemo1 = `  // Cálculos por Cartera
  const {
    abancaIncome, abancaExpense, abancaBalance,
    ingIncome, ingExpense, ingBalance,
    totalIncome, totalExpense, netBalance,
    filteredExpenses
  } = React.useMemo(() => {
    const filtered = expenses.filter(e => {
      if (selectedWallet === 'all') return true;
      return (e.account || 'abanca') === selectedWallet;
    });

    const abInc = expenses.filter(e => (e.account || 'abanca') === 'abanca' && e.type === 'income').reduce((acc, c) => acc + c.amount, 0);
    const abExp = expenses.filter(e => (e.account || 'abanca') === 'abanca' && e.type === 'expense').reduce((acc, c) => acc + c.amount, 0);
    const inInc = expenses.filter(e => e.account === 'ing' && e.type === 'income').reduce((acc, c) => acc + c.amount, 0);
    const inExp = expenses.filter(e => e.account === 'ing' && e.type === 'expense').reduce((acc, c) => acc + c.amount, 0);
    
    const tInc = filtered.filter(e => e.type === 'income').reduce((acc, c) => acc + c.amount, 0);
    const tExp = filtered.filter(e => e.type === 'expense').reduce((acc, c) => acc + c.amount, 0);

    return {
      abancaIncome: abInc, abancaExpense: abExp, abancaBalance: abInc - abExp,
      ingIncome: inInc, ingExpense: inExp, ingBalance: inInc - inExp,
      totalIncome: tInc, totalExpense: tExp, netBalance: tInc - tExp,
      filteredExpenses: filtered
    };
  }, [expenses, selectedWallet]);`;

const newUseMemo1 = `  // Cálculos por Cartera
  const {
    abancaIncome, abancaExpense, abancaBalance,
    ingIncome, ingExpense, ingBalance,
    totalIncome, totalExpense, netBalance,
    filteredExpenses, monthlyFilteredExpenses, availableMonths
  } = React.useMemo(() => {
    const filtered = expenses.filter(e => {
      if (selectedWallet === 'all') return true;
      return (e.account || 'abanca') === selectedWallet;
    });

    const monthsSet = new Set<string>();
    expenses.forEach(e => {
      if (e.transaction_date) {
        monthsSet.add(e.transaction_date.substring(0, 7));
      }
    });
    const now = new Date();
    const currentMonthKey = \`\${now.getFullYear()}-\${String(now.getMonth() + 1).padStart(2, '0')}\`;
    monthsSet.add(currentMonthKey);
    const availableMonths = Array.from(monthsSet).sort((a, b) => b.localeCompare(a));

    const monthlyFiltered = filtered.filter(e => {
      if (selectedMonth === 'all') return true;
      return String(e.transaction_date || '').startsWith(selectedMonth);
    });

    const abInc = expenses.filter(e => (e.account || 'abanca') === 'abanca' && e.type === 'income').reduce((acc, c) => acc + c.amount, 0);
    const abExp = expenses.filter(e => (e.account || 'abanca') === 'abanca' && e.type === 'expense').reduce((acc, c) => acc + c.amount, 0);
    const inInc = expenses.filter(e => e.account === 'ing' && e.type === 'income').reduce((acc, c) => acc + c.amount, 0);
    const inExp = expenses.filter(e => e.account === 'ing' && e.type === 'expense').reduce((acc, c) => acc + c.amount, 0);
    
    const tInc = filtered.filter(e => e.type === 'income').reduce((acc, c) => acc + c.amount, 0);
    const tExp = filtered.filter(e => e.type === 'expense').reduce((acc, c) => acc + c.amount, 0);

    return {
      abancaIncome: abInc, abancaExpense: abExp, abancaBalance: abInc - abExp,
      ingIncome: inInc, ingExpense: inExp, ingBalance: inInc - inExp,
      totalIncome: tInc, totalExpense: tExp, netBalance: tInc - tExp,
      filteredExpenses: filtered,
      monthlyFilteredExpenses: monthlyFiltered,
      availableMonths
    };
  }, [expenses, selectedWallet, selectedMonth]);`;

content = content.replace(oldUseMemo1, newUseMemo1);

// 3. Update Pie chart filter
content = content.replace(
  `const onlyExpenses = filteredExpenses.filter(e => e.type === 'expense');`,
  `const onlyExpenses = monthlyFilteredExpenses.filter(e => e.type === 'expense');`
);

// 4. Update the wallet and month selector UI
const oldWalletFilterRegex = /\{\/\* Selector de Cartera Activa.*?\{\/\* ========================================================================= \*\//s;
const newWalletFilter = `{/* Filtros Globales (Cartera y Mes) */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-slate-900/60 p-2 rounded-2xl border border-slate-800">
        {walletConfig.has_account_2 && (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs font-bold w-full sm:w-auto">
            <button
              onClick={() => setSelectedWallet('all')}
              className={\`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all flex-shrink-0 flex items-center gap-1.5 \${
                selectedWallet === 'all'
                  ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                  : 'bg-transparent text-slate-400 hover:bg-slate-800/50 hover:text-white'
              }\`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Todas las Cuentas</span>
            </button>

            <button
              onClick={() => setSelectedWallet('abanca')}
              className={\`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all flex-shrink-0 flex items-center gap-1.5 \${
                selectedWallet === 'abanca'
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  : 'bg-transparent text-slate-400 hover:bg-slate-800/50 hover:text-white'
              }\`}
            >
              <span>🏦</span>
              <span>{walletConfig.account_1_name}</span>
            </button>

            <button
              onClick={() => setSelectedWallet('ing')}
              className={\`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all flex-shrink-0 flex items-center gap-1.5 \${
                selectedWallet === 'ing'
                  ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                  : 'bg-transparent text-slate-400 hover:bg-slate-800/50 hover:text-white'
              }\`}
            >
              <span>🤝</span>
              <span>{walletConfig.account_2_name}</span>
            </button>
          </div>
        )}

        {/* Filtro de Mes (Solo en Movimientos y Análisis) */}
        {(activeTab === 'movements' || activeTab === 'analytics') && (
          <div className="flex items-center gap-2 sm:ml-auto w-full sm:w-auto pl-1 sm:pl-0 sm:border-l sm:border-slate-800 sm:pl-3">
            <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent text-white text-xs font-bold rounded-lg px-2 py-1.5 outline-none cursor-pointer hover:bg-slate-800 transition-colors w-full sm:w-auto appearance-none"
              style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2394a3b8%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right .5rem top 50%', backgroundSize: '.65rem auto', paddingRight: '1.5rem' }}
            >
              <option value="all" className="bg-slate-900 text-white">Todo el Histórico</option>
              {availableMonths.map(m => {
                const [year, month] = m.split('-');
                const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
                const monthName = monthNames[parseInt(month, 10) - 1];
                return (
                  <option key={m} value={m} className="bg-slate-900 text-white">{monthName} {year}</option>
                );
              })}
            </select>
          </div>
        )}
      </div>

      {/* ========================================================================= */}`;

content = content.replace(oldWalletFilterRegex, newWalletFilter);

// 5. Update Movimientos mapping
content = content.replace(/filteredExpenses\.length/g, "monthlyFilteredExpenses.length");
content = content.replace(/filteredExpenses\.map/g, "monthlyFilteredExpenses.map");
// Roll back for Comparativa Mes a Mes which uses filteredExpenses (if it accidentally matched, which it didn't)
// Actually last6months block only has filteredExpenses.filter, not .length or .map.

// 6. Update Comparativa Mes a Mes computation
const oldComparativa = `    // =========================================================================
    // CÁLCULO DE COMPARATIVA MES A MES (HISTÓRICO ÚLTIMOS 6 MESES)
    // =========================================================================
    const { last6Months, currentMonthData, previousMonthData, expenseDiff, incomeDiff, savingsDiff, maxMonthlyBar } = React.useMemo(() => {
      const currentDate = new Date();`;

const newComparativa = `    // =========================================================================
    // CÁLCULO DE COMPARATIVA MES A MES (HISTÓRICO ÚLTIMOS 6 MESES)
    // =========================================================================
    const { last6Months, currentMonthData, previousMonthData, expenseDiff, incomeDiff, savingsDiff, maxMonthlyBar } = React.useMemo(() => {
      let currentDate = new Date();
      if (selectedMonth !== 'all') {
        const [y, m] = selectedMonth.split('-');
        currentDate = new Date(parseInt(y, 10), parseInt(m, 10) - 1, 1);
      }`;

content = content.replace(oldComparativa, newComparativa);
content = content.replace(`    }, [filteredExpenses]);`, `    }, [filteredExpenses, selectedMonth]);`);

fs.writeFileSync(path, content, 'utf8');
console.log("Patched successfully!");
