let rating = null;
let amount = null;

async function loadReviews() {
    document.getElementById('books').innerHTML = '';
    rating = document.getElementById('numberSelect').value;
    amount = document.getElementById('numberInput').value;
    let data = await getReviewList(rating, amount);
    for (let review of data) {
        const x = `
            <div class="col-4">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">${review.title}</h5>
                        <h6 class="card-subtitle mb-2 text-muted">${review.text}</h6>
                        <div>product asin: ${review.parent_asin}</div>
                        <div>date: ${new Date(review.timestamp).toLocaleString()}</div>
                        <div>helpful vote: ${review.helpful_vote}</div>
                        <div>predicted label: ${review.predicted_label ? "Real" : "Fake"}</div>
                        <div>predict confidence: ${review.confidence}</div>
                        <div>reliability: ${review.reliability}</div>
                        <img src="${review.product_images[0].large}" style="width: 200px">
                        <hr>
                    </div>
                </div>
            </div>
            `
        document.getElementById('books').innerHTML = document.getElementById('books').innerHTML + x;
    }
}

loadReviews();