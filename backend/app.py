from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from scipy import stats
import os

app = Flask(__name__)
CORS(app) 

def run_probit_analysis(df):
    try:
        df['Konsentrasi'] = pd.to_numeric(df['Konsentrasi'], errors='coerce')
        df['Total'] = pd.to_numeric(df['Total'], errors='coerce')
        df['Mortalitas'] = pd.to_numeric(df['Mortalitas'], errors='coerce')
        df.dropna(inplace=True)

        control_row = df[df['Konsentrasi'] == 0]
        p_control = 0.0
        if not control_row.empty:
            p_control = control_row['Mortalitas'].iloc[0] / 100.0
        
        df_treat = df[df['Konsentrasi'] > 0].copy()
        if df_treat.empty:
            return {"success": False, "error": "Data perlakuan kosong. Masukkan konsentrasi > 0."}

        df_treat['P_obs'] = df_treat['Mortalitas'] / 100.0
        
        df_treat['P_abbott'] = (df_treat['P_obs'] - p_control) / (1.0 - p_control)
        df_treat['P_abbott'] = df_treat['P_abbott'].clip(lower=0.0)

        def adjust_fraction(row):
            p = row['P_abbott']
            n = row['Total']
            if p <= 0: return 1.0 / (2.0 * n)
            elif p >= 1.0: return 1.0 - (1.0 / (2.0 * n))
            return p

        df_treat['P_final'] = df_treat.apply(adjust_fraction, axis=1)

        df_treat['Log_X'] = np.log10(df_treat['Konsentrasi'])
        df_treat['Probit_Y'] = stats.norm.ppf(df_treat['P_final']) + 5

        slope, intercept, r_value, p_value, std_err = stats.linregress(df_treat['Log_X'], df_treat['Probit_Y'])

        log_ld50 = (5 - intercept) / slope
        ld50_value = 10 ** log_ld50

        empirical_data = [
            {"log_conc": round(row['Log_X'], 4), "probit": round(row['Probit_Y'], 4)}
            for _, row in df_treat.iterrows()
        ]

        x_min, x_max = df_treat['Log_X'].min(), df_treat['Log_X'].max()
        x_trend = np.linspace(x_min, x_max, 10)
        y_trend = slope * x_trend + intercept
        
        trend_data = [{"log_conc": round(x, 4), "probit": round(y, 4)} for x, y in zip(x_trend, y_trend)]

        sign = "+" if intercept >= 0 else "-"
        equation = f"y = {slope:.4f}x {sign} {abs(intercept):.4f}"
        r_squared = f"R² = {r_value**2:.4f}"

        return {
            "success": True,
            "ld50": round(ld50_value, 2),
            "equation": equation,
            "r_sq": r_squared,
            "curve_data": trend_data,
            "empirical_data": empirical_data
        }

    except Exception as e:
        return {"success": False, "error": str(e)}

@app.route('/', methods=['GET'])
def home():
    return jsonify({"status": "BioCalc API is Running", "version": "1.0.0"})

@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.json
    if not data or 'rows' not in data:
        return jsonify({"success": False, "error": "No data provided"}), 400
    df = pd.DataFrame(data['rows'])
    result = run_probit_analysis(df)
    return jsonify(result)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 10000))
    app.run(host='0.0.0.0', port=port, debug=True)