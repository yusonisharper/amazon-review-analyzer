document.addEventListener('DOMContentLoaded', function () {
    const productsPerPage = 10;
    const visiblePages = 5;
    let currentPage = 1;
    let totalProducts = 0;
    let products = [];
    let filteredProducts = [];

    async function loadProducts(count) {
        products = await getProductList(count);
        totalProducts = products.length;
        filteredProducts = products; // Initially, filtered products are all products
        displayProducts(currentPage);
        setupPagination();
    }

    async function getReview(asin) {
        let response = await fetch(`http://localhost:3000/products/${asin}/reviews`);
        if (response.status === 200) {
            let data = await response.json();
            return data;
        }
        return [];
    }

    function displayProducts(page) {
        const startIndex = (page - 1) * productsPerPage;
        const endIndex = Math.min(startIndex + productsPerPage, filteredProducts.length);
        const productTableBody = document.querySelector('#product-table tbody');
        productTableBody.innerHTML = '';

        for (let i = startIndex; i < endIndex; i++) {
            const product = filteredProducts[i];
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><img src="${product.images[0].large}" alt="${product.title}" class="img-thumbnail" style="max-width: 100px;"></td>
                <td><a href="#" class="product-title" data-asin="${product.parent_asin}">${product.title}</a></td>
                <td>${product.average_rating}</td>
                <td>${product.rating_number}</td>
                <td>${product.parent_asin}</td>
            `;
            productTableBody.appendChild(row);

            const reviewContainer = document.createElement('div');
            reviewContainer.classList.add('review-container');
            reviewContainer.setAttribute('id', `reviews-${product.parent_asin}`);
            row.appendChild(reviewContainer);
        }

        document.querySelectorAll('.product-title').forEach(item => {
            item.addEventListener('click', async function (e) {
                e.preventDefault();
                const asin = this.dataset.asin;
                const reviewContainer = document.getElementById(`reviews-${asin}`);
                if (reviewContainer.style.display === 'none' || reviewContainer.style.display === '') {
                    const reviews = await getReview(asin);
                    reviewContainer.innerHTML = reviews.map(review => `
                        <div class="review-item">
                            <h5>${review.title}</h5>
                            <p><strong>Rating:</strong> ${review.rating}</p>
                            <p><strong>Confidence:</strong> ${review.confidence}</p>
                            <p><strong>Predicted Label:</strong> ${review.predicted_label}</p>
                            <p><strong>Reliability:</strong> ${review.reliability}</p>
                            <p>${review.text}</p>
                        </div>
                    `).join('');
                    reviewContainer.style.display = 'block';
                } else {
                    reviewContainer.style.display = 'none';
                }
            });
        });
    }

    function setupPagination() {
        const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
        const pagination = document.getElementById('pagination');
        pagination.innerHTML = '';
    
        let startPage = Math.max(currentPage - Math.floor(visiblePages / 2), 1);
        let endPage = Math.min(startPage + visiblePages - 1, totalPages);
    
        if (endPage - startPage < visiblePages - 1) {
            startPage = Math.max(endPage - visiblePages + 1, 1);
        }
    
        for (let i = startPage; i <= endPage; i++) {
            const pageItem = document.createElement('li');
            pageItem.classList.add('page-item');
            if (i === currentPage) {
                pageItem.classList.add('active');
            }
            pageItem.innerHTML = `<a class="page-link" href="#">${i}</a>`;
            pageItem.addEventListener('click', function (e) {
                e.preventDefault();
                currentPage = i;
                displayProducts(currentPage);
                setupPagination();
            });
            pagination.appendChild(pageItem);
        }
    
        if (startPage > 1) {
            const firstPageItem = document.createElement('li');
            firstPageItem.classList.add('page-item');
            firstPageItem.innerHTML = `<a class="page-link" href="#">1</a>`;
            firstPageItem.addEventListener('click', function (e) {
                e.preventDefault();
                currentPage = 1;
                displayProducts(currentPage);
                setupPagination();
            });
            pagination.insertBefore(firstPageItem, pagination.firstChild);
    
            const dotsItem = document.createElement('li');
            dotsItem.classList.add('page-item', 'disabled');
            dotsItem.innerHTML = `<a class="page-link" href="#">...</a>`;
            pagination.insertBefore(dotsItem, firstPageItem.nextSibling);
        }
    
        if (endPage < totalPages) {
            const dotsItem = document.createElement('li');
            dotsItem.classList.add('page-item', 'disabled');
            dotsItem.innerHTML = `<a class="page-link" href="#">...</a>`;
            pagination.appendChild(dotsItem);

        }
    }
    

    function searchProducts(query) {
        filteredProducts = products.filter(product => 
            product.title.toLowerCase().includes(query.toLowerCase()) ||
            product.parent_asin.toLowerCase().includes(query.toLowerCase())
        );
        currentPage = 1;
        displayProducts(currentPage);
        setupPagination();
    }

    document.getElementById('search-form').addEventListener('submit', function (e) {
        e.preventDefault();
        const query = document.getElementById('search-input').value;
        searchProducts(query);
    });

    loadProducts(5000);
});