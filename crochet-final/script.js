function showSection(sectionId) {
  document.querySelectorAll('.gallery-section').forEach(sec => {
    sec.classList.add('hidden');
    sec.classList.remove('active');
  });
  document.getElementById(sectionId).classList.remove('hidden');
  document.getElementById(sectionId).classList.add('active');
}

// Cart functionality
let cart = JSON.parse(localStorage.getItem('cart')) || [];
function addToCart(item, price, image) {
  cart.push({item, price, image});
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCart();
}

function updateCart() {
  let cartList = document.getElementById('cart-items');
  if (!cartList) {
    return;
  }
  let total = 0;
  cartList.innerHTML = '';


  cart.forEach((c, i) => {
    total += c.price;


    cartList.innerHTML += 
    `<li>
    <img src="${c.image}" alt="${c.item}" class="cart-img">
    ${c.item} - Rs ${c.price} 
    <button onclick="removeFromCart(${i})">❌</button></li>`;
  });
  document.getElementById('cart-total').innerText = "Total: Rs" + total;
}

function removeFromCart(index) {
  cart.splice(index, 1);
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCart();
}

function checkout() {
  alert("Proceeding to checkout... (This is where you connect payment)");
}


function placeOrder(event) {
    event.preventDefault();

    // Grab all <li> items from the cart
    let cartItems = document.querySelectorAll("#cart-items li");
    let orderSummary = "";

    cartItems.forEach(item => {
        orderSummary += item.innerText + "\n"; 
    });

    // Also grab the total
    let total = document.getElementById("cart-total")?.innerText || "";

    // Put summary + total into hidden textarea
    document.getElementById("orderDetails").value = orderSummary + "\n" + total;

    // Submit the form to Formspree
    event.target.submit();

    // ✅ Show success message
    let successBox = document.getElementById("order-success");
    if (successBox) {
        successBox.style.display = "block";
        successBox.style.opacity = "1";

        // Auto-hide after 4 seconds
        setTimeout(() => {
            successBox.style.transition = "opacity 1s";
            successBox.style.opacity = "0";

            // Fully hide after fade-out
            setTimeout(() => {
                successBox.style.display = "none";
            }, 1000);
        }, 4000);
    }

    // ✅ Clear cart
    document.getElementById("cart-items").innerHTML = "";
    document.getElementById("cart-total").innerText = "Total: Rs.0";
}



// --- Buy Now Functionality ---
// function buyNow(product) {
  // Clear existing cart and add only this product

  function buyNow(item, price, image) {
  let product = { item, price, image };
  localStorage.setItem('cart', JSON.stringify([product]));
  // Redirect to checkout page
  window.location.href = "checkout.html";
}

// Initialize cart UI on load (if cart list is present on the page)
window.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('cart-items')) {
    updateCart();
  }
});

// --- Populate Checkout Page ---
if (document.getElementById('checkout-items')) {
  let checkoutItems = JSON.parse(localStorage.getItem('cart')) || [];
  const checkoutList = document.getElementById('checkout-items');
  let total = 0;

checkoutItems.forEach((item, i) => {
  total += item.price;

  let li = document.createElement('li');
  li.classList.add('cart-item');

  li.innerHTML = `
    <img src="${item.image}" alt="${item.item}" class="cart-img">
    <span>${item.item} - Rs${item.price}</span>
    <button onclick="removeCheckoutItem(${i})">❌</button>
  `;

  checkoutList.appendChild(li);
});




//   checkoutItems.forEach(item => {
//     total += item.price;

//     let li = document.createElement('li');
//     li.classList.add('cart-item');

//  li.innerHTML=

//  `
//       <img src="${item.image}" alt="${item.name}" class="cart-img">
//       <span>${item.name} - Rs${item.price}</span>
//       <button onclick="removeCheckoutItem(${i})">❌</button>
//     `;

//     checkoutList.appendChild(li);
//   });
   
  document.getElementById('checkout-total').textContent = `Total: Rs${total}`;

  // Handle form submission
  document.getElementById('checkout-form').addEventListener('submit', async function(e) {
    e.preventDefault();

    // Build order payload from form + cart
    const form = this;
    const customer = {
      name: document.getElementById('name')?.value || '',
      email: form.querySelector('input[name="email"]')?.value || '',
      address: document.getElementById('address')?.value || '',
      city: document.getElementById('city')?.value || '',
      phone: document.getElementById('phone')?.value || '',
      paymentMethod: form.querySelector('select[name="payment"]')?.value || ''
    };

    const toAbsoluteUrl = (src) => {
      try { return new URL(src, window.location.href).toString(); }
      catch (_) { return src; }
    };

    const items = (JSON.parse(localStorage.getItem('cart')) || []).map(ci => ({
      item: ci.item,
      price: ci.price,
      image: toAbsoluteUrl(ci.image)
    }));

    const order = {
      items,
      total,
      customer,
      createdAt: new Date().toISOString()
    };

    // Persist last order for reference
    localStorage.setItem('lastOrder', JSON.stringify(order));

    // Populate hidden field with readable summary
    const detailsField = document.getElementById('orderDetails');
    if (detailsField) {
      const lines = [];
      lines.push(`Customer: ${customer.name}`);
      lines.push(`Email: ${customer.email}`);
      lines.push(`Phone: ${customer.phone}`);
      lines.push(`Address: ${customer.address}, ${customer.city}`);
      lines.push(`Payment: ${customer.paymentMethod}`);
      lines.push('Items:');
      items.forEach((it, idx) => {
        lines.push(`${idx + 1}. ${it.item} - Rs${it.price} | img: ${it.image}`);
      });
      lines.push(`Total: Rs${total}`);
      detailsField.value = lines.join('\n');
    }

    // Optional: POST to endpoint if provided via data-endpoint
    const endpoint = form.dataset.endpoint;
    let sent = false;
    if (endpoint) {
      try {
        const resp = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(order)
        });
        sent = resp.ok;
      } catch (_) {
        sent = false;
      }
    }

    // If a native action is set (e.g., Formspree), allow normal submission
    if (!sent && form.getAttribute('action')) {
      form.submit();
      return;
    }

    // Show success locally if no external submission
    localStorage.removeItem('cart');
    checkoutList.innerHTML = "";
    document.getElementById('checkout-total').textContent = "Total: Rs0";
    const successBox = document.getElementById('order-success');
    if (successBox) {
      successBox.style.display = 'block';
      successBox.style.opacity = '1';
      setTimeout(() => {
        successBox.style.transition = 'opacity 1s';
        successBox.style.opacity = '0';
        setTimeout(() => { successBox.style.display = 'none'; }, 1000);
      }, 4000);
    }

    form.reset();
  });
}

// Remove item in checkout
function removeCheckoutItem(index) {
  let checkoutItems = JSON.parse(localStorage.getItem('cart')) || [];
  checkoutItems.splice(index, 1);
  localStorage.setItem('cart', JSON.stringify(checkoutItems));
  location.reload(); // reload page so list updates
}


// Highlight current sidebar link
const sidebarLinks = document.querySelectorAll('.sidebar ul li a');
sidebarLinks.forEach(link => {
  if (link.getAttribute('href') === window.location.pathname.split("/").pop()) {
    link.classList.add('active');
  }
});



