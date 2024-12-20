const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Paths
const templatesDir = path.join(__dirname, 'templates');
const translationsDir = path.join(__dirname, 'translations');
const outputDir = path.join(__dirname, 'docs');
const defaultLang = 'nl';

// Read translations
const translations = fs.readdirSync(translationsDir).reduce((acc, file) => {
  const lang = path.basename(file, '.json');
  acc[lang] = require(path.join(translationsDir, file));
  return acc;
}, {});

// Helper function to replace placeholders in a template
function substitutePlaceholders(template, values) {
  return template.replace(/\{\{(.*?)\}\}/g, (_, key) => values[key.trim()] || '');
}

// Generate files
(function generateSite() {
  for (const [lang, strings] of Object.entries(translations)) {
    const langOutputDir = lang === defaultLang ? outputDir : path.join(outputDir, lang);

    // Create output directory for the language
    fs.mkdirSync(langOutputDir, { recursive: true });

    // Process each template
    const templates = fs.readdirSync(templatesDir);
    for (const templateFile of templates) {
      if (templateFile.endsWith('.html')) {
        const templatePath = path.join(templatesDir, templateFile);
        const outputFilePath = path.join(langOutputDir, templateFile);

        // Render template
        const templateContent = fs.readFileSync(templatePath, 'utf-8');
        const renderedContent = substitutePlaceholders(templateContent, strings);
        fs.writeFileSync(outputFilePath, renderedContent);
        console.log(`Generated: ${outputFilePath}`);
      }
    }
  }

  console.log('Site generation complete!');
})();


const sizes = [480, 768, 1200];
sizes.forEach(size => {
    sharp('./docs/images/pexels-anete-lusina-5240637.jpg')
        .resize(size)
        .toFile(`./docs/images/pexels-anete-lusina-5240637-${size}.jpg`);
    sharp('./docs/images/pexels-elly-fairytale-3865802.jpg')
        .resize(size)
        .toFile(`./docs/images/pexels-elly-fairytale-3865802-${size}.jpg`);
});
