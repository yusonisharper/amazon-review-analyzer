document.addEventListener('DOMContentLoaded', async function () {
    const reviewsPerPage = 10;
    const visiblePages = 5;
    let currentPage = 1;
    let totalReviews = 0;
    let filteredReviews = [];
    let reviewProducts = {};
    let currentProductAsin = null;

    async function loadReviews(keyword, rating, count) {
        filteredReviews = await getReviewListBaseKeyword(keyword, rating, count);
        totalReviews = filteredReviews.length;
        await loadProductsForReviews();
    }

    async function loadProductsForReviews() {
        for (let review of filteredReviews) {
            const asin = review.parent_asin;
            if (!reviewProducts[asin]) {
                reviewProducts[asin] = await getProduct(asin);
            }
        }
    }

    async function getProduct(asin) {
        let response = await fetch(`http://localhost:3000/products/${asin}`);
        if (response.status === 200) {
            let data = await response.json();
            return data;
        }
        return {};
    }

    function displayReviews(page) {
        const startIndex = (page - 1) * reviewsPerPage;
        const endIndex = Math.min(startIndex + reviewsPerPage, filteredReviews.length);
        const reviewsTableBody = document.querySelector('#reviews');
        reviewsTableBody.innerHTML = '';

        for (let i = startIndex; i < endIndex; i++) {
            const review = filteredReviews[i];
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <div class="review-item">
                        <h5>${review.title}</h5>
                        <p><strong>Rating:</strong> ${review.rating}</p>
                        <p><strong>Confidence:</strong> ${review.confidence}</p>
                        <p><strong>Predicted Label:</strong> ${review.predicted_label}</p>
                        <p><strong>Reliability:</strong> ${review.reliability}</p>
                        <p>${review.text}</p>
                        <a href="#" class="product-link" data-asin="${review.parent_asin}">View Product</a>
                    </div>
                </td>
            `;
            reviewsTableBody.appendChild(row);
        }

        document.querySelectorAll('.product-link').forEach(item => {
            item.addEventListener('click', function (e) {
                e.preventDefault();
                const asin = this.dataset.asin;
                toggleProductDisplay(asin);
            });
        });
    }

    function toggleProductDisplay(asin) {
        const productDetail = document.querySelector('#product-detail');
        if (currentProductAsin === asin) {
            productDetail.innerHTML = '';
            currentProductAsin = null;
        } else {
            displayProduct(asin);
            currentProductAsin = asin;
        }
    }

    async function displayProduct(asin) {
        const data = await getProduct(asin);
        const product = data[0];
        console.log(product);
        if (product) {
            const productDetail = document.querySelector('#product-detail');
            productDetail.innerHTML = `
                <h3>${product.title}</h2>
                <img src="${product.images[0].large}" alt="${product.title}" class="img-thumbnail" style="max-width: 250px;">
                <p>Store: ${product.store}</p>
                <p>Rating Number: ${product.rating_number}</p>
            `;
        }
    }

    function setupPagination() {
        const totalPages = Math.ceil(filteredReviews.length / reviewsPerPage);
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
                displayReviews(currentPage);
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
                displayReviews(currentPage);
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

    document.getElementById('search-form').addEventListener('submit', async function (e) {
        e.preventDefault();
        const query = document.getElementById('search-input').value;
        const rating = document.getElementById('rating-input').value;
        const count = document.getElementById('count-input').value;
        await loadReviews(query, rating, count);
        currentPage = 1;
        displayReviews(currentPage);
        setupPagination();
    });

    // Initial setup
    currentPage = 1;
});