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

// Browser compartilhado: evita abrir um Chromium novo a cada PDF
let browserPromise = null;
async function getBrowser() {
  if (!puppeteer) {
    puppeteer = require('puppeteer');
  }
  if (!browserPromise) {
    const executablePath =
      process.env.PUPPETEER_EXECUTABLE_PATH ||
      process.env.CHROME_BIN ||
      undefined;

    browserPromise = puppeteer.launch({
      headless: true,
      ...(executablePath ? { executablePath } : {}),
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ]
    }).then((b) => {
      b.on('disconnected', () => { browserPromise = null; });
      return b;
    }).catch((e) => {
      browserPromise = null;
      throw e;
    });
  }
  return browserPromise;
}

// PDF Generation Endpoint via Puppeteer
app.post('/api/generate-pdf', async (req, res) => {
  const data = req.body;
  let page;

  try {
    const html = await ejs.renderFile(path.join(__dirname, 'estimate.ejs'), { ...data, forPdf: true });

    const browser = await getBrowser();
    page = await browser.newPage();

    // Bloqueia qualquer recurso externo para nunca ficar pendurado na rede
    await page.setRequestInterception(true);
    page.on('request', (r) => {
      const url = r.url();
      if (url.startsWith('data:') || url.startsWith('about:')) r.continue();
      else r.abort();
    });

    await page.setContent(html, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.evaluate(() => document.fonts.ready);

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' }
    });

    const filename = `Orcamento_${(data.estimate && data.estimate.number) ? data.estimate.number : 'EST-001'}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(pdfBuffer);
  } catch (err) {
    console.error('Erro na geração do PDF com Puppeteer:', err);
    res.status(500).send('Erro ao gerar o arquivo PDF.');
  } finally {
    if (page) {
      try {
        await page.close();
      } catch (closeErr) {
        console.error('Erro ao fechar a página do Puppeteer:', closeErr);
      }
    }
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando com sucesso em http://localhost:${PORT}`);
});
