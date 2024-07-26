const fs = require("fs");
const path = require("path");
const UglifyJS = require("uglify-js");
const CleanCSS = require("clean-css");
const { minify } = require("html-minifier-terser");

// Répertoire des fichiers source
const srcDir = path.join(__dirname, "..", "App academique");

// Fonction pour minifier les fichiers JS
function minifyJS(filePath) {
  try {
    const code = fs.readFileSync(filePath, "utf8");
    const result = UglifyJS.minify(code);
    if (result.error) {
      console.error(`Erreur de minification JS: ${result.error}`);
      return;
    }
    fs.writeFileSync(filePath, result.code, "utf8");
    console.log(`Minified JS: ${path.relative(srcDir, filePath)}`);
  } catch (err) {
    console.error("Erreur lors de la minification JS:", err.message);
  }
}

// Fonction pour minifier les fichiers CSS
function minifyCSS(filePath) {
  try {
    const code = fs.readFileSync(filePath, "utf8");
    const result = new CleanCSS().minify(code);
    fs.writeFileSync(filePath, result.styles, "utf8");
    console.log(`Minified CSS: ${path.relative(srcDir, filePath)}`);
  } catch (err) {
    console.error("Erreur lors de la minification CSS:", err.message);
  }
}

// Fonction pour minifier les fichiers HTML
function minifyHTML(filePath) {
  try {
    const code = fs.readFileSync(filePath, "utf8");
    const result = minify(code, {
      collapseWhitespace: true,
      removeComments: true,
      minifyJS: true,
      minifyCSS: true,
    });
    fs.writeFileSync(filePath, result, "utf8");
    console.log(`Minified HTML: ${path.relative(srcDir, filePath)}`);
  } catch (err) {
    console.error("Erreur lors de la minification HTML:", err.message);
  }
}

// Fonction pour parcourir récursivement les fichiers
function processDirectory(dir) {
  fs.readdirSync(dir).forEach((file) => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      processDirectory(filePath); // Recurse into subdirectories
    } else if (file.endsWith(".js")) {
      minifyJS(filePath);
    } else if (file.endsWith(".css")) {
      minifyCSS(filePath);
    } else if (file.endsWith(".html")) {
      minifyHTML(filePath);
    }
  });
}

// Démarrer le traitement du répertoire source
processDirectory(srcDir);

console.log("Minification complète !");
