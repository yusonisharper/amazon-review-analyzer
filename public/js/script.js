
///////////////////////////////////////start here////////////////////////////////////////////

// get product list given specific size (count)
async function getProductList(count) {
    let response = await fetch(`http://localhost:3000/products/count/${count}`);
    if (response.status === 200) {
        let data = await response.json();
        console.log(data);
        return data;
    }
}

// get review list given specific size (count)
async function getReviewList(rating, count) {
    let response = await fetch(`http://localhost:3000/reviews/${count}`);
    if (response.status === 200) {
        let data = await response.json();
        console.log(data);
        return data;
    }
}

// get products using asin, should only return one or zero
async function getProduct(asin) {
    let response = await fetch(`http://localhost:3000/products/${asin}`);
    if (response.status === 200) {
        let data = await response.json();
        console.log(data);
        return data;
    }
}

// get product reviews given asin
async function getReview(asin) {
    let response = await fetch(`http://localhost:3000/products/${asin}/reviews`);
    if (response.status === 200) {
        let data = await response.json();
        console.log(data);
        return data;
    }
}

// get review list base on rating given specific size (count)
async function getReviewList(rating, count) {
    let response = await fetch(`http://localhost:3000/reviews/${rating}/${count}`);
    if (response.status === 200) {
        let data = await response.json();
        console.log(data);
        return data;
    }
}

// get keywords List base on rating given specific size (count)
async function getKeywordsList(rating, count) {
    let response = await fetch(`http://localhost:3000/keywords/1/${rating}/${count}`);
    if (response.status === 200) {
        let data = await response.json();
        console.log(data);
        return data;
    }
}

// get Two-word keywords List base on rating given specific size (count)
async function getTwoKeywordsList(rating, count) {
    let response = await fetch(`http://localhost:3000/keywords/2/${rating}/${count}`);
    if (response.status === 200) {
        let data = await response.json();
        console.log(data);
        return data;
    }
}

// get reviews that contains keywords
async function getReviewListBaseKeyword(keyword, rating, count) {
    let response = await fetch(`http://localhost:3000/reviews/${rating}/${count}/text=${keyword}`);
    if (response.status === 200) {
        let data = await response.json();
        console.log(data);
        return data;
    }
}

//getProduct('B07F2BTFS9');
//getProductList('100');
//getReview('B07F2BTFS9');
// getReviewList(1, 20);
//getKeywordsList(1, 100);
// getTwoKeywordsList(1, 100);
// getReviewListBaseKeyword("small", 1, 100);