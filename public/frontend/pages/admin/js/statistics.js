document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        showNotification('You need to log in first.', 'error');
        window.location.href = 'http://localhost/eco-responsable/public/frontend/pages/login.html';
        return;
    }

    // Fetch global statistics
    const statsRes = await fetch('http://localhost:3000/api/report/global', {
        headers: {
            'x-auth-token': token
        }
    });

    if (statsRes.status === 200) {
        const stats = await statsRes.json();
        document.getElementById('total-users').textContent = stats.totalUsers;
        document.getElementById('total-weight').textContent = parseInt(stats.totalWeight) + "Kg";
        document.getElementById('total-profits').textContent = stats.totalAccumulation + " CDF";
    } else {
        showNotification('Failed to load global statistics.', 'error');
    }

   // Fetch statistics by commune
   const communeStatsRes = await fetch('http://localhost:3000/api/report/commune', {
        headers: {
            'x-auth-token': token
        }
    });

    if (communeStatsRes.status === 200) {
        const communeStats = await communeStatsRes.json();
        const communesStatsBody = document.getElementById('communes-stats-body');
        communesStatsBody.innerHTML = '';

        // Append each commune's stats to the table
        communeStats.forEach(stat => {
            const statRow = document.createElement('tr');
            statRow.innerHTML = `
                <td class="border p-4">${stat.commune}</td>
                <td class="border p-4">${stat.totalUsers}</td>
                <td class="border p-4">${stat.totalWeight}Kg</td>
                <td class="border p-4">${stat.totalProfits} CDF</td>
            `;
            communesStatsBody.appendChild(statRow);
        });
    } else {
        showNotification('Failed to load commune statistics.', 'error');
    }

//Update statistics
try {
const updateRes = await fetch('http://localhost:3000/api/report/update-statistics', {
method: 'POST',
headers: {
    'x-auth-token': token
    }
});

if (updateRes.status == 200) {
    showNotification('No changes in statistics.', 'success');
} else if (updateRes.status == 201) {
    showNotification('Statistics updated successfully.', 'success');
} else {
    showNotification('Failed to update statistics.', 'error');
    return;
}
} catch (error) {
    console.error('Error:', error);
}
    

//fecth statistics for graph
    const res = await fetch('http://localhost:3000/api/report/statistics', {
    headers: {
        'x-auth-token': token
    }
});

if (res.status !== 200) {
    showNotification('Failed to load statistics.', 'error');
    return;
}

const data = await res.json();
const dates = data.map(entry => entry.date);
const bottlesWeight = data.map(entry => entry.bottlesWeight);
const participants = data.map(entry => entry.participants);

// Graphique pour l'évolution du poids des bouteilles collectées
const ctx1 = document.getElementById('bottlesWeightChart').getContext('2d');
new Chart(ctx1, {
    type: 'line',
    data: {
        labels: dates,
        datasets: [{
            label: 'Poids des bouteilles collectées (kg)',
            data: bottlesWeight,
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderWidth: 1,
            fill: true
        }]
    },
    options: {
        responsive: true,
        scales: {
            x: {
                display: true,
                title: {
                    display: true,
                    text: 'Date'
                }
            },
            y: {
                display: true,
                title: {
                    display: true,
                    text: 'Poids (kg)'
                }
            }
        }
    }
});

// Graphique pour l'évolution du nombre de participants
const ctx2 = document.getElementById('participantsChart').getContext('2d');
new Chart(ctx2, {
    type: 'bar',
    data: {
        labels: dates,
        datasets: [{
            label: 'Nombre de participants',
            data: participants,
            borderColor: 'rgba(153, 102, 255, 1)',
            backgroundColor: 'rgba(153, 102, 255, 0.2)',
            borderWidth: 1
        }]
    },
    options: {
        responsive: true,
        scales: {
            x: {
                display: true,
                title: {
                    display: true,
                    text: 'Date'
                }
            },
            y: {
                display: true,
                title: {
                    display: true,
                    text: 'Nombre de participants'
                }
            }
        }
    }
});

 // Fetch data for the chart
 const Res = await fetch('http://localhost:3000/api/report/commune', {
        headers: {
            'x-auth-token': token
        }
    });

    if (Res.status === 200) {
        const stats = await Res.json();
        const communes = stats.map(stat => stat.commune);
        const weights = stats.map(stat => stat.totalWeight);

        // Create the chart
        const ctx = document.getElementById('communeChart').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: communes,
                datasets: [{
                    label: 'Poids des bouteilles collectées (Kg)',
                    data: weights,
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    } else {
        showNotification('Failed to load statistics.', 'error');
    };

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