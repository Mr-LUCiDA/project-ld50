import React, { useState } from 'react';
import axios from 'axios';
import {
    ComposedChart, Line, Scatter, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { Trash2, Plus, Calculator, Activity, AlertCircle, BarChart3 } from 'lucide-react';

export function Ld50Tool() {
    const [rows, setRows] = useState([
        { Konsentrasi: "0", Total: "12", Mortalitas: "22.25" },
        { Konsentrasi: "1000", Total: "12", Mortalitas: "33.40" },
        { Konsentrasi: "2500", Total: "12", Mortalitas: "61.17" },
        { Konsentrasi: "5000", Total: "12", Mortalitas: "88.93" },
        { Konsentrasi: "7500", Total: "12", Mortalitas: "97.23" },
    ]);

    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleInputChange = (index, field, value) => {
        const newRows = [...rows];

        let cleanValue = value.replace(/,/g, '.');

        if (field === 'Mortalitas' || field === 'Konsentrasi' || field === 'Total') {
            if (!/^[0-9.]*$/.test(cleanValue)) {
                return;
            }
        }

        newRows[index][field] = cleanValue;
        setRows(newRows);
    };

    const addRow = () => {
        setRows([...rows, { Konsentrasi: "0", Total: "12", Mortalitas: "0" }]);
    };

    const removeRow = (index) => {
        setRows(rows.filter((_, i) => i !== index));
    };

    const runAnalysis = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await axios.post('https://faizafadilla.pythonanywhere.com/analyze', {
                rows: rows
            });

            if (response.data.success) {
                setResult(response.data);
            } else {
                setError(response.data.error);
            }
        } catch (err) {
            setError("Gagal menghubungi server backend.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard-grid">

            <div className="panel">
                <div className="panel-header">
                    <Calculator size={20} className="text-cyan-400" />
                    <span>Data Observasi</span>
                </div>

                <div className="input-table-container">

                    <div className="table-grid table-header">
                        <div className="header-label">Konsentrasi<br /><span style={{ fontSize: '0.6rem', opacity: 0.6 }}>(PPM)</span></div>
                        <div className="header-label">Total<br /><span style={{ fontSize: '0.6rem', opacity: 0.6 }}>SAMPEL</span></div>
                        <div className="header-label" style={{ color: '#f472b6' }}>% Mortalitas<br /><span style={{ fontSize: '0.6rem', opacity: 0.6 }}>(INPUT)</span></div>
                        <div className="header-label">#</div>
                    </div>

                    {rows.map((row, index) => (
                        <div key={index} className="table-grid table-row">
                            <input
                                type="text"
                                inputMode="decimal"
                                placeholder="0"
                                className="data-input"
                                value={row.Konsentrasi}
                                onChange={(e) => handleInputChange(index, 'Konsentrasi', e.target.value)}
                            />
                            <input
                                type="text"
                                inputMode="numeric"
                                placeholder="0"
                                className="data-input"
                                value={row.Total}
                                onChange={(e) => handleInputChange(index, 'Total', e.target.value)}
                            />
                            <input
                                type="text"
                                inputMode="decimal"
                                placeholder="0.00"
                                className="data-input"
                                style={{ color: '#f472b6', fontWeight: 'bold' }}
                                value={row.Mortalitas}
                                onChange={(e) => handleInputChange(index, 'Mortalitas', e.target.value)}
                            />
                            <button onClick={() => removeRow(index)} className="btn-delete" title="Hapus">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                </div>

                <button onClick={addRow} className="btn-add-row">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        <Plus size={16} /> Tambah Data
                    </div>
                </button>

                <button
                    onClick={runAnalysis}
                    disabled={loading}
                    className="btn-calculate"
                >
                    {loading ? 'Processing...' : 'RUN ANALYTICS'}
                </button>

                {error && (
                    <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(239,68,68,0.1)', color: '#fca5a5', borderRadius: '0.5rem', fontSize: '0.875rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <AlertCircle size={16} /> {error}
                    </div>
                )}
            </div>

            <div className="panel" style={{ minHeight: '600px', display: 'flex', flexDirection: 'column' }}>
                <div className="panel-header" style={{ justifyContent: 'space-between', borderBottom: 'none' }}>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        <BarChart3 size={20} className="text-cyan-400" />
                        <span>Probit Regression Plot</span>
                    </div>
                    {result && <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Log-Linear Method</span>}
                </div>

                {!result ? (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#475569' }}>
                        <Activity size={64} style={{ opacity: 0.1, marginBottom: '1rem' }} />
                        <p>Menunggu data untuk dianalisis...</p>
                    </div>
                ) : (
                    <div style={{ animation: 'fadeIn 0.5s' }}>
                        <div className="stats-cards">
                            <div className="stat-card">
                                <div className="stat-label">Lethal Dose 50%</div>
                                <div className="stat-value" style={{ color: '#38bdf8' }}>
                                    {result.ld50} <span className="stat-unit">ppm</span>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-label">R-Squared (Fit)</div>
                                <div className="stat-value" style={{ color: '#a78bfa' }}>
                                    {result.r_sq}
                                </div>
                            </div>
                        </div>

                        <div className="equation-box">
                            {result.equation}
                        </div>

                        <div style={{ height: '400px', width: '100%' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart margin={{ top: 20, right: 30, bottom: 40, left: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                    <XAxis
                                        dataKey="log_conc"
                                        type="number"
                                        domain={['auto', 'auto']}
                                        stroke="#94a3b8"
                                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                                        label={{ value: 'Log Concentration (ppm)', position: 'bottom', offset: 15, fill: '#94a3b8', fontSize: 12 }}
                                    />
                                    <YAxis
                                        type="number"
                                        domain={[3, 8]}
                                        stroke="#94a3b8"
                                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                                        label={{ value: 'Probit', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 12 }}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }}
                                        labelStyle={{ color: '#94a3b8', marginBottom: '0.5rem' }}
                                        formatter={(value, name) => [value, name === 'probit' ? 'Regresi' : 'Observasi']}
                                    />
                                    <ReferenceLine y={5} stroke="#ef4444" strokeDasharray="3 3" />
                                    <Line
                                        data={result.curve_data}
                                        dataKey="probit"
                                        stroke="#38bdf8"
                                        strokeWidth={2}
                                        dot={false}
                                        type="monotone"
                                        strokeDasharray="5 5"
                                        activeDot={false}
                                    />
                                    <Scatter
                                        data={result.empirical_data}
                                        dataKey="probit"
                                        fill="#e879f9"
                                        shape="circle"
                                        r={6}
                                        style={{ cursor: 'pointer' }}
                                    />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}