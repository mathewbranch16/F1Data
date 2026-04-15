from fastapi import FastAPI
import fastf1
import numpy as np
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

import math

def time_to_seconds(t):
    if t is None:
        return None

    try:
        val = t.total_seconds()

        if math.isnan(val):
            return None

        return val
    except:
        return None

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Enable cache
fastf1.Cache.enable_cache('cache')


# ============================================
# Helpers
# ============================================
def load_session(year, gp):
    session = fastf1.get_session(year, gp, 'R')
    session.load()
    return session


def td_to_seconds(td):
    """Convert a Timedelta to float seconds, return None if NaT."""
    try:
        if td is None or str(td) == "NaT":
            return None
        return td.total_seconds()
    except Exception:
        return None


def safe_list(series):
    """Convert a Timedelta series to list of float seconds."""
    return [td_to_seconds(v) for v in series]


def clean_numeric(values):
    """Filter None/invalid from a list of floats."""
    return [v for v in values if v is not None and v > 0]


# ============================================
# Basic
# ============================================
@app.get("/")
def home():
    return {"message": "F1 Data Intelligence API running"}


@app.get("/drivers")
def get_drivers(year: int, gp: str):
    session = load_session(year, gp)
    drivers = list(session.laps['Driver'].unique())
    return {"drivers": drivers}


# ============================================
# Driver Data — FULLY NUMERIC
# ============================================
@app.get("/driver-data")
def get_driver_data(year: int, gp: str, driver: str):
    session = load_session(year, gp)
    laps = session.laps.pick_driver(driver)

    lap_numbers = laps["LapNumber"].tolist()
    lap_times_sec = safe_list(laps["LapTime"])
    compounds = laps["Compound"].tolist()

    return {
        "lap_numbers": lap_numbers,
        "lap_times": laps["LapTime"].astype(str).tolist(),     # display format
        "lap_times_sec": lap_times_sec,                         # numeric (seconds)
        "compounds": compounds
    }


@app.get("/driver-summary")
def driver_summary(year: int, gp: str, driver: str):
    session = load_session(year, gp)
    laps = session.laps.pick_driver(driver)

    times = clean_numeric(safe_list(laps["LapTime"]))

    return {
        "total_laps": len(laps),
        "best_lap": str(laps["LapTime"].min()),
        "average_lap": str(laps["LapTime"].mean()),
        "best_lap_sec": min(times) if times else None,
        "average_lap_sec": float(np.mean(times)) if times else None,
        "tyre_strategy": laps["Compound"].tolist()
    }


# ============================================
# Sector Analysis — FULLY NUMERIC
# ============================================
@app.get("/sector-analysis")
def sector_analysis(year: int, gp: str, driver: str):
    session = load_session(year, gp)
    laps = session.laps.pick_driver(driver)

    s1 = safe_list(laps["Sector1Time"])
    s2 = safe_list(laps["Sector2Time"])
    s3 = safe_list(laps["Sector3Time"])

    return {
        "lap_numbers": laps["LapNumber"].tolist(),
        "sector1": laps["Sector1Time"].fillna("0").astype(str).tolist(),  # display
        "sector2": laps["Sector2Time"].fillna("0").astype(str).tolist(),
        "sector3": laps["Sector3Time"].fillna("0").astype(str).tolist(),
        "sector1_sec": s1,  # numeric
        "sector2_sec": s2,
        "sector3_sec": s3,
    }


# ============================================
# Comparison — NUMERIC
# ============================================
@app.get("/compare")
def compare_drivers(year: int, gp: str, d1: str, d2: str):
    session = load_session(year, gp)

    laps1 = session.laps.pick_driver(d1)
    laps2 = session.laps.pick_driver(d2)

    return {
        "lap_numbers": laps1["LapNumber"].tolist(),
        "driver1_times": laps1["LapTime"].astype(str).tolist(),
        "driver2_times": laps2["LapTime"].astype(str).tolist(),
        "driver1_times_sec": safe_list(laps1["LapTime"]),
        "driver2_times_sec": safe_list(laps2["LapTime"]),
    }


# ============================================
# STATISTICAL ANALYSIS (NEW)
# ============================================
@app.get("/stats")
def driver_stats(year: int, gp: str, driver: str):
    session = load_session(year, gp)
    laps = session.laps.pick_driver(driver)

    times = clean_numeric(safe_list(laps["LapTime"]))
    s1 = clean_numeric(safe_list(laps["Sector1Time"]))
    s2 = clean_numeric(safe_list(laps["Sector2Time"]))
    s3 = clean_numeric(safe_list(laps["Sector3Time"]))

    if not times:
        return {"error": "No valid lap times"}

    arr = np.array(times)
    mean_t = float(np.mean(arr))
    median_t = float(np.median(arr))
    std_t = float(np.std(arr))
    min_t = float(np.min(arr))
    max_t = float(np.max(arr))

    # Consistency score: 0-100, higher = more consistent
    # Based on coefficient of variation (lower CV = more consistent)
    cv = std_t / mean_t if mean_t > 0 else 1
    consistency = max(0, min(100, round((1 - cv * 10) * 100)))

    # Degradation: compare first-third avg vs last-third avg
    third = max(1, len(times) // 3)
    first_avg = float(np.mean(arr[:third]))
    last_avg = float(np.mean(arr[-third:]))
    degradation_sec = round(last_avg - first_avg, 3)

    # Anomaly detection: laps > mean + 2*std
    threshold = mean_t + 2 * std_t
    anomalies = []
    lap_nums = laps["LapNumber"].tolist()
    all_times_sec = safe_list(laps["LapTime"])
    for i, t in enumerate(all_times_sec):
        if t is not None and t > threshold and t < 200:
            anomalies.append({"lap": lap_nums[i], "time": round(t, 3), "delta": round(t - mean_t, 3)})

    return {
        "mean": round(mean_t, 3),
        "median": round(median_t, 3),
        "std_dev": round(std_t, 3),
        "best": round(min_t, 3),
        "worst": round(max_t, 3),
        "consistency_score": consistency,
        "degradation_sec": degradation_sec,
        "anomaly_count": len(anomalies),
        "anomalies": anomalies[:10],
        "sector_averages": {
            "s1": round(float(np.mean(s1)), 3) if s1 else None,
            "s2": round(float(np.mean(s2)), 3) if s2 else None,
            "s3": round(float(np.mean(s3)), 3) if s3 else None,
        },
        "sector_std": {
            "s1": round(float(np.std(s1)), 3) if s1 else None,
            "s2": round(float(np.std(s2)), 3) if s2 else None,
            "s3": round(float(np.std(s3)), 3) if s3 else None,
        },
        "insight_basic": f"{driver} completed {len(times)} valid laps with a best of {round(min_t, 3)}s and an average of {round(mean_t, 3)}s.",
        "insight_technical": f"Consistency score: {consistency}/100. Std deviation of {round(std_t, 3)}s across {len(times)} laps. Race degradation of {degradation_sec}s from first to final stint. {len(anomalies)} anomalous laps detected (>{round(threshold, 2)}s threshold).",
        "insight_analytical": f"CV={round(cv, 4)}. Median-Mean delta: {round(median_t - mean_t, 3)}s (negative = right-skewed / outlier-heavy). Degradation gradient: {round(degradation_sec / max(1, len(times)), 4)}s/lap."
    }


# ============================================
# PREDICTION (NEW) — Simple Linear Regression
# ============================================
@app.get("/predict")
def predict_lap(year: int, gp: str, driver: str):
    session = load_session(year, gp)
    laps = session.laps.pick_driver(driver)

    all_times = safe_list(laps["LapTime"])
    lap_nums = laps["LapNumber"].tolist()

    # Build clean pairs
    pairs = [(n, t) for n, t in zip(lap_nums, all_times) if t is not None and 50 < t < 200]
    if len(pairs) < 5:
        return {"error": "Not enough data for prediction"}

    x = np.array([p[0] for p in pairs], dtype=float)
    y = np.array([p[1] for p in pairs], dtype=float)

    # Linear regression: y = mx + b
    m, b = np.polyfit(x, y, 1)
    next_lap = int(x[-1]) + 1
    predicted = float(m * next_lap + b)

    # Optimal: best achievable based on best-sector combination
    s1 = clean_numeric(safe_list(laps["Sector1Time"]))
    s2 = clean_numeric(safe_list(laps["Sector2Time"]))
    s3 = clean_numeric(safe_list(laps["Sector3Time"]))
    optimal = (min(s1) if s1 else 0) + (min(s2) if s2 else 0) + (min(s3) if s3 else 0)

    # 5-lap rolling average for recent pace
    recent = y[-5:]
    recent_avg = float(np.mean(recent))

    # Trend direction
    if m > 0.05:
        trend = "degrading"
    elif m < -0.05:
        trend = "improving"
    else:
        trend = "stable"

    return {
        "next_lap_number": next_lap,
        "predicted_time": round(predicted, 3),
        "optimal_lap": round(optimal, 3),
        "recent_average": round(recent_avg, 3),
        "trend": trend,
        "slope_per_lap": round(float(m), 4),
        "insight": f"Trend is {trend} at {abs(round(float(m) * 1000, 1))}ms/lap. Predicted lap {next_lap}: {round(predicted, 3)}s. Theoretical optimal (best sectors combined): {round(optimal, 3)}s.",
        "regression_coefficients": {"slope": round(float(m), 6), "intercept": round(float(b), 3)}
    }


# ============================================
# DEEP SECTOR ANALYSIS (NEW)
# ============================================
@app.get("/sector-deep")
def sector_deep(year: int, gp: str, driver: str):
    session = load_session(year, gp)
    laps = session.laps.pick_driver(driver)

    lap_nums = laps["LapNumber"].tolist()
    s1_all = safe_list(laps["Sector1Time"])
    s2_all = safe_list(laps["Sector2Time"])
    s3_all = safe_list(laps["Sector3Time"])

    def analyze_sector(name, values, laps_list):
        clean = [(laps_list[i], v) for i, v in enumerate(values) if v is not None and 0 < v < 60]
        if not clean:
            return None
        nums = [c[1] for c in clean]
        arr = np.array(nums)
        mean_v = float(np.mean(arr))
        std_v = float(np.std(arr))
        best_idx = int(np.argmin(arr))
        worst_idx = int(np.argmax(arr))
        threshold = mean_v + 2 * std_v
        spikes = [{"lap": clean[i][0], "time": round(clean[i][1], 3)} for i in range(len(clean)) if clean[i][1] > threshold]

        return {
            "mean": round(mean_v, 3),
            "std": round(std_v, 3),
            "best": round(float(np.min(arr)), 3),
            "best_lap": clean[best_idx][0],
            "worst": round(float(np.max(arr)), 3),
            "worst_lap": clean[worst_idx][0],
            "spikes": spikes[:5],
            "spike_count": len(spikes),
        }

    s1_analysis = analyze_sector("S1", s1_all, lap_nums)
    s2_analysis = analyze_sector("S2", s2_all, lap_nums)
    s3_analysis = analyze_sector("S3", s3_all, lap_nums)

    # Determine weakest sector
    means = {}
    if s1_analysis: means["Sector 1"] = s1_analysis["mean"]
    if s2_analysis: means["Sector 2"] = s2_analysis["mean"]
    if s3_analysis: means["Sector 3"] = s3_analysis["mean"]
    weakest = max(means, key=means.get) if means else "Unknown"
    strongest = min(means, key=means.get) if means else "Unknown"

    return {
        "sector1": s1_analysis,
        "sector2": s2_analysis,
        "sector3": s3_analysis,
        "weakest_sector": weakest,
        "strongest_sector": strongest,
        "insight_basic": f"{driver}'s weakest sector is {weakest}. Focus on improving exit speed and braking points there.",
        "insight_technical": f"Weakest: {weakest} (avg {means.get(weakest, 0):.3f}s, {(s1_analysis or s2_analysis or s3_analysis or {}).get('spike_count', 0)} spikes). Strongest: {strongest} (avg {means.get(strongest, 0):.3f}s). Sector consistency varies by up to {max([(s1_analysis or {}).get('std', 0), (s2_analysis or {}).get('std', 0), (s3_analysis or {}).get('std', 0)]):.3f}s.",
        "insight_analytical": f"Sector time distribution — S1 μ={s1_analysis['mean'] if s1_analysis else 'N/A'}s σ={s1_analysis['std'] if s1_analysis else 'N/A'}s | S2 μ={s2_analysis['mean'] if s2_analysis else 'N/A'}s σ={s2_analysis['std'] if s2_analysis else 'N/A'}s | S3 μ={s3_analysis['mean'] if s3_analysis else 'N/A'}s σ={s3_analysis['std'] if s3_analysis else 'N/A'}s"
    }


# ============================================
# AI Insights (ENHANCED)
# ============================================
@app.get("/ai-insight")
def ai_insight(year: int, gp: str, driver: str):
    session = load_session(year, gp)
    laps = session.laps.pick_driver(driver)

    best_lap = laps["LapTime"].min()
    avg_lap = laps["LapTime"].mean()
    times = clean_numeric(safe_list(laps["LapTime"]))
    std_t = float(np.std(times)) if times else 0

    return {
        "summary": f"{driver} completed {len(laps)} laps.",
        "best_lap": str(best_lap),
        "average_lap": str(avg_lap),
        "best_lap_sec": td_to_seconds(best_lap),
        "average_lap_sec": td_to_seconds(avg_lap),
        "std_dev": round(std_t, 3),
        "insight": f"Performance variation of ±{round(std_t, 2)}s suggests {'consistent pace' if std_t < 1 else 'significant variability, likely due to tyre degradation or traffic'}."
    }


@app.get("/ai-compare")
def ai_compare(year: int, gp: str, d1: str, d2: str):
    session = load_session(year, gp)

    laps1 = session.laps.pick_driver(d1)
    laps2 = session.laps.pick_driver(d2)

    best1 = laps1["LapTime"].min()
    best2 = laps2["LapTime"].min()
    diff = abs((best1 - best2).total_seconds())

    # Sector-level comparison
    s1_d1 = clean_numeric(safe_list(laps1["Sector1Time"]))
    s1_d2 = clean_numeric(safe_list(laps2["Sector1Time"]))
    s2_d1 = clean_numeric(safe_list(laps1["Sector2Time"]))
    s2_d2 = clean_numeric(safe_list(laps2["Sector2Time"]))
    s3_d1 = clean_numeric(safe_list(laps1["Sector3Time"]))
    s3_d2 = clean_numeric(safe_list(laps2["Sector3Time"]))

    sector_deltas = {}
    if s1_d1 and s1_d2:
        sector_deltas["S1"] = round(float(np.mean(s1_d1) - np.mean(s1_d2)), 3)
    if s2_d1 and s2_d2:
        sector_deltas["S2"] = round(float(np.mean(s2_d1) - np.mean(s2_d2)), 3)
    if s3_d1 and s3_d2:
        sector_deltas["S3"] = round(float(np.mean(s3_d1) - np.mean(s3_d2)), 3)

    faster = d1 if td_to_seconds(best1) < td_to_seconds(best2) else d2

    return {
        "driver1_best": str(best1),
        "driver2_best": str(best2),
        "diff_seconds": round(diff, 3),
        "sector_deltas": sector_deltas,
        "insight": f"{faster} is {diff:.3f}s faster on best laps. " + 
                   " | ".join([f"{k}: {d1} {'gains' if v < 0 else 'loses'} {abs(v):.3f}s" for k, v in sector_deltas.items()])
    }


@app.get("/ai-sector")
def ai_sector(year: int, gp: str, driver: str):
    session = load_session(year, gp)
    laps = session.laps.pick_driver(driver)

    s1 = clean_numeric(safe_list(laps["Sector1Time"]))
    s2 = clean_numeric(safe_list(laps["Sector2Time"]))
    s3 = clean_numeric(safe_list(laps["Sector3Time"]))

    means = {}
    if s1: means["Sector 1"] = float(np.mean(s1))
    if s2: means["Sector 2"] = float(np.mean(s2))
    if s3: means["Sector 3"] = float(np.mean(s3))

    worst = max(means, key=means.get) if means else "Unknown"

    return {
        "sector_times": {
            "S1": round(means.get("Sector 1", 0), 3),
            "S2": round(means.get("Sector 2", 0), 3),
            "S3": round(means.get("Sector 3", 0), 3),
        },
        "insight": f"{driver} lost the most time in {worst}, indicating weaker performance in that sector."
    }


@app.get("/ai-strategy")
def ai_strategy(year: int, gp: str, driver: str):
    session = load_session(year, gp)
    laps = session.laps.pick_driver(driver)

    strategy = laps["Compound"].value_counts().to_dict()

    return {
        "strategy": strategy,
        "insight": f"Used {len(strategy)} tyre compounds during the race: {', '.join(strategy.keys())}."
    }

@app.get("/lap-table")
def lap_table(year: int, gp: str, driver: str):
    session = load_session(year, gp)
    laps = session.laps.pick_driver(driver)

    data = []

    for _, lap in laps.iterrows():
        lap_time_sec = time_to_seconds(lap["LapTime"]) or None
        s1 = time_to_seconds(lap["Sector1Time"]) or None
        s2 = time_to_seconds(lap["Sector2Time"]) or None
        s3 = time_to_seconds(lap["Sector3Time"]) or None

        data.append({
            "lap": int(lap["LapNumber"]),

            # numeric (IMPORTANT)
            "lap_time_sec": lap_time_sec,
            "sector1_sec": s1,
            "sector2_sec": s2,
            "sector3_sec": s3,

            # display
            "lap_time": str(lap["LapTime"]),
            "sector1": str(lap["Sector1Time"]),
            "sector2": str(lap["Sector2Time"]),
            "sector3": str(lap["Sector3Time"]),

            "compound": lap["Compound"]
        })

    return {"laps": data}

@app.get("/driver-comparison-table")
def driver_comparison_table(year: int, gp: str, d1: str, d2: str):
    session = load_session(year, gp)

    laps1 = session.laps.pick_driver(d1)
    laps2 = session.laps.pick_driver(d2)

    # merge on lap number (BEST APPROACH)
    merged = laps1.merge(
        laps2,
        on="LapNumber",
        suffixes=("_d1", "_d2")
    )

    data = []

    for _, row in merged.iterrows():
        t1 = time_to_seconds(row["LapTime_d1"])
        t2 = time_to_seconds(row["LapTime_d2"])

        delta = None
        if t1 is not None and t2 is not None:
            delta = t1 - t2

        data.append({
            "lap": int(row["LapNumber"]),

            # numeric
            "d1_lap_time_sec": t1,
            "d2_lap_time_sec": t2,
            "delta": delta,

            "d1_sector1_sec": time_to_seconds(row["Sector1Time_d1"]),
            "d2_sector1_sec": time_to_seconds(row["Sector1Time_d2"]),
            "d1_sector2_sec": time_to_seconds(row["Sector2Time_d1"]),
            "d2_sector2_sec": time_to_seconds(row["Sector2Time_d2"]),
            "d1_sector3_sec": time_to_seconds(row["Sector3Time_d1"]),
            "d2_sector3_sec": time_to_seconds(row["Sector3Time_d2"]),

            # display
            "d1_lap_time": str(row["LapTime_d1"]),
            "d2_lap_time": str(row["LapTime_d2"]),

            "d1_compound": row["Compound_d1"],
            "d2_compound": row["Compound_d2"]
        })

    return {"comparison": data}