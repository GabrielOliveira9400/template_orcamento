# Template de Orçamento EJS - QUINTELA HOME SERVICE

Este repositório contém a conversão do template de orçamento (Estimate) para **EJS (Embedded JavaScript)**, mantendo 100% de fidelidade ao design original.

## 📁 Arquivos do Projeto

- [estimate.ejs](file:///Users/gabrieloliveira/projetos/template_orcamento/estimate.ejs) - O template EJS completo com CSS integrado.
- [render.js](file:///Users/gabrieloliveira/projetos/template_orcamento/render.js) - Script Node.js para renderizar o template com dados de exemplo e gerar o `output.html`.
- [package.json](file:///Users/gabrieloliveira/projetos/template_orcamento/package.json) - Configuração de dependências do projeto (EJS).

---

## 🚀 Como Utilizar

### 1. Instalar as dependências
```bash
npm install
```

### 2. Renderizar para HTML via Node.js
```bash
npm start
```
Isso criará o arquivo `output.html` no diretório raiz.

---

## 💻 Exemplo de Integração com Express.js

```javascript
const express = require('express');
const app = express();

app.set('view engine', 'ejs');
app.set('views', './'); // ou './views'

app.get('/orcamento/:id', (req, res) => {
  const dadosOrcamento = {
    company: {
      name: 'QUINTELA',
      subtitle: 'HOME SERVICE',
      tagline: 'Your home, our commitment!',
      email: 'quintelahomeservice@gmail.com',
      phone: '781-974-4831'
    },
    estimate: {
      number: 'EST-001',
      date: 'July 22, 2026'
    },
    client: {
      name: 'João Silva',
      address: 'Rua Exemplo, 123 - São Paulo',
      phone: '(11) 99999-8888',
      email: 'joao@email.com'
    },
    items: [
      {
        no: 1,
        description: 'Roof Inspection and Asphalt Shingle Repair',
        quantity: '1 job',
        unitPrice: '$450.00',
        totalPrice: '$450.00'
      },
      {
        no: 2,
        description: 'Vinyl Siding Replacement',
        quantity: '150 sq ft',
        unitPrice: '$8.50/sqft',
        totalPrice: '$1,275.00'
      }
    ],
    paymentTerms: {
      deposit: '$1,000.00 USD due upon estimate acceptance.',
      finalPayment: 'Balance due upon service completion.'
    },
    totals: {
      subtotal: '$2,900.00',
      taxRate: '6.25%',
      tax: '$181.25',
      total: '$3,081.25'
    },
    terms: [
      { title: 'Validity', description: 'This estimate is valid for 30 days from the date issued.' },
      { title: 'Changes', description: 'Any requested changes or additional services after acceptance will require a revised estimate.' },
      { title: 'Warranty', description: 'Services are guaranteed for 12 months from completion, covering only work performed.' },
      { title: 'Liability', description: 'Our company is insured but not liable for damages beyond our control.' }
    ],
    acceptanceText: 'By signing below, the client agrees to the terms and conditions in this estimate and authorizes the specified services to start.'
  };

  res.render('estimate', dadosOrcamento);
});

app.listen(3000, () => console.log('Servidor rodando na porta 3000'));
```

---

## 🖨️ Impressão e PDF
O template possui regras CSS `@media print` integradas, permitindo exportar diretamente para PDF com excelente acabamento gráfico através de navegação do browser ou bibliotecas como Puppeteer (`page.pdf()`).
