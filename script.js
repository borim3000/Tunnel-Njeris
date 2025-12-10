async function loadComboData() {
    const url = "/etl/unload.php";

    try {
        const response = await fetch(url);
        const result = await response.json();

        if (!result.data || result.data.length === 0) {
            document.getElementById("status").innerText = "Keine Daten verfügbar.";
            return;
        }

        // filter. letzte 7 Tage
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        const filtered = result.data.filter(entry => {
            const t = new Date(entry.timestamp); 
            return t >= sevenDaysAgo;
        });

        if (filtered.length === 0) {
            document.getElementById("status").innerText = "Keine Daten der letzten 7 Tage verfügbar.";
            return;
        } 

        //labels & werte extrahieren
        const labels = filtered.map(e => e.timestamp);
        const cyclists = filtered.map(e => e.cyclists);
        const temperature = filtered.map(e => e.temperature);

        const ctx = document.getElementById("weeklyChart").getContext("2d");

        // mixed chart

        new Chart(ctx, {
            data: {
                labels: labels,
                datasets: [
                    //balken: temperatur
                    {
                        type: "bar",
                        label: "Temperatur (°C)",
                        data: temperature,
                        yAxisID: "y2",
                        borderWidth: 1
                    },
                    // linie: Cyclists
                    {
                        type: "line",
                        label: "Cyclists",
                        data: cyclists,
                        yAxisID: "y1",
                        borderwidth: 2, 
                        tension: 0.2,
                        borderColor: '#0F05A0',
                        backgroundColor: '#0F05A0'
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    legend:{
                        labels:{
                            color: '#333'
                        }
                    }
                },
                layout:{
                    padding:{
                        left: 10,
                        right: 10,
                        top: 10,
                        bottom: 10
                    }
                },
                scales: {
                    y1: {
                        type: "linear",
                        position: "left",
                        title: { text: "Cyclists", display: true },
                    },
                    y2: {
                        type: "linear",
                        position: "right",
                        title: { text: "Temperature (°C)", display: true },
                        grid: { drawOnChartArea: false },
                        min: -15
                    },
                    x: {
                        ticks: {
                            maxRotation: 90,
                            minRotation: 45
                        }
                    }
                }
            }
        });

        const chartCanvas = document.getElementById("weeklyChart");
        if (chartCanvas) {
            chartCanvas.style.backgroundColor = '#EFF5FF';
        }

        document.getElementById("status").innerText = "Daten erfolgreich geladen.";

    } catch (err) {
        console.error(err);
        document.getElementById("status").innerText = "Fehler beim Laden der Daten.";
    }
}

loadComboData();
 