/* ========= Function Parser ========= */
function f(x, eq) {
  try {
    // Step 1: clean input
    eq = eq.toLowerCase().replace(/\s+/g, "");

    // Step 2: replace math functions
    eq = eq
      .replace(/sinx/g, "Math.sin(x)")
      .replace(/cosx/g, "Math.cos(x)")
      .replace(/tanx/g, "Math.tan(x)")
      .replace(/lnx/g, "Math.log(x)")
      .replace(/logx/g, "Math.log10(x)")
      .replace(/e\^x/g, "Math.exp(x)");

    // Step 3: handle power like x^2 → Math.pow(x,2)
    eq = eq.replace(/x\^(\d+)/g, "Math.pow(x,$1)");

    // Step 4: final execution
    return Function("x", "return " + eq)(x);

  } catch {
    throw new Error("Invalid function input");
  }
}

/* ========= Simpson’s 3/8 Rule ========= */
function simpson38(eq, a, b, n) {
  if (n % 3 !== 0) {
    throw new Error("For Simpson’s 3/8 Rule, n must be a multiple of 3");
  }

  const h = (b - a) / n;
  let sum = f(a, eq) + f(b, eq);

  let steps = "";
  steps += "=== Simpson’s 3/8 Rule ===\n\n";
  steps += `h = (${b} - ${a}) / ${n} = ${h}\n\n`;

  steps += `f(x0) = f(${a}) = ${f(a, eq)}\n`;
  steps += `f(xn) = f(${b}) = ${f(b, eq)}\n\n`;

  for (let i = 1; i < n; i++) {
    const x = a + i * h;
    const fx = f(x, eq);

    if (i % 3 === 0) {
      sum += 2 * fx;
      steps += `i=${i}, x=${x.toFixed(4)}, f(x)=${fx.toFixed(4)} → 2*f(x)\n`;
    } else {
      sum += 3 * fx;
      steps += `i=${i}, x=${x.toFixed(4)}, f(x)=${fx.toFixed(4)} → 3*f(x)\n`;
    }
  }

  const result = (3 * h / 8) * sum;

  steps += `\nFinal Result = (3h/8) × sum = ${result.toFixed(6)}\n`;

  return { result, steps };
}

/* ========= Weddle’s Rule ========= */
function weddle(eq, a, b, n) {
  if (n % 6 !== 0) {
    throw new Error("For Weddle’s Rule, n must be a multiple of 6");
  }

  const h = (b - a) / n;
  let total = 0;

  let steps = "";
  steps += "=== Weddle’s Rule ===\n\n";
  steps += `h = (${b} - ${a}) / ${n} = ${h}\n\n`;

  for (let i = 0; i < n; i += 6) {
    steps += `--- Block starting at i=${i} ---\n`;

    const x0 = a + i * h;
    const x1 = x0 + h;
    const x2 = x0 + 2 * h;
    const x3 = x0 + 3 * h;
    const x4 = x0 + 4 * h;
    const x5 = x0 + 5 * h;
    const x6 = x0 + 6 * h;

    const f0 = f(x0, eq);
    const f1 = f(x1, eq);
    const f2 = f(x2, eq);
    const f3 = f(x3, eq);
    const f4 = f(x4, eq);
    const f5 = f(x5, eq);
    const f6 = f(x6, eq);

    steps += `x0=${x0.toFixed(4)}, f=${f0.toFixed(4)}\n`;
    steps += `x1=${x1.toFixed(4)}, f=${f1.toFixed(4)}\n`;
    steps += `x2=${x2.toFixed(4)}, f=${f2.toFixed(4)}\n`;
    steps += `x3=${x3.toFixed(4)}, f=${f3.toFixed(4)}\n`;
    steps += `x4=${x4.toFixed(4)}, f=${f4.toFixed(4)}\n`;
    steps += `x5=${x5.toFixed(4)}, f=${f5.toFixed(4)}\n`;
    steps += `x6=${x6.toFixed(4)}, f=${f6.toFixed(4)}\n`;

    const block =
      (3 * h / 10) *
      (f0 + 5 * f1 + f2 + 6 * f3 + f4 + 5 * f5 + f6);

    steps += `Block Contribution = ${block.toFixed(6)}\n\n`;

    total += block;
  }

  steps += `Final Result = ${total.toFixed(6)}\n`;

  return { result: total, steps };
}

/* ========= Main Solver ========= */
function solve() {
  const eq = document.getElementById("equation").value.trim();
  const a = parseFloat(document.getElementById("a").value);
  const b = parseFloat(document.getElementById("b").value);
  const n = parseInt(document.getElementById("n").value);
  const method = document.getElementById("methodSelect").value;

  const output = document.getElementById("result");

  try {
    if (!eq) throw new Error("Function is required");
    if (isNaN(a) || isNaN(b)) throw new Error("Invalid interval");
    if (a >= b) throw new Error("a must be less than b");
    if (isNaN(n) || n <= 0) throw new Error("Invalid n");

    const h = (b - a) / n;

    let tableRows = "";
    let sum = 0;

    for (let i = 0; i <= n; i++) {
      const x = a + i * h;
      const fx = f(x, eq);

      let coeff = "";

      if (method === "simpson") {
        if (i === 0 || i === n) {
          coeff = 1;
          sum += fx;
        } else if (i % 3 === 0) {
          coeff = 2;
          sum += 2 * fx;
        } else {
          coeff = 3;
          sum += 3 * fx;
        }
      }

      tableRows += `
        <tr>
          <td>${i}</td>
          <td>${x.toFixed(6)}</td>
          <td>${fx.toFixed(6)}</td>
          <td>${coeff}</td>
        </tr>
      `;
    }

    let result = "";

    if (method === "simpson") {
      result = (3 * h / 8) * sum;
    }

    output.innerHTML = `
      <div style="padding:10px">
        <h3>Results</h3>
        <p><b>Step size (h):</b> ${h.toFixed(6)}</p>
        <p><b>Final Result:</b> ${result.toFixed(6)}</p>

        <h3>Iteration Details</h3>
        <table border="1" width="100%" style="border-collapse:collapse">
          <tr>
            <th>i</th>
            <th>x</th>
            <th>f(x)</th>
            <th>Coefficient</th>
          </tr>
          ${tableRows}
        </table>
      </div>
    `;

  } catch (err) {
    output.innerHTML = "❌ " + err.message;
  }
}
