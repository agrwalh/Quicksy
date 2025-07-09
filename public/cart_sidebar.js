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

// Optionally, expose openCartSidebar for use elsewhere
window.openCartSidebar = openCartSidebar; 