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

// Add to Cart AJAX logic
function setupAddToCartButtons() {
  document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      const productId = this.getAttribute('data-product-id');
      fetch('/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ productId })
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          // Optionally update sidebar content here
          openCartSidebar();
        } else {
          alert(data.error || 'Error adding to cart');
        }
      })
      .catch(() => alert('Error adding to cart'));
    });
  });
}
// Run on page load
window.addEventListener('DOMContentLoaded', setupAddToCartButtons);

// Optionally, expose openCartSidebar for use elsewhere
window.openCartSidebar = openCartSidebar; 