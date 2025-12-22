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

        //1.1 mobile view adjustment: if scren is smaller than 600px, use radius 1 . otherwise use 2
        const isMobile = window.innerWidth < 600;
        const adaptivePointRadius = isMobile ? 1 : 2;
        //1.2 keep hitbox of points large so it is easier to use on mobile
        const adaptiveHitRadius = 15;

        //1.3 different chart window aspect ratio for mobile
        const adaptiveAspectRatio = isMobile ? 1.1 : 2.5;

        //1.4 date&time label rotation depending on screen size
        const adaptiveRotation = isMobile ? 60 : 0;

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
                        pointRadius: adaptivePointRadius,
                        pointHitRadius: adaptiveHitRadius,
                        order: 1 // draw on top
                    }
                ]
            },
            options: {
                responsive: true,

                //apply aspcet ratio for mobile vs desktop
                maintainAspectRatio: true,
                aspectRatio: adaptiveAspectRatio,

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
                            maxRotation: adaptiveRotation,
                            minRotation: adaptiveRotation,
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
    const pieCanvas = document.getElementById("rainPieChart");

    if (pieCanvas) {
        const ctxComparison = pieCanvas.getContext("2d");

        const isMobilePie = window.innerWidth < 600;

        //destroy existing chart instance if exists to prevent glitches
        const existingPie = Chart.getChart("rainPieChart");
        if (existingPie)  existingPie.destroy();

        new Chart(ctxComparison, {
            type: "doughnut",
            data: {
                labels: ['Kein Regen (Trocken)', 'Bei Regen'],
                datasets: [{
                    label: 'Durchschnittliche Anzahl Velofahrer pro Stunde',
                    data: [avgDry, avgRain],
                    backgroundColor: ['#0F05A0', 'rgba(255, 99, 132, 0.7)'],
                    borderColor: ['#0F05A0', 'rgba(255, 99, 132, 1)'],
                    borderWidth: 1,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false, //stop it from getting too big
                plugins: {
                    legend: { 
                        position: 'bottom',
                        labels: { color: '#333', padding: 20 }
                    },
                    title: {
                        display: true,
                        text: isMobilePie // adaptive for mobile view
                            ? ['Durchschnittliche Anzahl Velofahrer', 'pro Stunde nach Niederschlag']
                            : 'Durchschnittliche Anzahl Velofahrer pro Stunde nach Niederschlag',
                        color: '#333',
                        font: { size: 16 },
                        padding: { bottom: 20}
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let value = context.raw;
                                let total = avgDry + avgRain;
                                let percentage = Math.round((value / total) * 100) + "%";
                                return context.label + ": " + value + " (" + percentage + ")";
                            }
                        }
                    }
                },
                layout: { padding: 20}
            }
        });

        //set background style
        pieCanvas.style.backgroundColor = '#EFF5FF';
        pieCanvas.style.borderRadius = '8px';
        pieCanvas.style.maxHeight = '400px';
    } else {
        console.warn("Element 'rainPieChart' im HTML nicht gefunden.");
    }

    //4 logic: all-time total cyclists line chart
    const ctxAllTime = document.getElementById("allTimeChart");

    if (ctxAllTime && result.data.length > 0) {

        //1 prepare data
        const allLabels = result.data.map(e => e.timestamp);
        const allCyclists = result.data.map(e => e.cyclists);

        //2 mobile check for height adjustment
        const isMobileAllTime = window.innerWidth < 600;

        new Chart(ctxAllTime, {
            type: "line",
            data: {
                labels: allLabels,
                datasets: [{
                    label: "Anzahl Velofahrer (gesamt)",
                    data: allCyclists,
                    borderColor: '#0F05A0',
                    backgroundColor: 'rgba(15, 5, 160, 0.7)',
                    borderWidth: 1.5,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHitRadius: 20,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: isMobileAllTime ? 1.5 : 3,

                plugins: { 
                    legend: { display: false },
                    title: {
                        display: true,
                        text: 'Anzahl Velofahrer über den gesamten Messzeitraum',
                        color: '#666',
                        font: { size: 14 },
                        padding: { bottom: 15 }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            maxRotation: 0,
                            autoSkip: true,
                            maxTicksLimit: isMobileAllTime ? 5 : 12, //limit labels to keep it clean
                            callback: function(value, index, values) {
                                // show formatted date
                                const date = new Date(this.getLabelForValue(value));
                                return date.toLocaleDateString('de-DE', { day: '2-digit', month: 'short'});
                            }
                        },
                        grid: { display: false } //cleaner look
                    },
                    y: {
                        beginAtZero: true,
                        title: { text: "Anzahl Velofahrer", display: true }
                    }
                },
            }
        });

        //set background style
        ctxAllTime.style.backgroundColor = '#EFF5FF';
        ctxAllTime.style.borderRadius = '8px';
    }

    document.getElementById("status").innerText = "Daten erfolgreich geladen.";

    } catch (err) {
        console.error(err);
        const statusEl = document.getElementById("status");
        if (statusEl) statusEl.innerText = "Fehler beim Laden der Daten.";
    }
}

loadDashboard();