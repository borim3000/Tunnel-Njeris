async function loadDashboard() {
    const url = "/etl/unload.php";

    try {
        const response = await fetch(url);
        const result = await response.json();

        if (!result.data || result.data.length === 0) {
            console.warn("Keine Daten verfügbar.");
            return;
    }

    // reusable helper function
    function drawChart(canvasId, chartData, xTickCallback, footerText) {

        //1 check if element exists and has data
        const canvas = document.getElementById(canvasId);
        if (!canvas || chartData.length === 0) return;

        //2 extract data
        const labels = chartData.map(e => e.timestamp);
        const cyclists = chartData.map(e => e.cyclists);
        const temperature = chartData.map(e => e.temperature);
        const precipitation = chartData.map(e => e.precipitation);

        //3 calculate axis limits, dynamic buffer
        const maxCyclists = Math.max(...cyclists);
        const cyclistAxisMax = Math.ceil(maxCyclists * 1.1);

        const minCyclists = Math.min(...cyclists);
        const cyclistAxisMin = Math.max(0, minCyclists - 10);

        const maxTemp = Math.max(...temperature);
        const tempAxisMax = Math.ceil(maxTemp * 1.2);

        const maxPrecip = Math.max(...precipitation);
        const precipAxisMax = Math.max(5, maxPrecip * 1.2);

        //4 create chart
        const ctx = canvas.getContext("2d");

        //destroy existing chart instance if exists to prevent glitches
        const existingChart = Chart.getChart(canvas);
        if (existingChart)  existingChart.destroy();

        new Chart(ctx, {
            data: {
                labels: labels,
                datasets: [
                    { // precipitation dataset
                        type : "bar",
                        label: "Niederschlag (mm)",
                        data: precipitation,
                        yAxisID: "y3", //linked to new left axis
                        backgroundColor:  'rgba(255, 99, 132, 0.7)', // Red
                        borderColor: 'rgba(255, 99, 132, 1)',
                        borderWidth: 1,
                        order: 3 //drawn below other datasets
                    },

                    { // temperature dataset
                        type : "line",
                        label: "Temperatur (°C)",
                        data: temperature,
                        yAxisID: "y2",
                        borderWidth: 2,
                        pointRadius: 0,
                        tension: 0.4,
                        borderColor: 'rgba(54, 162, 235, 0.4)',
                        backgroundColor: 'transparent',
                        order: 2
                    },

                    { // cyclists dataset
                        type: "line",
                        label: "Anzahl Velofahrer",
                        data: cyclists,
                        yAxisID: "y1",
                        borderWidth: 2, 
                        tension: 0.2,
                        borderColor: '#0F05A0',
                        backgroundColor: '#0F05A0',
                        order: 1 // draw on top
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: { 
                    legend: { labels: { color: '#333' } },
                    title: {
                        display: !!footerText, // only show if footerText is provided
                        text: footerText,
                        position: 'bottom',
                        align: 'start',
                        color: '#666',
                        font: { 
                            size: 12,
                            style: 'italic'
                        },
                        padding: { top: 20, bottom: 0}
                    }
                },
                layout: { padding: 10 },
                scales: {
                    y1: {
                        type: "linear",
                        position: "left",
                        title: { text: "Anzahl Velofahrer", display: true },
                        max: cyclistAxisMax,
                        min: cyclistAxisMin,
                        ticks: { color: '#0F05A0' }
                    },
                    y2: {
                        type: "linear",
                        position: "right",
                        title: { text: "Temperatur (°C)", display: true },
                        max: tempAxisMax,
                        min: -5,
                        ticks: { color: 'rgba(54, 162, 235, 1)' },
                        grid: { 
                            drawOnChartArea: true,
                            color: function(context) {
                                if (context.tick.value === 0) {
                                    return 'rgba(54, 162, 235, 1)'; //highlight zero line
                                }
                                //otherwise, make it invisible
                                return 'transparent';
                            },
                            lineWidth: function(context) {
                                if (context.tick.value === 0) {
                                    return 2; //thicker line for zero
                                }
                                return 1;
                            }
                        }
                    },
                    y3: {
                        type: "linear",
                        position: "left",
                        title: { text: "Niederschlag (mm)", display: true },
                        max: precipAxisMax,
                        min: 0,
                        grid: { drawOnChartArea: false },
                        ticks: { color: 'rgba(255, 99, 132, 1)' }
                    },
                    x: {
                        ticks: {
                            maxRotation: 0,
                            autoSkip: false,
                            callback: xTickCallback
                        },
                        grid: { drawOnChartArea: true }
                    }
                }
            }
        });
     
        //5 apply background styles
        canvas.style.backgroundColor = '#EFF5FF';
        canvas.style.borderRadius = '8px';
    }

    // logic 1: weekly chart
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const weeklyData = result.data.filter(entry => new Date(entry.timestamp) >= sevenDaysAgo);
    
    drawChart("weeklyChart", weeklyData, function(value) {
        //weekly logic: show date at midnight, time at noon
        const date = new Date(this.getLabelForValue(value));
        const hours = date.getHours();
        if (hours === 0) return date.toLocaleDateString('de-DE', { hour:'numeric', day: '2-digit', month: 'short'});
        if (hours === 12) return "12 Uhr";
        return null;
    }, null); // pass null for footerText
    
    // locic 2: daily chart - get the last 24 entries from the database (weil daten immer 3 tage alt sind)
    const dailyData = result.data.slice(-24);

    // get the date of the newest datapoint
    const lastEntryDate = new Date(dailyData[dailyData.length -1].timestamp);
    const dateString = lastEntryDate.toLocaleDateString('de-DE', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });

    // pass this string as the 4th argument
    drawChart("dailyChart", dailyData, function(value) {
        //daily logic: show every 3rd hour
        const date = new Date(this.getLabelForValue(value));
        const hours = date.getHours();

        if (hours % 3 === 0) {
            return date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
        }
        return null;
    }, "Datenstand: " + dateString);

    //3 logic: rain vs no rain comparison, last 3  months
    //   1: buckets for calculation
    let rainSum = 0;
    let rainHours = 0;
    let drySum = 0;
    let dryHours = 0;

    //   2: loop through data of 92 days 
    result.data.forEach(entry => {
        const precip = parseFloat(entry.precipitation);
        const count = parseInt(entry.cyclists);

        //check if data ist valid
        if (isNaN(precip) || isNaN(count)) return;

        if (precip > 0) {
            //it rained: add to rain bucket
            rainSum += count;
            rainHours++;
        } else {
            //no rain: add to dry bucket
            drySum += count;
            dryHours++;
        }
    });

    //   3: calculate averages
    const avgRain = rainHours > 0 ? Math.round(rainSum / rainHours) : 0;
    const avgDry = dryHours > 0 ? Math.round(drySum / dryHours) : 0;

    // 4 draw comparison chart
    const ctxComparison = document.getElementById("rainBarChart").getContext("2d");

    new Chart(ctxComparison, {
        type: "bar",
        data: {
            labels: ['Kein Regen (Trocken)', 'Bei Regen'],
            datasets: [{
                label: 'Durchschnittliche Anzahl Velofahrer pro Stunde',
                data: [avgDry, avgRain],
                backgroundColor: ['#0F05A0', 'rgba(255, 99, 132, 0.7)'],
                borderColor: ['#0F05A0', 'rgba(255, 99, 132, 1)'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false },
                title: {
                    display: true,
                    text: 'Durchschnittliche Anzahl Velofahrer pro Stunde nach Niederschlag',
                    color: '#333',
                    font: { size: 14 }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: { text: 'Anzahl Velofahrer', display: true }
                }
            }
        }
    });

    //set background style
    const rainCanvas = document.getElementById("rainBarChart");
    if (rainCanvas) {
        rainCanvas.style.backgroundColor = '#EFF5FF';
        rainCanvas.style.borderRadius = '8px';
    }

    document.getElementById("status").innerText = "Daten erfolgreich geladen.";

    } catch (err) {
        console.error(err);
        const statusEl = document.getElementById("status");
        if (statusEl) statusEl.innerText = "Fehler beim Laden der Daten.";
    }
}

loadDashboard();