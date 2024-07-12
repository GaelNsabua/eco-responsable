document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        showNotification('You need to log in first.', 'error');
        window.location.href = 'login.html';
        return;
    }

    // Fetch score adjustment history
    const resAdjustments = await fetch('http://localhost:3000/api/history/adjustments', {
        headers: {
            'x-auth-token': token
        }
    });

    if (resAdjustments.status !== 200) {
        showNotification('Failed to load score adjustment history.', 'error');
        return;
    }

    const adjustments = await resAdjustments.json();
    const adjustmentsTableBody = document.getElementById('adjustments-table-body');
    adjustmentsTableBody.innerHTML = '';

    adjustments.forEach(adjustment => {
        const adjustmentRow = document.createElement('tr');
        adjustmentRow.innerHTML = `
            <td class="border p-4">${new Date(adjustment.adjustmentDate).toLocaleString()}</td>
            <td class="border p-4">${adjustment.userId.username}</td>
            <td class="border p-4">${adjustment.adminId.username}</td>
            <td class="border p-4">${adjustment.previousBottlesCollectedWeight}Kg</td>
            <td class="border p-4">${adjustment.newBottlesCollectedWeight}Kg</td>
            <td class="border p-4">${adjustment.previouswithdrawal}</td>
            <td class="border p-4">${adjustment.newWithdrawal}</td>
            <td class="border p-4">${adjustment.previousprofit}</td>
            <td class="border p-4">${adjustment.newprofit}</td>
            <td class="border p-4">${adjustment.previousaccumulation}</td>
            <td class="border p-4">${adjustment.newaccumulation}</td>
        `;
        adjustmentsTableBody.appendChild(adjustmentRow);
    });

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