/* getReviewList(1, 100); */
/* getKeywordsList(1, 100);
getTwoKeywordsList(1, 100); */

function calculateReviewSummary(reviews) {
    let total = reviews.length;
    let label0Count = reviews.filter(review => review.predicted_label === 0).length;
    let label1Count = reviews.filter(review => review.predicted_label === 1).length;
    let confidenceSum = reviews.reduce((sum, review) => sum + review.confidence, 0);
    let reliabilitySum = reviews.reduce((sum, review) => sum + review.reliability, 0);

    return {
        label0Percentage: (label0Count / total) * 100,
        label1Percentage: (label1Count / total) * 100,
        averageConfidence: confidenceSum / total,
        averageReliability: reliabilitySum / total
    };
}

async function displayReviewSummaries() {
    for (let rating = 1; rating <= 5; rating++) {
        let reviews = await getReviewList(rating, 1000);
        let summary = calculateReviewSummary(reviews);

        let summaryDiv = document.getElementById(`rating${rating}-summary`);
        summaryDiv.innerHTML = `
            <h3>Rating ${rating}</h3>
            <p>Predicted Label 0 Percentage: ${summary.label0Percentage.toFixed(2)}%</p>
            <p>Predicted Label 1 Percentage: ${summary.label1Percentage.toFixed(2)}%</p>
            <p>Average Confidence: ${summary.averageConfidence.toFixed(2)}</p>
            <p>Average Reliability: ${summary.averageReliability.toFixed(2)}</p>
        `;
    }
}

document.addEventListener('DOMContentLoaded', function () {
    displayReviewSummaries();
});



async function getKeywordsList(rating, count) {
    let response = await fetch(`http://localhost:3000/keywords/1/${rating}/${count}`);
    if (response.status === 200) {
        let data = await response.json();
        return data.map(item => ({ label: item.word, count: item.count }));
    }
    return [];
}

async function getTwoKeywordsList(rating, count) {
    let response = await fetch(`http://localhost:3000/keywords/2/${rating}/${count}`);
    if (response.status === 200) {
        let data = await response.json();
        return data.map(item => ({ label: item.phrase, count: item.count }));
    }
    return [];
}

async function createChart(ctx, rating, getDataFunction, labelType) {
    let data = await getDataFunction(rating, 100);
    let labels = data.map(item => item.label); // Get all 100 items
    let counts = data.map(item => item.count);

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: `${labelType} ${rating} Keywords`,
                data: counts,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: {
                        autoSkip: false,
                        maxRotation: 0,
                        minRotation: 0,
                        callback: function(value, index, values) {
                            return labels[index];
                        }
                    }
                },
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        title: function(tooltipItems) {
                            return labels[tooltipItems[0].dataIndex];
                        }
                    }
                }
            },
            barPercentage: 0.6, // Adjust this value to increase bar width
            categoryPercentage: 0.6, // Adjust this value to increase spacing between bars
        }
    });
}

document.addEventListener('DOMContentLoaded', function () {
    createChart(document.getElementById('chart1').getContext('2d'), 1, getKeywordsList, 'Rating');
    createChart(document.getElementById('chart2').getContext('2d'), 2, getKeywordsList, 'Rating');
    createChart(document.getElementById('chart3').getContext('2d'), 3, getKeywordsList, 'Rating');
    createChart(document.getElementById('chart4').getContext('2d'), 4, getKeywordsList, 'Rating');
    createChart(document.getElementById('chart5').getContext('2d'), 5, getKeywordsList, 'Rating');
    createChart(document.getElementById('chart6').getContext('2d'), 1, getTwoKeywordsList, 'Two Rating');
    createChart(document.getElementById('chart7').getContext('2d'), 2, getTwoKeywordsList, 'Two Rating');
    createChart(document.getElementById('chart8').getContext('2d'), 3, getTwoKeywordsList, 'Two Rating');
    createChart(document.getElementById('chart9').getContext('2d'), 4, getTwoKeywordsList, 'Two Rating');
    createChart(document.getElementById('chart10').getContext('2d'), 5, getTwoKeywordsList, 'Two Rating');
});
