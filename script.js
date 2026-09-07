$(function () {
  const products = [
    { id: 1, name: 'Arc ceramic vase', category: 'Home', price: 68, material: 'Stoneware / chalk', badge: 'New', image: 'images/vase.jpg' },
    { id: 2, name: 'Linen throw / oat', category: 'Home', price: 124, material: 'European linen', badge: '', image: 'images/throw.jpg' },
    { id: 3, name: 'Everyday tote', category: 'Wear', price: 89, material: 'Organic cotton canvas', badge: 'Bestseller', image: 'images/tote.jpg' },
    { id: 4, name: 'Terra incense set', category: 'Rituals', price: 42, material: 'Hinoki / sandalwood', badge: '', image: 'images/incense.jpg' },
    { id: 5, name: 'Contour candle holder', category: 'Home', price: 56, material: 'Recycled glass', badge: 'New', image: 'images/candle.jpg' },
    { id: 6, name: 'Soft form socks / clay', category: 'Wear', price: 28, material: 'Organic cotton', badge: '', image: 'images/socks.jpg' }
  ];

  let activeFilter = 'All';
  let searchTerm = '';
  let cart = JSON.parse(localStorage.getItem('maison-cart') || '[]');
  cart = cart.map(function (item) {
    const currentProduct = products.find(function (product) { return product.id === item.id; });
    return currentProduct ? { ...item, image: currentProduct.image } : item;
  });

  function money(value) { return '$' + value.toFixed(2); }

  function filteredProducts() {
    let visible = products.filter(function (product) {
      const categoryMatch = activeFilter === 'All' || product.category === activeFilter;
      const searchMatch = !searchTerm || (product.name + ' ' + product.category + ' ' + product.material).toLowerCase().includes(searchTerm.toLowerCase());
      return categoryMatch && searchMatch;
    });
    const sort = $('#sort-select').val();
    if (sort === 'low') visible.sort(function (a, b) { return a.price - b.price; });
    if (sort === 'high') visible.sort(function (a, b) { return b.price - a.price; });
    return visible;
  }

  function renderProducts() {
    const visible = filteredProducts();
    const $grid = $('#product-grid');
    $grid.empty();
    visible.forEach(function (product) {
      const isWished = localStorage.getItem('maison-wish-' + product.id) === 'true';
      const badge = product.badge ? '<span class="product-badge">' + product.badge + '</span>' : '';
      $grid.append(
        '<article class="product-card" data-id="' + product.id + '">' +
          '<div class="product-visual">' + badge + '<button class="wish-btn ' + (isWished ? 'active' : '') + '" aria-label="' + (isWished ? 'Remove from wishlist' : 'Add to wishlist') + '">' + (isWished ? '♥' : '♡') + '</button>' +
            '<img class="product-image" src="' + product.image + '" alt="' + product.name + '" loading="lazy" />' +
            '<button class="add-btn">Add to bag <span>+</span></button>' +
          '</div><div class="product-info"><h3>' + product.name + '</h3><div class="product-meta"><span>' + product.material + '</span><span>' + money(product.price) + '</span></div></div>' +
        '</article>'
      );
    });
    $('#results-count').text(String(visible.length).padStart(2, '0') + ' ' + (visible.length === 1 ? 'piece' : 'pieces'));
    $('#empty-state').toggleClass('visible', visible.length === 0);
    $('.clear-filters').toggle(activeFilter !== 'All' || searchTerm.length > 0);
  }

  function updateCartUI() {
    const itemCount = cart.reduce(function (total, item) { return total + item.quantity; }, 0);
    const subtotal = cart.reduce(function (total, item) { return total + item.price * item.quantity; }, 0);
    $('.cart-count').text(itemCount);
    $('.drawer-count').text('(' + itemCount + ')');
    $('.cart-empty').toggleClass('hidden', cart.length > 0);
    $('.cart-footer').toggleClass('hidden', cart.length === 0);
    $('.cart-items').empty();
    cart.forEach(function (item) {
      $('.cart-items').append(
        '<div class="cart-line" data-id="' + item.id + '"><div class="cart-line-image" style="background-image:url(' + item.image + ')"></div><div><h4>' + item.name + '</h4><p>' + item.material + '</p><div class="quantity-control"><button class="quantity-btn" data-action="minus">−</button><span>' + item.quantity + '</span><button class="quantity-btn" data-action="plus">+</button></div></div><div class="cart-line-price"><strong>' + money(item.price * item.quantity) + '</strong><button class="remove-line">Remove</button></div></div>'
      );
    });
    $('.subtotal strong').text(money(subtotal));
    localStorage.setItem('maison-cart', JSON.stringify(cart));
  }

  function showToast(message) {
    $('.toast-message').text(message);
    $('.toast').addClass('visible');
    window.clearTimeout(window.maisonToast);
    window.maisonToast = window.setTimeout(function () { $('.toast').removeClass('visible'); }, 2400);
  }

  function openDrawer() {
    $('.cart-drawer').addClass('open').attr('aria-hidden', 'false');
    $('.drawer-backdrop').addClass('open');
    $('body').addClass('no-scroll');
  }

  function closeDrawer() {
    $('.cart-drawer').removeClass('open').attr('aria-hidden', 'true');
    $('.drawer-backdrop').removeClass('open');
    $('body').removeClass('no-scroll');
  }

  renderProducts();
  updateCartUI();

  $('.filter-tab').on('click', function () {
    activeFilter = $(this).data('filter');
    $('.filter-tab').removeClass('active');
    $(this).addClass('active');
    renderProducts();
  });

  $('#sort-select').on('change', renderProducts);

  $('.search-toggle').on('click', function () {
    $('.search-panel').toggleClass('open');
    if ($('.search-panel').hasClass('open')) $('#search-input').trigger('focus');
  });

  $('#search-input').on('input', function () { searchTerm = $(this).val().trim(); renderProducts(); });
  $('.search-clear').on('click', function () { $('#search-input').val('').trigger('input').trigger('focus'); });

  $('.clear-filters, .reset-products').on('click', function () {
    activeFilter = 'All'; searchTerm = '';
    $('#search-input').val(''); $('#sort-select').val('featured');
    $('.filter-tab').removeClass('active').first().addClass('active');
    renderProducts();
  });

  $('[data-category-link]').on('click', function () {
    activeFilter = $(this).data('category-link');
    $('.filter-tab').removeClass('active').filter('[data-filter="' + activeFilter + '"]').addClass('active');
    renderProducts();
  });

  $(document).on('click', '.wish-btn', function () {
    const $button = $(this); const id = $(this).closest('.product-card').data('id'); const active = !$button.hasClass('active');
    $button.toggleClass('active', active).text(active ? '♥' : '♡').attr('aria-label', active ? 'Remove from wishlist' : 'Add to wishlist');
    localStorage.setItem('maison-wish-' + id, active);
    showToast(active ? 'Saved to your wishlist' : 'Removed from your wishlist');
  });

  $(document).on('click', '.add-btn', function () {
    const id = $(this).closest('.product-card').data('id'); const product = products.find(function (item) { return item.id === id; }); const existing = cart.find(function (item) { return item.id === id; });
    if (existing) existing.quantity += 1; else cart.push({ ...product, quantity: 1 });
    updateCartUI(); showToast(product.name + ' added to your bag');
  });

  $('.cart-toggle').on('click', openDrawer);
  $('.drawer-close, .drawer-backdrop').on('click', closeDrawer);
  $('.continue-shopping').on('click', closeDrawer);

  $(document).on('click', '.quantity-btn', function () {
    const id = $(this).closest('.cart-line').data('id'); const item = cart.find(function (entry) { return entry.id === id; });
    item.quantity += $(this).data('action') === 'plus' ? 1 : -1;
    if (item.quantity < 1) cart = cart.filter(function (entry) { return entry.id !== id; });
    updateCartUI();
  });

  $(document).on('click', '.remove-line', function () { const id = $(this).closest('.cart-line').data('id'); cart = cart.filter(function (item) { return item.id !== id; }); updateCartUI(); });

  $('.checkout-btn').on('click', function () { showToast('Checkout is ready for your next step'); });

  $('.newsletter-form').on('submit', function (event) {
    event.preventDefault();
    const $message = $('.form-message'); $message.text('Thank you — you’re on the list.'); $('#email').val('');
  });

  $('.announcement-close').on('click', function () { $('.announcement-bar').slideUp(200); });
  $('.mobile-menu-btn').on('click', function () { const open = $('.main-nav').toggleClass('open').hasClass('open'); $(this).attr('aria-expanded', open); });
  $('.main-nav a').on('click', function () { $('.main-nav').removeClass('open'); $('.mobile-menu-btn').attr('aria-expanded', 'false'); });
  $(document).on('keydown', function (event) { if (event.key === 'Escape') { closeDrawer(); $('.search-panel').removeClass('open'); } });
});
