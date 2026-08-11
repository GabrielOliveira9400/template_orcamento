const fs = require('fs');
const path = require('path');
const ejs = require('ejs');

const templatePath = path.join(__dirname, 'estimate.ejs');
const outputPath = path.join(__dirname, 'output.html');

const sampleData = {
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
    name: '[Client Name]',
    address: '[Client Address]',
    phone: '[Client Phone]',
    email: '[Client Email]'
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
    },
    {
      no: 3,
      description: 'Deck Pressure Washing & Staining',
      quantity: '1 job',
      unitPrice: '$850.00',
      totalPrice: '$850.00'
    },
    {
      no: 4,
      description: 'General Home Repairs',
      quantity: '5 hours',
      unitPrice: '$65.00/hour',
      totalPrice: '$325.00'
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

ejs.renderFile(templatePath, sampleData, (err, str) => {
  if (err) {
    console.error('Erro ao renderizar o template EJS:', err);
    process.exit(1);
  }
  fs.writeFileSync(outputPath, str, 'utf-8');
  console.log('✅ Template EJS renderizado com sucesso para output.html');
});
