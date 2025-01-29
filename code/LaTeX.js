// LaTeX.js

// Grab references to elements
const inputText   = document.getElementById("inputText");
const outputBox   = document.getElementById("outputBox");
const menuButton  = document.getElementById("menuButton");
const menuContent = document.getElementById("menuContent");

/**
 * A dictionary that maps spelled-out Greek words (in uppercase/lowercase)
 * to the correct LaTeX code (or an equivalent character).
 *
 * Note: Some uppercase Greek letters match standard math commands (e.g. \Gamma),
 * but many do not exist (like \Alpha or \Beta), so we map them to normal letters (A, B, etc.).
 */
const GREEK_MAP = {
  // Lowercase
  "alpha":    "\\alpha",
  "beta":     "\\beta",
  "gamma":    "\\gamma",
  "delta":    "\\delta",
  "epsilon":  "\\epsilon",
  "zeta":     "\\zeta",
  "eta":      "\\eta",
  "theta":    "\\theta",
  "iota":     "\\iota",
  "kappa":    "\\kappa",
  "lambda":   "\\lambda",
  "mu":       "\\mu",
  "nu":       "\\nu",
  "xi":       "\\xi",
  "omicron":  "o",           // No \omicron in standard LaTeX; treat as letter ‘o’
  "pi":       "\\pi",
  "rho":      "\\rho",
  "sigma":    "\\sigma",
  "tau":      "\\tau",
  "upsilon":  "\\upsilon",
  "phi":      "\\phi",
  "chi":      "\\chi",
  "psi":      "\\psi",
  "omega":    "\\omega",

  // Uppercase
  "Alpha":    "A",           // No \Alpha
  "Beta":     "B",           // No \Beta
  "Gamma":    "\\Gamma",
  "Delta":    "\\Delta",
  "Epsilon":  "E",
  "Zeta":     "Z",
  "Eta":      "H",
  "Theta":    "\\Theta",
  "Iota":     "I",
  "Kappa":    "K",
  "Lambda":   "\\Lambda",
  "Mu":       "M",
  "Nu":       "N",
  "Xi":       "\\Xi",
  "Omicron":  "O",           // no \Omicron
  "Pi":       "\\Pi",
  "Rho":      "P",
  "Sigma":    "\\Sigma",
  "Tau":      "T",
  "Upsilon":  "\\Upsilon",
  "Phi":      "\\Phi",
  "Chi":      "X",
  "Psi":      "\\Psi",
  "Omega":    "\\Omega"
};

// Prevent Enter from adding new lines
inputText.addEventListener("keydown", (evt) => {
  if (evt.key === "Enter") {
    evt.preventDefault();
  }
});

/**
 * Convert user input (custom syntax) to LaTeX
 */
function convertToLaTeX(input) {

  // ============= 1) Derivatives  =============
  //  d(var1)/d(var2) => \frac{dvar1}{dvar2}
  let latex = input.replace(
    /d([a-zA-Z]+)\/d([a-zA-Z]+)/g,
    (_, num, den) => `\\frac{d${num}}{d${den}}`
  );

  // ============= 2) exp(...) => e^{...}  =============
  latex = latex.replace(/exp\((.*?)\)/g, (_, inside) => `e^{${inside}}`);
  

  // ============= 3) Limits: lim(x -> inf) ... =============
  const limitRegex = /lim\s*\(\s*([a-zA-Z]+)\s*->\s*(\w+)\)\s+(.*)/g;
  latex = latex.replace(limitRegex, (_, variable, direction, expr) => {
    let dirLatex = direction;
    if (direction === "inf") {
      dirLatex = "\\infty";
    } else if (direction === "minf") {
      dirLatex = "-\\infty";
    }
    return `\\lim_{${variable} \\to ${dirLatex}} ${expr}`;
  });

  // ============= 4) Plain "inf" => \infty, "minf" => -\infty  =============
  latex = latex.replace(/\bminf\b/g, "-\\infty");
  latex = latex.replace(/\binf\b/g, "\\infty");
  latex = latex.replace(/\*/g, "{*}");

  // ============= 5) Greek letters by dictionary  =============
  // Build a regex that matches any of our GREEK_MAP keys, e.g. \b(Alpha|alpha|Beta|beta|...)\b
  const greekPattern = "\\b(" + Object.keys(GREEK_MAP).join("|") + ")\\b";
  const greekRegex = new RegExp(greekPattern, "g");
  latex = latex.replace(greekRegex, (full, group) => {
    return GREEK_MAP[group];
  });

  // ============= 6) Basic text replacements =============
  latex = latex
    // x^2 => x^{2} for digits
    .replace(/\^\((.*?)\)/g, "^{($1)}")
    // Brüche
    // Handle all fraction cases, including (a)/(b), a/(bcd), (abc)/d, a/sqrt(...), and sqrt(...)/a
    .replace(/\(\s*([^()]+)\s*\)\s*\/\s*\(\s*([^()]+)\s*\)/g, "\\frac{$1}{$2}") // (a)/(b)
    .replace(/\(\s*([^()]+)\s*\)\s*\/\s*([^()\s]+)/g, "\\frac{$1}{$2}") // (abc)/d
    .replace(/([^()\s]+)\s*\/\s*\(\s*([^()]+)\s*\)/g, "\\frac{$1}{$2}") // a/(bcd)
    .replace(/([^()\s]+)\s*\/\s*(sqrt\([^()]+\))/g, "\\frac{$1}{$2}") // a/sqrt(...)
    .replace(/(sqrt\([^()]+\))\s*\/\s*([^()\s]+)/g, "\\frac{$1}{$2}") // sqrt(...)/a
    .replace(/([^()\s]+)\s*\/\s*([^()\s]+)/g, "\\frac{$1}{$2}") // a/b

    
    
    // sqrt(...) => \sqrt{...}
    .replace(/sqrt\((.*?)\)/g, "\\sqrt{$1}")
    // * => \cdot
    .replace(/\*/g, "\\cdot")
    // inequalities
    .replace(/<=/g, "\\leq")
    .replace(/>=/g, "\\geq")
    .replace(/!=/g, "\\neq");

  // ============= 7) Integrals  =============
  // int_{a}^{b} ...
  const bracketDefRegex = /int\s*_\{\s*([^}]+)\}\s*\^\{\s*([^}]+)\}\s+(.*?)\s*dx/g;
  latex = latex.replace(bracketDefRegex, (_, lower, upper, integrand) => {
    return `\\int_{${lower}}^{${upper}} ${integrand} \\, dx`;
  });
  // int_a^b ...
  const simpleDefRegex = /int\s*_(\S+)\^(\S+)\s+(.*?)\s*dx/g;
  latex = latex.replace(simpleDefRegex, (_, lower, upper, integrand) => {
    return `\\int_{${lower}}^{${upper}} ${integrand} \\, dx`;
  });
  // int(a, b) ...
  const parenDefRegex = /int\s*\(\s*([^,]+)\s*,\s*([^)\s]+)\s*\)\s+(.*?)\s*dx/g;
  latex = latex.replace(parenDefRegex, (_, lower, upper, integrand) => {
    return `\\int_{${lower}}^{${upper}} ${integrand} \\, dx`;
  });
  // indefinite int ...
  const indefiniteRegex = /int\s+(?!\()(.+?)\s*dx/g;
  latex = latex.replace(indefiniteRegex, (_, integrand) => {
    return `\\int ${integrand} \\, dx`;
  });

  // ============= 8) Summation  =============
  // sum_{a}^{b} ...
  const bracketSumRegex = /sum\s*_\{\s*([^}]+)\}\s*\^\{\s*([^}]+)\}\s+(.*)/g;
  latex = latex.replace(bracketSumRegex, (_, lower, upper, expr) => {
    return `\\sum_{${lower}}^{${upper}} ${expr}`;
  });
  // sum_a^b ...
  const simpleSumRegex = /sum\s*_(\S+)\^(\S+)\s+(.*)/g;
  latex = latex.replace(simpleSumRegex, (_, lower, upper, expr) => {
    return `\\sum_{${lower}}^{${upper}} ${expr}`;
  });
  // sum(a, b) ...
  const parenSumRegex = /sum\s*\(\s*([^,]+)\s*,\s*([^)\s]+)\s*\)\s+(.*)/g;
  latex = latex.replace(parenSumRegex, (_, lower, upper, expr) => {
    return `\\sum_{${lower}}^{${upper}} ${expr}`;
  });

  // ============= 9) Products  =============
  // prod_{a}^{b} ...
  const bracketProdRegex = /prod\s*_\{\s*([^}]+)\}\s*\^\{\s*([^}]+)\}\s+(.*)/g;
  latex = latex.replace(bracketProdRegex, (_, lower, upper, expr) => {
    return `\\prod_{${lower}}^{${upper}} ${expr}`;
  });
  // prod_a^b ...
  const simpleProdRegex = /prod\s*_(\S+)\^(\S+)\s+(.*)/g;
  latex = latex.replace(simpleProdRegex, (_, lower, upper, expr) => {
    return `\\prod_{${lower}}^{${upper}} ${expr}`;
  });
  // prod(a, b) ...
  const parenProdRegex = /prod\s*\(\s*([^,]+)\s*,\s*([^)\s]+)\s*\)\s+(.*)/g;
  latex = latex.replace(parenProdRegex, (_, lower, upper, expr) => {
    return `\\prod_{${lower}}^{${upper}} ${expr}`;
  });

  // ============= 10) Fractions =============
  // (expr)/(expr)
  const parenFracRegex = /\(\s*([^()]+)\s*\)\s*\/\s*\(\s*([^()]+)\s*\)/g;
  latex = latex.replace(parenFracRegex, (_, num, den) => {
    return `\\frac{${num}}{${den}}`;
  });
  // simpler "a/b"
  const fractionRegex = /(\b[a-zA-Z0-9]+)\s*\/\s*(\b[a-zA-Z0-9]+)/g;
  latex = latex.replace(fractionRegex, (_, num, den) => {
    return `\\frac{${num}}{${den}}`;
  });

  // ============= 11) +- => \pm =============
  latex = latex.replace(/\+\-/g, "\\pm");

  // ============= 12) Wrap everything in \( ... \) =============
  return `\\(${latex}\\)`;
}

/** Re-typeset the given element with MathJax. */
function renderMath(element) {
  MathJax.typesetPromise([element]).catch(err => console.error(err));
}

/** Show/hide the menu + re-render LaTeX in the menu when shown. */
menuButton.addEventListener("click", () => {
  if (menuContent.style.display === "block") {
    menuContent.style.display = "none";
  } else {
    menuContent.style.display = "block";
    // Re-render LaTeX in the menu
    MathJax.typesetPromise([menuContent]).catch(err => console.error(err));
  }
});

/** Convert user input => LaTeX => show in outputBox */
inputText.addEventListener("input", () => {
  const userInput   = inputText.value;
  const latexOutput = convertToLaTeX(userInput);
  outputBox.innerHTML = latexOutput;
  renderMath(outputBox);
});

/* ========== Make the menu draggable ========== */
(function enableMenuDrag() {
  let offsetX = 0, offsetY = 0;
  let dragging = false;

  // Entire #menuContent is the "drag handle"
  menuContent.addEventListener("mousedown", (e) => {
    dragging = true;
    offsetX = e.clientX - menuContent.offsetLeft;
    offsetY = e.clientY - menuContent.offsetTop;
    // Listen for mousemove/up on document
    document.addEventListener("mousemove", dragMenu);
    document.addEventListener("mouseup", dropMenu);
  });

  function dragMenu(e) {
    if (!dragging) return;
    menuContent.style.left = (e.clientX - offsetX) + "px";
    menuContent.style.top  = (e.clientY - offsetY) + "px";
  }

  function dropMenu() {
    dragging = false;
    document.removeEventListener("mousemove", dragMenu);
    document.removeEventListener("mouseup", dropMenu);
  }
})();
