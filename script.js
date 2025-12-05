const DEFAULT_USER = {
    username: "Manish Varma",
    password: "admin123"
};


function getCurrentUser() {
    return localStorage.getItem("currentUser");
}

function setCurrentUser(name) {
    if (name) {
        localStorage.setItem("currentUser", name);
    } else {
        localStorage.removeItem("currentUser");
    }
}

function loadExpenses() {
    const data = localStorage.getItem("expenses");
    if (!data) {
        return [];
    }
    try {
        const parsed = JSON.parse(data);
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
        console.log("Error parsing expenses:", e);
        return [];
    }
}

function saveExpenses(list) {
    localStorage.setItem("expenses", JSON.stringify(list));
}

function checkDarkMode() {
    var isDark = localStorage.getItem("darkMode");
    if(isDark == "true") {
        document.body.classList.add("dark-mode");
    }
}

//  toggle dark mode
function toggleDarkMode() {
      document.body.classList.toggle("dark-mode");
    var isDark = document.body.classList.contains("dark-mode");
    localStorage.setItem("darkMode", isDark);
}

// export to CSV file
function exportToCSV(expenses, userName) {
    var userExpenses = [];
    for(var i = 0; i < expenses.length; i++) {
        if(expenses[i].user == userName) {
            userExpenses.push(expenses[i]);
        }
    }
    
    if(userExpenses.length == 0) {
        alert("No expenses to export!");
        return;
    }
    
    //  CSV content
    var csv = "Description,Amount,Date\n";
    for(var i = 0; i < userExpenses.length; i++) {
        var exp = userExpenses[i];
        csv += exp.description + "," + exp.amount + "," + exp.date + "\n";
    }
    
    // download CSV 
    var blob = new Blob([csv], {type: "text/csv"});
    var url = window.URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "Manish.csv";
    a.click();
}

function escapeText(text) {
    var div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}


function initLoginPage() {
    const form = document.getElementById("loginForm");
    if (!form) return;
    
    checkDarkMode();

    if (getCurrentUser()) {
        window.location.href = "index.html";
        return;
    }

    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");
    const errorBox = document.getElementById("errorMessage");

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        const enteredUser = usernameInput.value.trim();
        const enteredPass = passwordInput.value.trim();

        if (
            enteredUser === DEFAULT_USER.username &&
            enteredPass === DEFAULT_USER.password
        ) {
            setCurrentUser(enteredUser);
            window.location.href = "index.html";
        } else {
            errorBox.textContent = "Invalid username or password.";
            errorBox.style.display = "block";

            setTimeout(function () {
                errorBox.style.display = "none";
            }, 2500);
        }
    });
}


function initExpensePage() {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        window.location.href = "login.html";
        return;
    }
    
    checkDarkMode();

    const expenseForm = document.getElementById("expenseForm");
    if (!expenseForm) return; // safety

    const descInput = document.getElementById("description");
    const amountInput = document.getElementById("amount");
    const dateInput = document.getElementById("date");
    const expenseListBox = document.getElementById("expenseList");
    const totalAmountBox = document.getElementById("totalAmount");
    const logoutBtn = document.getElementById("logoutBtn");
    const clearAllBtn = document.getElementById("clearAllBtn");
    const darkModeBtn = document.getElementById("darkModeBtn");
    const exportBtn = document.getElementById("exportBtn");

    let allExpenses = loadExpenses();

    function showExpenses() {
        const userExpenses = allExpenses.filter(function (item) {
            return item.user === currentUser;
        });

        if (userExpenses.length === 0) {
            expenseListBox.innerHTML =
                '<p class="empty-state">No expenses added yet. Start tracking your spending!</p>';
            return;
        }

        let html = "";
        userExpenses.forEach(function (exp) {
            html += `
                <div class="expense-item">
                    <div class="expense-info">
                        <div class="expense-description">${escapeText(exp.description)}</div>
                        <div class="expense-date">${exp.date}</div>
                    </div>
                    <div class="expense-actions">
                        <div class="expense-amount">Rs. ${exp.amount.toFixed(2)}</div>
                        <button class="btn-delete" data-id="${exp.id}" title="Delete expense">
                            🗑️
                        </button>
                    </div>
                </div>
            `;
        });

        expenseListBox.innerHTML = html;
    }

    function updateTotal() {
        const userExpenses = allExpenses.filter(function (item) {
            return item.user === currentUser;
        });

        let total = 0;
        userExpenses.forEach(function (exp) {
            total += exp.amount;
        });

        totalAmountBox.textContent = "Rs. " + total.toFixed(2);
    }

    function saveAndRefresh() {
        saveExpenses(allExpenses);
        showExpenses();
        updateTotal();
    }

    expenseForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const desc = descInput.value.trim();
        const amount = parseFloat(amountInput.value);
        const dateValue = dateInput.value; 

        if (!desc || isNaN(amount) || amount <= 0 || !dateValue) {
            alert("Please enter description, amount and date.");
            return;
        }

        const newExpense = {
            id: Date.now(),
            description: desc,
            amount: amount,
            date: dateValue, 
            user: currentUser
        };

        allExpenses.push(newExpense);
        saveAndRefresh();

        expenseForm.reset();
        descInput.focus();
    });

    expenseListBox.addEventListener("click", function (event) {
        const target = event.target;

        if (target.classList.contains("btn-delete")) {
            const idStr = target.getAttribute("data-id");
            const id = parseInt(idStr, 10);

            allExpenses = allExpenses.filter(function (exp) {
                return exp.id !== id;
            });

            saveAndRefresh();
        }
    });

    clearAllBtn.addEventListener("click", function () {
        if (!confirm("Are you sure you want to delete all expenses?")) {
            return;
        }

        allExpenses = allExpenses.filter(function (exp) {
            return exp.user !== currentUser;
        });

        saveAndRefresh();
    });

    logoutBtn.addEventListener("click", function () {
        setCurrentUser(null);
        window.location.href = "login.html";
    });
    
    darkModeBtn.addEventListener("click", function() {
        toggleDarkMode();
    });
    
    exportBtn.addEventListener("click", function() {
        exportToCSV(allExpenses, currentUser);
    });

    showExpenses();
    updateTotal();
}


document.addEventListener("DOMContentLoaded", function () {
    if (document.getElementById("loginForm")) {
        initLoginPage();
    }
    if (document.getElementById("expenseForm")) {
        initExpensePage();
    }
});

