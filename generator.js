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


function generateArticles(values) {
  if (!values.blog) {
    return '';
  }
  function generateArticle(article) {
    var s = '';
    s += '<article>';
    s += '<h2>' + article.title + '</h2>';
    s += '<p>' + article.content + '</p>';
    for (let section of article.sections) {
      s += '<h3>' + section.heading + '</h3>';
      s += '<ul>';
      for (let point of section.points) {
        s += '<li>' + point + '</li>';
      }
      s += '</ul>';
    }
    s += '<p>' + article.closing + '</p>';
    s += '</article>';
    return s;
  }
  var s = '';
  for (let article of values.blog.articles) {
    s += generateArticle(article);
  }
  return s;
}

// Helper function to replace placeholders in a template
function substitutePlaceholders(template, values, lang) {
  return template.replace(/\{\{(.*?)\}\}/g, function (_, key) {
    if (key === 'articles') {
      return generateArticles(values);
    }
    let o = values;
    for (let k of key.trim().split('.')) {
      o = o || {};
      o = o[k];
    }
    let value = o || '';
    if (value === '') {
      console.warn('missing key: ' + key + ' ' + lang);
    }
    return value;
  });
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
        const renderedContent = substitutePlaceholders(templateContent, strings, lang);
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
