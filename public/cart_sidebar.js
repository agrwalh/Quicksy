// Sidebar open/close logic
function openCartSidebar() {
  document.getElementById('cartSidebar').classList.add('active');
}
function closeCartSidebar() {
  document.getElementById('cartSidebar').classList.remove('active');
}
document.getElementById('closeCartBtn')?.addEventListener('click', closeCartSidebar);
document.getElementById('cartSidebar')?.addEventListener('click', function(e) {
  if (e.target === this) closeCartSidebar();
});

// Quantity controls
const qtyBtns = document.querySelectorAll('.cart-item-qty-controls .qty-btn');
qtyBtns.forEach(btn => {
  btn.addEventListener('click', function() {
    const valueSpan = this.parentElement.querySelector('.qty-value');
    let qty = parseInt(valueSpan.textContent);
    if (this.textContent.trim() === '+') {
      qty++;
    } else if (qty > 1) {
      qty--;
    }
    valueSpan.textContent = qty;
  });
});

// Tip selection
const tipBtns = document.querySelectorAll('.tip-btn');
tipBtns.forEach(btn => {
  btn.addEventListener('click', function() {
    tipBtns.forEach(b => b.classList.remove('selected'));
    this.classList.add('selected');
  });
});

// Donation checkbox
const donationCheck = document.getElementById('donationCheck');
if (donationCheck) {
  donationCheck.addEventListener('change', function() {
    // You can add logic here if needed
  });
}

// Render cart sidebar content dynamically
function renderCartSidebar(cartData) {
  const content = document.getElementById('cartSidebarContent');
  if (!content) return;
  if (!cartData || !cartData.products || cartData.products.length === 0) {
    content.innerHTML = `
      <div class="cart-header">
        <h2>My Cart</h2>
        <button class="cart-close-btn" id="closeCartBtn">&times;</button>
      </div>
      <div class="p-6 text-center text-gray-500">Your cart is empty.</div>
    `;
    document.getElementById('closeCartBtn')?.addEventListener('click', closeCartSidebar);
    return;
  }
  // Cart items
  let itemsHtml = '';
  cartData.products.forEach(item => {
    if (!item.product) return;
    let imgSrc = '/images/quicksy.jpg';
    if (item.product.image && typeof item.product.image === 'string' && item.product.image.length > 0) {
      imgSrc = `data:image/jpg;base64,${item.product.image}`;
    }
    itemsHtml += `
      <div class="cart-item">
        <img src="${imgSrc}" alt="${item.product.name}" class="cart-item-img">
        <div class="cart-item-details">
          <div class="cart-item-title">${item.product.name}</div>
          <div class="cart-item-qty">${item.product.size || ''}</div>
          <div class="cart-item-price">₹${item.product.price}</div>
        </div>
        <div class="cart-item-qty-controls">
          <button class="qty-btn" data-action="decrement" data-id="${item.product._id}">-</button>
          <span class="qty-value">${item.quantity}</span>
          <button class="qty-btn" data-action="increment" data-id="${item.product._id}">+</button>
        </div>
      </div>
    `;
  });
  // Bill details
  const delivery = 30, handling = 9;
  const grandTotal = (cartData.totalPrice || 0) + delivery + handling;
  content.innerHTML = `
    <div class="cart-header">
      <h2>My Cart</h2>
      <button class="cart-close-btn" id="closeCartBtn">&times;</button>
    </div>
    ${itemsHtml}
    <div class="cart-bill-details">
      <div class="bill-row"><span>Items total</span><span>₹${cartData.totalPrice || 0}</span></div>
      <div class="bill-row"><span>Delivery charge <span class="info-icon">&#9432;</span></span><span>₹${delivery}</span></div>
      <div class="bill-row"><span>Handling charge <span class="info-icon">&#9432;</span></span><span>₹${handling}</span></div>
      <div class="bill-row bill-grand-total"><span>Grand total</span><span>₹${grandTotal}</span></div>
    </div>
    <div class="cart-donation">
      <div class="donation-icon"><span>&#127873;</span></div>
      <div class="donation-details">
        <div class="donation-title">Feeding India donation</div>
        <div class="donation-desc">Working towards a malnutrition free India. Feeding India...<span class="donation-readmore">read more</span></div>
      </div>
      <div class="donation-checkbox">
        <input type="checkbox" id="donationCheck"><label for="donationCheck">₹1</label>
      </div>
    </div>
    <div class="cart-tip">
      <div class="tip-title">Tip your delivery partner</div>
      <div class="tip-desc">Your kindness means a lot! 100% of your tip will go directly to your delivery partner.</div>
      <div class="tip-options">
        <button class="tip-btn">😊 ₹20</button>
        <button class="tip-btn">🥳 ₹30</button>
        <button class="tip-btn">😍 ₹50</button>
        <button class="tip-btn">👏 Custom</button>
      </div>
    </div>
    <div class="cart-footer">
      <div class="cart-total">₹${grandTotal} <span class="cart-total-label">TOTAL</span></div>
      <a href="/cart" class="cart-pay-btn" ${cartData.products.length === 0 ? 'disabled' : ''}>Proceed To Pay &rarr;</a>
    </div>
  `;
  document.getElementById('closeCartBtn')?.addEventListener('click', closeCartSidebar);
  // Quantity controls
  content.querySelectorAll('.qty-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const id = this.getAttribute('data-id');
      const action = this.getAttribute('data-action');
      fetch(`/cart/${action === 'increment' ? 'add' : 'remove'}/${id}`, { credentials: 'same-origin' })
        .then(() => fetch('/cart/data', { credentials: 'same-origin' }))
        .then(res => res.json())
        .then(data => renderCartSidebar(data));
    });
  });
}

// Fetch and render cart sidebar
function fetchAndRenderCartSidebar() {
  fetch('/cart/data', { credentials: 'same-origin' })
    .then(res => res.json())
    .then(data => renderCartSidebar(data));
}

// Add to Cart AJAX logic
function setupAddToCartButtons() {
  document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      const productId = this.getAttribute('data-product-id');
      fetch('/cart/add', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ productId })
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          fetchAndRenderCartSidebar();
          openCartSidebar();
        } else {
          alert(data.error || 'Error adding to cart');
        }
      })
      .catch(() => alert('Error adding to cart'));
    });
  });
}

// When sidebar opens, always refresh cart
window.openCartSidebar = function() {
  fetchAndRenderCartSidebar();
  document.getElementById('cartSidebar').classList.add('active');
};

window.addEventListener('DOMContentLoaded', setupAddToCartButtons); 