const API_BASE = "/v1/profiler";
let profiles = [];
let autoRefresh = true;

async function fetchData() {
    showLoader(true);
    try {
        const [fullRes, summaryRes] = await Promise.all([fetch(`${API_BASE}`), fetch(`${API_BASE}/summary`)]);

        const data = await fullRes.json();
        const summary = await summaryRes.json();

        profiles = data.profiles || [];
        updateUI(profiles, summary.summary || summary);
        document.getElementById("last-updated").innerText = `Last update: ${new Date().toLocaleTimeString()}`;
    } catch (err) {
        console.error("Failed to fetch data", err);
        showToast("Failed to sync with neural link (server error)", true);
    } finally {
        showLoader(false);
    }
}

function updateUI(data, summary) {
    const body = document.getElementById("profiles-body");
    const emptyState = document.getElementById("empty-state");

    // Update Summary
    if (summary) {
        document.getElementById("stat-total-calls").innerText = summary.totalCalls || 0;
        document.getElementById("stat-endpoints").innerText = `${summary.totalEndpoints || 0} active endpoints`;
        document.getElementById("stat-avg-latency").innerText = `${(summary.averageResponseTime || 0).toFixed(4)}ms`;

        // Cache Stats
        const hits = summary.totalCacheHits || 0;
        const misses = summary.totalCacheMisses || 0;
        const total = hits + misses;
        const rate = total > 0 ? Math.round((hits / total) * 100) : 0;
        document.getElementById("stat-cache").innerText = `${rate}%`;
        document.getElementById("stat-cache-details").innerText = `${hits} hits / ${misses} misses`;

        if (summary.slowestEndpoint) {
            document.getElementById("stat-slowest").innerText =
                `${summary.slowestEndpoint.averageResponseTime.toFixed(4)}ms`;
            document.getElementById("stat-slowest-name").innerText = summary.slowestEndpoint.endpoint;
        }
    }

    // Update Table
    if (!data || data.length === 0) {
        body.innerHTML = "";
        emptyState.style.display = "block";
        return;
    }

    emptyState.style.display = "none";
    const searchTerm = document.getElementById("search").value.toLowerCase();

    // Sort data by average response time descending
    const sorted = [...data].sort((a, b) => b.averageResponseTime - a.averageResponseTime);

    const filtered = sorted.filter((p) => p.endpoint.toLowerCase().includes(searchTerm));

    body.innerHTML = filtered
        .map((profile) => {
            const latencyClass =
                profile.averageResponseTime < 100 ? "good" : profile.averageResponseTime < 400 ? "mid" : "bad";
            const p95Class = profile.p95ResponseTime < 200 ? "good" : profile.p95ResponseTime < 600 ? "mid" : "bad";
            const progress = Math.min(100, (profile.averageResponseTime / 1000) * 100);

            return `
            <tr>
                <td>
                    <span class="method method-${profile.method}">${profile.method}</span>
                    <span style="opacity: 0.9">${profile.path}</span>
                </td>
                <td>${profile.totalCalls}</td>
                <td>${profile.minResponseTime.toFixed(4)}ms</td>
                <td>
                    <div style="display: flex; align-items: center; gap: 0.5rem">
                        <span>${profile.averageResponseTime.toFixed(4)}ms</span>
                        <div class="latency-bar-container">
                            <div class="latency-bar ${latencyClass}" style="width: ${progress}%"></div>
                        </div>
                    </div>
                </td>
                <td><span style="color: ${p95Class === "good" ? "var(--success)" : p95Class === "mid" ? "var(--warning)" : "var(--error)"}">${profile.p95ResponseTime.toFixed(4)}ms</span></td>
                <td>${profile.maxResponseTime.toFixed(4)}ms</td>
                <td>
                    ${
                        profile.cacheHitCount === 0 && profile.cacheMissCount === 0
                            ? '<span style="opacity: 0.5">N/A</span>'
                            : `<span class="cache-stat">
                            <span style="color: var(--success)">${profile.cacheHitCount}</span> / 
                            <span style="color: var(--warning)">${profile.cacheMissCount}</span>
                        </span>`
                    }
                </td>
                <td>
                    <span style="color: ${profile.errorCount > 0 ? "var(--error)" : "var(--success)"}">
                        ${profile.errorCount > 0 ? `⚠️ ${profile.errorCount} Errors` : "✓ Healthy"}
                    </span>
                </td>
            </tr>
        `;
        })
        .join("");
}

async function clearData() {
    if (!confirm("Execute command: WIPE_ALL_TRACE_DATA? This cannot be undone.")) return;

    try {
        await fetch(`${API_BASE}/clear`, { method: "POST" });
        showToast("Neural cache purged successfully");
        fetchData();
    } catch (err) {
        showToast("Purge sequence failed", true);
    }
}

function showLoader(show) {
    document.getElementById("page-loader").style.display = show ? "block" : "none";
}

function showToast(msg, isError = false) {
    const t = document.getElementById("toast");
    if (!t) return;
    t.innerText = msg;
    t.style.borderColor = isError ? "var(--error)" : "var(--border)";
    t.classList.add("show");
    setTimeout(() => t.classList.remove("show"), 3000);
}

// Event Listeners
document.getElementById("btn-refresh").addEventListener("click", fetchData);
document.getElementById("btn-clear").addEventListener("click", clearData);
document.getElementById("search").addEventListener("input", () => updateUI(profiles, null));

// Info popup
document.getElementById("info-btn").addEventListener("click", () => {
    document.getElementById("info-popup").style.display = "block";
    document.getElementById("popup-overlay").style.display = "block";
});

document.getElementById("close-popup").addEventListener("click", () => {
    document.getElementById("info-popup").style.display = "none";
    document.getElementById("popup-overlay").style.display = "none";
});

document.getElementById("popup-overlay").addEventListener("click", () => {
    document.getElementById("info-popup").style.display = "none";
    document.getElementById("popup-overlay").style.display = "none";
});

// Initial fetch and auto-refresh
fetchData();
setInterval(() => {
    if (autoRefresh) fetchData();
}, 5000);

// Glassmorphism parallax effect
document.addEventListener("mousemove", (e) => {
    const moveX = (e.clientX - window.innerWidth / 2) * 0.01;
    const moveY = (e.clientY - window.innerHeight / 2) * 0.01;
    document.body.style.backgroundPosition = `${moveX}px ${moveY}px`;
});
