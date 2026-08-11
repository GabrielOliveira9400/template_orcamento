const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const path = require('path');
let puppeteer;

try {
  puppeteer = require('puppeteer');
} catch (e) {
  console.log('Puppeteer ainda não instalado ou em processo de instalação.');
}

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Preview HTML Endpoint
app.post('/api/preview', (req, res) => {
  const data = req.body;
  ejs.renderFile(path.join(__dirname, 'estimate.ejs'), data, (err, html) => {
    if (err) {
      console.error('Erro ao renderizar EJS:', err);
      return res.status(500).send('Erro ao gerar pré-visualização.');
    }
    res.send(html);
  });
});

// PDF Generation Endpoint via Puppeteer
app.post('/api/generate-pdf', async (req, res) => {
  const data = req.body;

  try {
    const html = await ejs.renderFile(path.join(__dirname, 'estimate.ejs'), data);

    if (!puppeteer) {
      puppeteer = require('puppeteer');
    }

    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' }
    });

    await browser.close();

    const filename = `Orcamento_${(data.estimate && data.estimate.number) ? data.estimate.number : 'EST-001'}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(pdfBuffer);
  } catch (err) {
    console.error('Erro na geração do PDF com Puppeteer:', err);
    res.status(500).send('Erro ao gerar o arquivo PDF.');
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando com sucesso em http://localhost:${PORT}`);
});
