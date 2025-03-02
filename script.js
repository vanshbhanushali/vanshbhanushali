let expenses = [];
let totalAmount = 0;
let budgetAmount = 0;
let walletAmount = 0;
let pieChart, barChart;
let editingIndex = null;

const categorySelect = document.getElementById('category-select');
const customCategoryInput = document.getElementById('custom-category-input');
const amountInput = document.getElementById('amount-input');
const dateInput = document.getElementById('date-input');
const notesInput = document.getElementById('notes-input');
const tagsInput = document.getElementById('tags-input');
const addBtn = document.getElementById('add-btn');
const budgetInput = document.getElementById('budget-input');
const walletInput = document.getElementById('wallet-input');
const addWalletBtn = document.getElementById('add-wallet-btn');
const expensesTableBody = document.getElementById('expense-table-body');
const totalAmountCell = document.getElementById('total-amount');
const remainingBudgetCell = document.getElementById('remaining-budget');
const walletAmountCell = document.getElementById('wallet-amount');
const showSummaryBtn = document.getElementById('show-summary-btn');
const recurringCheckbox = document.getElementById('recurring-checkbox');
const recurringFrequency = document.getElementById('recurring-frequency');
const filterBtn = document.getElementById('filter-btn');
const filterDialog = document.getElementById('filter-dialog');
const closeFilterBtn = document.getElementById('close-filter');
const applyFilterBtn = document.getElementById('apply-filter');
const filterType = document.getElementById('filter-type');
const groupPaymentBtn = document.getElementById('group-payment-btn');
const groupPaymentDialog = document.getElementById('group-payment-dialog');
const closeGroupPaymentBtn = document.getElementById('close-group-payment');
const sendMoneyBtn = document.getElementById('send-money-btn');
const requestMoneyBtn = document.getElementById('request-money-btn');
const contactSelect = document.getElementById('contact-select');
const groupPaymentAmountInput = document.getElementById('group-payment-amount');

const BUDGET_ALERT_THRESHOLD = 0.8;
const BUDGET_EXCEED_THRESHOLD = 1;

budgetInput.addEventListener('change', function () {
    budgetAmount = Number(budgetInput.value);
    updateRemainingBudget();
});

addWalletBtn.addEventListener('click', function () {
    const amount = Number(walletInput.value);
    if (isNaN(amount) || amount < 0) {
        alert('Please enter a valid amount to add to the wallet.');
        return;
    }
    walletAmount += amount;
    walletAmountCell.textContent = walletAmount;
    walletInput.value = '';
});

addBtn.addEventListener('click', function () {
    const category = customCategoryInput.value.trim() || categorySelect.value;
    const amount = Number(amountInput.value);
    const date = new Date(dateInput.value);
    const notes = notesInput.value.trim();
    const tags = tagsInput.value.split(',').map(tag => tag.trim()).filter(tag => tag);

    if (category === '') {
        alert('Please select or enter a category');
        return;
    }
    if (isNaN(amount) || amount <= 0) {
        alert('Please enter a valid amount');
        return;
    }
    if (isNaN(date.getTime())) {
        alert('Please select a valid date');
        return;
    }

    if (amount > walletAmount) {
        alert('Not enough money in the wallet!');
        return;
    }

    walletAmount -= amount;
    walletAmountCell.textContent = walletAmount;

    if (editingIndex !== null) {
        expenses[editingIndex] = { category, amount, date, notes, tags, recurring: recurringCheckbox.checked, frequency: recurringFrequency.value };
        editingIndex = null;
    } else {
        expenses.push({ category, amount, date, notes, tags, recurring: recurringCheckbox.checked, frequency: recurringFrequency.value });
    }

    totalAmount += amount;
    totalAmountCell.textContent = totalAmount;
    updateRemainingBudget();
    updateExpenseTable();
    updateCharts();
    clearInputs();
    checkBudgetAlerts();
});

function clearInputs() {
    customCategoryInput.value = '';
    amountInput.value = '';
    dateInput.value = '';
    notesInput.value = '';
    tagsInput.value = '';
    recurringCheckbox.checked = false;
    recurringFrequency.style.display = 'none';
}

recurringCheckbox.addEventListener('change', function () {
    recurringFrequency.style.display = recurringCheckbox.checked ? 'block' : 'none';
});

function updateRemainingBudget() {
    const remainingBudget = budgetAmount - totalAmount;
    remainingBudgetCell.textContent = remainingBudget >= 0 ? remainingBudget : 'Over Budget';
}

function checkBudgetAlerts() {
    const budgetAlertThreshold = budgetAmount * BUDGET_ALERT_THRESHOLD;
    const budgetExceedThreshold = budgetAmount * BUDGET_EXCEED_THRESHOLD;

    if (totalAmount >= budgetExceedThreshold) {
        alert('You have exceeded your budget!');
    } else if (totalAmount >= budgetAlertThreshold) {
        alert('Warning: You are approaching your budget limit!');
    }
}

function updateExpenseTable() {
    expensesTableBody.innerHTML = '';
    for (let i = 0; i < expenses.length; i++) {
        const expense = expenses[i];
        const newRow = expensesTableBody.insertRow();
        const categoryCell = newRow.insertCell();
        const amountCell = newRow.insertCell();
        const dateCell = newRow.insertCell();
        const notesCell = newRow.insertCell();
        const tagsCell = newRow.insertCell();
        const actionsCell = newRow.insertCell();
        const deleteBtn = document.createElement('button');
        const editBtn = document.createElement('button');

        deleteBtn.textContent = 'Delete';
        deleteBtn.classList.add('delete-btn');
        deleteBtn.addEventListener('click', function () {
            totalAmount -= expense.amount;
            expenses.splice(i, 1);
            totalAmountCell.textContent = totalAmount;
            updateRemainingBudget();
            updateExpenseTable();
            updateCharts();
        });

        editBtn.textContent = 'Edit';
        editBtn.classList.add('edit-btn');
        editBtn.addEventListener('click', function () {
            customCategoryInput.value = expense.category;
            amountInput.value = expense.amount;
            dateInput.value = expense.date.toISOString().split('T')[0];
            notesInput.value = expense.notes;
            tagsInput.value = expense.tags.join(', ');
            recurringCheckbox.checked = expense.recurring;
            recurringFrequency.value = expense.frequency;
            editingIndex = i;
        });

        categoryCell.textContent = expense.category;
        amountCell.textContent = expense.amount;
        dateCell.textContent = expense.date.toLocaleDateString();
        notesCell.textContent = expense.notes;
        tagsCell.textContent = expense.tags.join(', ');
        actionsCell.appendChild(editBtn);
        actionsCell.appendChild(deleteBtn);
    }
}

function getCategoryData() {
    const categoryData = {};
    for (const expense of expenses) {
        if (!categoryData[expense.category]) {
            categoryData[expense.category] = 0;
        }
        categoryData[expense.category] += expense.amount;
    }
    return categoryData;
}

function updateCharts() {
    const categoryData = getCategoryData();
    const labels = Object.keys(categoryData);
    const data = Object.values(categoryData);

    if (pieChart) {
        pieChart.destroy();
    }
    if (barChart) {
        barChart.destroy();
    }

    const pieCtx = document.getElementById('pieChart').getContext('2d');
    pieChart = new Chart(pieCtx, {
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

    const barCtx = document.getElementById('barChart').getContext('2d');
    barChart = new Chart(barCtx, {
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

// Filter Dialog
filterBtn.addEventListener('click', function () {
    filterDialog.style.display = 'block';
});

closeFilterBtn.addEventListener('click', function () {
    filterDialog.style.display = 'none';
});

applyFilterBtn.addEventListener('click', function () {
    const filterValue = filterType.value;
    const filteredExpenses = filterExpenses(filterValue);
    updateFilteredExpenseTable(filteredExpenses);
    filterDialog.style.display = 'none';
});

function filterExpenses(filterType) {
    const now = new Date();
    return expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        if (filterType === 'week') {
            const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
            return expenseDate >= weekStart;
        } else if (filterType === 'month') {
            return expenseDate.getMonth() === now.getMonth() && expenseDate.getFullYear() === now.getFullYear();
        } else if (filterType === 'year') {
            return expenseDate.getFullYear() === now.getFullYear();
        }
        return false;
    });
}

function updateFilteredExpenseTable(filteredExpenses) {
    expensesTableBody.innerHTML = '';
    let totalFiltered = 0;
    filteredExpenses.forEach(expense => {
        const newRow = expensesTableBody.insertRow();
        const categoryCell = newRow.insertCell();
        const amountCell = newRow.insertCell();
        const dateCell = newRow.insertCell();
        const notesCell = newRow.insertCell();
        const tagsCell = newRow.insertCell();
        const actionsCell = newRow.insertCell();
        const deleteBtn = document.createElement('button');
        const editBtn = document.createElement('button');

        deleteBtn.textContent = 'Delete';
        deleteBtn.classList.add('delete-btn');
        deleteBtn.addEventListener('click', function () {
            totalFiltered -= expense.amount;
            filteredExpenses.splice(filteredExpenses.indexOf(expense), 1);
            updateFilteredExpenseTable(filteredExpenses);
        });

        editBtn.textContent = 'Edit';
        editBtn.classList.add('edit-btn');
        editBtn.addEventListener('click', function () {
            customCategoryInput.value = expense.category;
            amountInput.value = expense.amount;
            dateInput.value = expense.date.toISOString().split('T')[0];
            notesInput.value = expense.notes;
            tagsInput.value = expense.tags.join(', ');
            recurringCheckbox.checked = expense.recurring;
            recurringFrequency.value = expense.frequency;
            editingIndex = expenses.indexOf(expense);
        });

        categoryCell.textContent = expense.category;
        amountCell.textContent = expense.amount;
        dateCell.textContent = expense.date.toLocaleDateString();
        notesCell.textContent = expense.notes;
        tagsCell.textContent = expense.tags.join(', ');
        actionsCell.appendChild(editBtn);
        actionsCell.appendChild(deleteBtn);
        totalFiltered += expense.amount;
    });
    totalAmountCell.textContent = totalFiltered;
}

// Group Payment Dialog
groupPaymentBtn.addEventListener('click', function () {
    groupPaymentDialog.style.display = 'block';
});

closeGroupPaymentBtn.addEventListener('click', function () {
    groupPaymentDialog.style.display = 'none';
});

sendMoneyBtn.addEventListener('click', function () {
    const amount = Number(groupPaymentAmountInput.value);
    if (isNaN(amount) || amount <= 0) {
        alert('Please enter a valid amount to send.');
        return;
    }
    const contact = contactSelect.value;
    alert(`Sent $${amount} to ${contact}`);
    groupPaymentDialog.style.display = 'none';
    groupPaymentAmountInput.value = '';
});

requestMoneyBtn.addEventListener('click', function () {
    const amount = Number(groupPaymentAmountInput.value);
    if (isNaN(amount) || amount <= 0) {
        alert('Please enter a valid amount to request.');
        return;
    }
    const contact = contactSelect.value;
    alert(`Requested $${amount} from ${contact}`);
    groupPaymentDialog.style.display = 'none';
    groupPaymentAmountInput.value = '';
});