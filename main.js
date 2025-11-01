/* ====================================================================
  Code for Checkout Page (checkout.html) - Uses Vanilla JavaScript
====================================================================
*/
document.addEventListener('DOMContentLoaded', function() {

    const checkoutForm = document.getElementById('checkoutForm');

    if (checkoutForm) {
        
        const orderButton = checkoutForm.querySelector('button[type="submit"]');

        checkoutForm.addEventListener('submit', function(event) {
            
            event.preventDefault();

            orderButton.disabled = true;
            orderButton.textContent = 'Order Placed!';
            orderButton.classList.remove('btn-primary');
            orderButton.classList.add('btn-success');

            alert('Thank you for your order! Your purchase has been confirmed.');

            // --- *** NEW: Clear cart AND coupon from storage *** ---
            localStorage.removeItem('gadgetGalaxyCart');
            sessionStorage.removeItem('discountRate'); // Clear coupon

            checkoutForm.reset();
            
            orderButton.disabled = false;
            orderButton.textContent = 'Place Order';
            orderButton.classList.remove('btn-success');
            orderButton.classList.add('btn-primary');
            
            // --- *** NEW: Refresh the order summary so it shows 0 *** ---
            if (typeof renderCheckoutSummary === 'function') {
                 renderCheckoutSummary();
            }
        });
    }
});


/* ====================================================================
  Code for Product Pages & Cart - Uses jQuery
====================================================================
*/

// --- *** NEW: Helper functions for cart *** ---
function getCart() {
    return JSON.parse(localStorage.getItem('gadgetGalaxyCart')) || [];
}

function saveCart(cart) {
    localStorage.setItem('gadgetGalaxyCart', JSON.stringify(cart));
}

// --- *** NEW: Function to render the cart.html page *** ---
function renderCartPage() {
    let cart = getCart();
    const $cartBody = $('#cart-items-body');
    $cartBody.empty(); // Clear old cart items
    let total = 0;

    if (cart.length === 0) {
        $cartBody.html('<tr><td colspan="6">Your cart is empty.</td></tr>');
        $('#cart-total').text('Total: ₹0');
        return;
    }

    cart.forEach(item => {
        const subtotal = item.price * item.quantity;
        total += subtotal;

        const rowHtml = `
            <tr>
                <td><img src="${item.image}" alt="${item.name}" style="width: 80px; height: 80px;"></td>
                <td>${item.name}</td>
                <td>₹${item.price.toLocaleString('en-IN')}</td>
                <td>
                    <input type="number" class="form-control item-quantity" 
                           value="${item.quantity}" min="1" 
                           data-name="${item.name}" style="width: 80px;">
                </td>
                <td>₹${subtotal.toLocaleString('en-IN')}</td>
                <td>
                    <button class="btn btn-danger btn-sm remove-item-btn" 
                            data-name="${item.name}">Remove</button>
                </td>
            </tr>
        `;
        $cartBody.append(rowHtml);
    });

    // Update total
    $('#cart-total').text(`Total: ₹${total.toLocaleString('en-IN')}`);
}

// --- *** NEW: Function to render the checkout.html summary *** ---
function renderCheckoutSummary() {
    let cart = getCart();
    const $summaryList = $('#order-summary-list');
    $summaryList.empty();
    let subtotal = 0;

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        const itemHtml = `
            <li class="list-group-item d-flex justify-content-between">
                <span>${item.name} (x${item.quantity})</span>
                <strong>₹${itemTotal.toLocaleString('en-IN')}</strong>
            </li>
        `;
        $summaryList.append(itemHtml);
    });

    // Get discount from session storage
    let discountRate = parseFloat(sessionStorage.getItem('discountRate')) || 0;
    let discountAmount = subtotal * discountRate;
    let finalTotal = subtotal - discountAmount;

    // Update totals on the page
    $('#order-subtotal').text(`₹${subtotal.toLocaleString('en-IN')}`);
    $('#order-discount').text(`- ₹${discountAmount.toLocaleString('en-IN')}`);
    $('#order-final-total').text(`₹${finalTotal.toLocaleString('en-IN')}`);
}


$(function() {

    // --- NEW: Function to handle adding items to the cart ---
    function addItemToCart(button) {
        const productName = $(button).data('name');
        const productPrice = parseFloat($(button).data('price'));
        const productImage = $(button).data('image-src');
        let cart = getCart();
        let itemInCart = cart.find(item => item.name === productName);

        if (itemInCart) {
            itemInCart.quantity += 1;
        } else {
            cart.push({ name: productName, price: productPrice, image: productImage, quantity: 1 });
        }
        saveCart(cart);
    }

    // --- Feature 1: Toggle Specs (product-detail.html) ---
    $('#toggleSpecsBtn').on('click', function() {
        $('#specsDetails').toggle();
        $(this).text($('#specsDetails').is(':visible') ? 'Hide Full Specifications' : 'Show Full Specifications');
    });

    // --- Feature 2: 'Add to Cart' Feedback (product-detail.html) ---
    $('#addToCartBtn').on('click', function() {
        addItemToCart(this); 
        const originalButton = $(this); 
        originalButton.css('background-color', '#28a745').text('Added to Cart!');
        setTimeout(() => originalButton.css('background-color', '').text('Add to Cart'), 2000); 
    });

    // --- Feature 3: 'Add to Cart' Feedback (products.html list) ---
    $('.add-to-cart-list').on('click', function() {
        addItemToCart(this); 
        const originalButton = $(this);
        originalButton.text('Added!').prop('disabled', true);
        setTimeout(() => originalButton.text('Add to Cart').prop('disabled', false), 2000);
    });

    
    // --- *** NEW: Feature 4: Logic for cart.html page *** ---
    if ($('#cart-items-body').length > 0) { // This code only runs on cart.html
        renderCartPage(); // Initial render

        // Listener for quantity change
        $('#cart-items-body').on('change', '.item-quantity', function() {
            const name = $(this).data('name');
            const newQuantity = parseInt($(this).val());
            let cart = getCart();
            let item = cart.find(i => i.name === name);

            if (item && newQuantity > 0) {
                item.quantity = newQuantity;
                saveCart(cart);
            }
            renderCartPage(); // Re-render the cart
        });

        // Listener for remove button
        $('#cart-items-body').on('click', '.remove-item-btn', function() {
            const name = $(this).data('name');
            let cart = getCart();
            cart = cart.filter(i => i.name !== name); // Filter out the item
            saveCart(cart);
            renderCartPage(); // Re-render the cart
        });
    }

    // --- *** NEW: Feature 5: Logic for checkout.html page *** ---
    if ($('#order-summary-list').length > 0) { // This code only runs on checkout.html
        renderCheckoutSummary(); // Initial render of summary

        // Listener for coupon button
        $('#apply-coupon-btn').on('click', function() {
            const code = $('#coupon-code').val().trim().toUpperCase();
            const $message = $('#coupon-message');
            
            if (code === 'SAVE10') {
                sessionStorage.setItem('discountRate', '0.1'); // 10%
                $message.text('Success! 10% discount applied.').css('color', 'green');
            } else {
                sessionStorage.setItem('discountRate', '0'); // 0%
                $message.text('Invalid coupon code.').css('color', 'red');
            }
            renderCheckoutSummary(); // Re-render summary with new total
        });
    }

});