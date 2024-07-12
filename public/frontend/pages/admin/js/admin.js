document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        showNotification('You need to log in first.', 'error');
        window.location.href = 'login.html';
        return;
    }

    const res = await fetch('http://localhost:3000/api/users', {
        headers: {
            'x-auth-token': token
        }
    });

    if (res.status !== 200) {
        showNotification('Failed to load users.', 'error');
        window.location.href = 'http://localhost/eco-responsable/public/frontend/';
        return;
    }

    const users = await res.json();
    const usersTableBody = document.getElementById('users-table-body');
    usersTableBody.innerHTML = '';

    // Function to render users in the table
    function renderUsers(filteredUsers) {
        usersTableBody.innerHTML = '';
        filteredUsers.forEach(user => {
            if (!user.isAdmin) {
                const userRow = document.createElement('tr');
                userRow.innerHTML = `
                    <td class="border p-4">${user.username}</td>
                    <td class="border p-4">${user.commune}</td>
                    <td class="border p-4 text-center">${user.BottlesCollectedWeight}Kg</td>
                    <td class="border p-4">${user.profit}</td>
                    <td class="border p-4">${user.withdrawal}</td>
                    <td class="border p-4">${user.accumulation}</td>
                    <td class="border p-4">
                        <button data-user-id="${user._id}" class="bg-blue-500 text-white px-4 py-2 rounded-md edit-btn">Edit</button>
                    </td>
                `;
                usersTableBody.appendChild(userRow);
            }
        });
        addEditEventListeners();
    }

    // Initial render
    renderUsers(users);

    // Filter users based on search input
    document.getElementById('search-input').addEventListener('input', (e) => {
    const searchQuery = e.target.value.toLowerCase();
    const filteredUsers = users.filter(user => {
    return (user.username ? user.username.toLowerCase().includes(searchQuery) : false) || 
           (user.commune ? user.commune.toLowerCase().includes(searchQuery) : false);
    });
    renderUsers(filteredUsers);
    });

    // Handle edit button click
    function addEditEventListeners() {
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const userId = e.target.getAttribute('data-user-id');
                document.getElementById('edit-user-id').value = userId;
                document.getElementById('edit-form-modal').classList.remove('hidden');
            });
        });
    }

    // Handle form submission
    document.getElementById('edit-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const userId = document.getElementById('edit-user-id').value;
        const BottlesCollectedWeight = document.getElementById('edit-bottles-collected-weight').value;
        const userWithdrawal = document.getElementById('edit-user-withdrawal').value;

        if (BottlesCollectedWeight !== null && userWithdrawal !== null) {
            const res = await fetch('http://localhost:3000/api/users/update-score', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({ userId, BottlesCollectedWeight: parseFloat(BottlesCollectedWeight), userWithdrawal: parseInt(userWithdrawal) })
            });

            if (res.status === 200) {
                showNotification('Score updated successfully', 'success');
                setTimeout(() => {
                    location.reload();
                }, 3000);
            } else {
                const data = await res.json();
                showNotification('Error: ' + data.error, 'error');
            }
        }
    });

    // Handle cancel button click
    document.getElementById('cancel-edit-btn').addEventListener('click', () => {
        document.getElementById('edit-form-modal').classList.add('hidden');
    });

    // Handle logout button click
    document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.href = 'index.html';
    });

    // Function to show notification
    function showNotification(message, type) {
        const notificationContainer = document.getElementById('notification-container');
        const notification = document.createElement('div');
        notification.className = `p-4 mb-4 rounded-lg shadow-md ${type === 'error' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`;
        notification.textContent = message;
        notificationContainer.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
});