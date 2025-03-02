document.addEventListener('DOMContentLoaded', function() {
    const expenses = JSON.parse(localStorage.getItem('expenses')) || [];
    const weeklyTotalElement = document.getElementById('weekly-total');
    const monthlyTotalElement = document.getElementById('monthly-total');
    const yearlyTotalElement = document.getElementById('yearly-total');
    const summaryPieChart = document.getElementById('summaryPieChart').getContext('2d');
    const summaryBarChart = document.getElementById('summaryBarChart').getContext('2d');

    const weeklyTotal = calculateTotal(expenses, 'week');
    const monthlyTotal = calculateTotal(expenses, 'month');
    const yearlyTotal = calculateTotal(expenses, 'year');

    weeklyTotalElement.innerText = weeklyTotal;
    monthlyTotalElement.innerText = monthlyTotal;
    yearlyTotalElement.innerText = yearlyTotal;

    function calculateTotal(expenses, period) {
        const now = new Date();
        return expenses.reduce((total, expense) => {
            const expenseDate = new Date(expense.date);
            if (period === 'week' && expenseDate >= new Date(now.setDate(now.getDate() - now.getDay()))) {
                return total + expense.amount;
            } else if (period === 'month' && expenseDate.getMonth() === now.getMonth() && expenseDate.getFullYear() === now.getFullYear()) {
                return total + expense.amount;
            } else if (period === 'year' && expenseDate.getFullYear() === now.getFullYear()) {
                return total + expense.amount;
            }
            return total;
        }, 0);
    }

    function updateCharts() {
        const categoryData = getCategoryData(expenses);
        const labels = Object.keys(categoryData);
        const data = Object.values(categoryData);

        new Chart(summaryPieChart, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Expenses by Category',
                    data: data,
                    backgroundColor: ['#FFB3BA', '#FFDFBA', '#FFFFBA', '#BAFFB3', '#BAE1FF'],
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Expense Distribution'
                    }
                }
            }
        });

        new Chart(summaryBarChart, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Amount Spent',
                    data: data,
                    backgroundColor: '#BAFFB3',
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Expenses Overview'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    function getCategoryData(expenses) {
        const categoryData = {};
        for (const expense of expenses) {
            if (!categoryData[expense.category]) {
                categoryData[expense.category] = 0;
            }
            categoryData[expense.category] += expense.amount;
        }
        return categoryData;
    }

    updateCharts();

    document.getElementById('back-btn').addEventListener('click', function() {
        window.location.href = 'index.html';
    });
});