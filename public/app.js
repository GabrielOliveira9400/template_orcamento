document.addEventListener('DOMContentLoaded', () => {
  const servicesContainer = document.getElementById('servicesContainer');
  const btnAddService = document.getElementById('btnAddService');
  const taxRateInput = document.getElementById('taxRate');
  const subtotalDisplay = document.getElementById('subtotalDisplay');
  const taxRateDisplay = document.getElementById('taxRateDisplay');
  const taxDisplay = document.getElementById('taxDisplay');
  const totalDisplay = document.getElementById('totalDisplay');
  const btnPreview = document.getElementById('btnPreview');
  const btnGeneratePdf = document.getElementById('btnGeneratePdf');
  const previewModal = document.getElementById('previewModal');
  const btnClosePreview = document.getElementById('btnClosePreview');
  const previewIframe = document.getElementById('previewIframe');
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toastMessage');

  let itemCount = 0;

  // Default initial services matching the estimate example
  const defaultItems = [
    { description: 'Roof Inspection and Asphalt Shingle Repair', quantity: '1 job', unitPrice: '450.00' },
    { description: 'Vinyl Siding Replacement', quantity: '150 sq ft', unitPrice: '8.50' },
    { description: 'Deck Pressure Washing & Staining', quantity: '1 job', unitPrice: '850.00' },
    { description: 'General Home Repairs', quantity: '5 hours', unitPrice: '65.00' }
  ];

  // Render initial default items
  defaultItems.forEach(item => {
    addServiceItemCard(item.description, item.quantity, item.unitPrice);
  });

  // Event Listener: Add new service card
  btnAddService.addEventListener('click', () => {
    addServiceItemCard('', '1 job', '');
  });

  function addServiceItemCard(desc = '', qty = '1 job', price = '') {
    itemCount++;
    const cardId = `item-card-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    
    const card = document.createElement('div');
    card.className = 'item-card';
    card.id = cardId;

    card.innerHTML = `
      <div class="item-card-header">
        <span class="item-card-title">Serviço <span class="item-number"></span></span>
        <button type="button" class="btn-remove-item" title="Remover Serviço">
          <span>🗑️</span> Remover
        </button>
      </div>
      <div class="grid-4">
        <div class="form-group" style="margin-bottom:0;">
          <label>Descrição do Serviço <span class="required">*</span></label>
          <input type="text" class="form-control item-desc" placeholder="ex: Pintura externa da fachada" value="${desc}" required>
        </div>
        <div class="form-group" style="margin-bottom:0;">
          <label>Quantidade <span class="required">*</span></label>
          <input type="text" class="form-control item-qty" placeholder="ex: 1 job ou 150 sq ft" value="${qty}" required>
        </div>
        <div class="form-group" style="margin-bottom:0;">
          <label>Preço Unitário ($) <span class="required">*</span></label>
          <input type="number" step="0.01" class="form-control item-price" placeholder="0.00" value="${price}" required>
        </div>
        <div class="form-group" style="margin-bottom:0;">
          <label>Valor Total ($)</label>
          <input type="text" class="form-control item-total" placeholder="$0.00" readonly style="background-color: #f1f5f9; font-weight:700;">
        </div>
      </div>
    `;

    servicesContainer.appendChild(card);

    // Bind remove event
    const btnRemove = card.querySelector('.btn-remove-item');
    btnRemove.addEventListener('click', () => {
      if (servicesContainer.children.length > 1) {
        card.remove();
        updateItemNumbers();
        calculateTotals();
      } else {
        showToast('É necessário ter ao menos um serviço no orçamento.', 'error');
      }
    });

    // Bind input change calculation events
    const priceInput = card.querySelector('.item-price');
    const qtyInput = card.querySelector('.item-qty');

    priceInput.addEventListener('input', () => {
      calculateItemTotal(card);
      calculateTotals();
    });

    qtyInput.addEventListener('input', () => {
      calculateItemTotal(card);
      calculateTotals();
    });

    calculateItemTotal(card);
    updateItemNumbers();
    calculateTotals();
  }

  function updateItemNumbers() {
    const cards = servicesContainer.querySelectorAll('.item-card');
    cards.forEach((card, index) => {
      card.querySelector('.item-number').textContent = `#${index + 1}`;
    });
  }

  function calculateItemTotal(card) {
    const qtyStr = card.querySelector('.item-qty').value.trim();
    const priceVal = parseFloat(card.querySelector('.item-price').value) || 0;
    const totalInput = card.querySelector('.item-total');

    // Extract numeric multiplier from quantity if available (e.g., '150 sq ft' -> 150, '5 hours' -> 5)
    let qtyMultiplier = 1;
    const match = qtyStr.match(/^(\d+(\.\d+)?)/);
    if (match) {
      qtyMultiplier = parseFloat(match[1]);
    }

    const total = qtyMultiplier * priceVal;
    totalInput.value = `$${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    card.dataset.totalNumeric = total;
  }

  function calculateTotals() {
    let subtotal = 0;
    const cards = servicesContainer.querySelectorAll('.item-card');

    cards.forEach(card => {
      subtotal += parseFloat(card.dataset.totalNumeric) || 0;
    });

    const taxRate = parseFloat(taxRateInput.value) || 0;
    const taxVal = subtotal * (taxRate / 100);
    const grandTotal = subtotal + taxVal;

    taxRateDisplay.textContent = `${taxRate}%`;
    subtotalDisplay.textContent = `$${subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    taxDisplay.textContent = `$${taxVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    totalDisplay.textContent = `$${grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  taxRateInput.addEventListener('input', calculateTotals);

  // Helper to extract all form data for preview/PDF generation
  function getFormData() {
    const cards = Array.from(servicesContainer.querySelectorAll('.item-card'));
    let subtotal = 0;

    const items = cards.map((card, index) => {
      const description = card.querySelector('.item-desc').value || 'Serviço';
      const quantity = card.querySelector('.item-qty').value || '1';
      const priceVal = parseFloat(card.querySelector('.item-price').value) || 0;

      let qtyMultiplier = 1;
      const match = quantity.match(/^(\d+(\.\d+)?)/);
      if (match) qtyMultiplier = parseFloat(match[1]);

      const itemTotal = qtyMultiplier * priceVal;
      subtotal += itemTotal;

      // Format unit price string
      let unitPriceStr = `$${priceVal.toFixed(2)}`;
      if (quantity.includes('sq ft')) {
        unitPriceStr = `$${priceVal.toFixed(2)}/sqft`;
      } else if (quantity.includes('hour') || quantity.includes('hora')) {
        unitPriceStr = `$${priceVal.toFixed(2)}/hour`;
      }

      return {
        no: index + 1,
        description,
        quantity,
        unitPrice: unitPriceStr,
        totalPrice: `$${itemTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      };
    });

    const taxRate = parseFloat(taxRateInput.value) || 0;
    const taxVal = subtotal * (taxRate / 100);
    const grandTotal = subtotal + taxVal;

    return {
      company: {
        name: 'QUINTELA',
        subtitle: 'HOME SERVICE',
        tagline: 'Your home, our commitment!',
        email: 'quintelahomeservice@gmail.com',
        phone: document.getElementById('companyPhone').value || '781-974-4831'
      },
      estimate: {
        number: document.getElementById('estimateNumber').value || 'EST-001',
        date: document.getElementById('estimateDate').value || 'July 22, 2026'
      },
      client: {
        name: document.getElementById('clientName').value || '[Client Name]',
        address: document.getElementById('clientAddress').value || '[Client Address]',
        phone: document.getElementById('clientPhone').value || '[Client Phone]',
        email: document.getElementById('clientEmail').value || '[Client Email]'
      },
      items,
      paymentTerms: {
        deposit: document.getElementById('deposit').value,
        finalPayment: document.getElementById('finalPayment').value
      },
      totals: {
        subtotal: `$${subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        taxRate: `${taxRate}%`,
        tax: `$${taxVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        total: `$${grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      },
      terms: [
        { title: 'Validity', description: 'This estimate is valid for 30 days from the date issued.' },
        { title: 'Changes', description: 'Any requested changes or additional services after acceptance will require a revised estimate.' },
        { title: 'Warranty', description: 'Services are guaranteed for 12 months from completion, covering only work performed.' },
        { title: 'Liability', description: 'Our company is insured but not liable for damages beyond our control.' }
      ],
      acceptanceText: 'By signing below, the client agrees to the terms and conditions in this estimate and authorizes the specified services to start.'
    };
  }

  // Preview Button Handler
  btnPreview.addEventListener('click', async () => {
    const data = getFormData();
    try {
      const response = await fetch('/api/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const html = await response.text();
      
      const blob = new Blob([html], { type: 'text/html' });
      previewIframe.src = URL.createObjectURL(blob);
      previewModal.classList.add('active');
    } catch (err) {
      showToast('Erro ao carregar pré-visualização', 'error');
    }
  });

  btnClosePreview.addEventListener('click', () => {
    previewModal.classList.remove('active');
  });

  // Generate PDF Button Handler
  btnGeneratePdf.addEventListener('click', async () => {
    const data = getFormData();
    btnGeneratePdf.disabled = true;
    btnGeneratePdf.innerHTML = '<span>⏳</span> Gerando PDF...';

    try {
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Falha ao gerar o arquivo PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Orcamento_${data.estimate.number || 'EST-001'}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      showToast('PDF baixado com sucesso!');
    } catch (err) {
      console.error(err);
      showToast('Erro ao gerar o PDF. Verifique o servidor.', 'error');
    } finally {
      btnGeneratePdf.disabled = false;
      btnGeneratePdf.innerHTML = '<span>📄</span> Gerar PDF';
    }
  });

  function showToast(msg, type = 'success') {
    toastMessage.textContent = msg;
    if (type === 'error') {
      toast.style.backgroundColor = '#ef4444';
    } else {
      toast.style.backgroundColor = '#141923';
    }
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3500);
  }
});
