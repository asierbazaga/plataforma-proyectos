const fs = require('fs');
let c = fs.readFileSync('src/apps/gastos/GastosApp.tsx', 'utf8');
const oldMemoRegex = /const \{\s*abancaIncome, abancaExpense, abancaBalance,\s*ingIncome, ingExpense, ingBalance,\s*totalIncome, totalExpense, netBalance,\s*filteredExpenses\s*\} = React\.useMemo\(\(\) => \{[\s\S]*?\}, \[expenses, selectedWallet\]\);/g;

const newMemo = `const {
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

c = c.replace(oldMemoRegex, newMemo);
fs.writeFileSync('src/apps/gastos/GastosApp.tsx', c);
console.log("Patched!");
