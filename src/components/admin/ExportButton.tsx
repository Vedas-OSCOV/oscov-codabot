'use client';

import { useState } from 'react';
import { getUserDataset } from '@/app/actions/admin-export';

export default function ExportButton() {
    const [loading, setLoading] = useState(false);

    const handleExport = async () => {
        setLoading(true);
        try {
            const data = await getUserDataset();

            if (data.length === 0) {
                alert("No data to export.");
                return;
            }

            // Convert to CSV with proper escaping
            const headers = Object.keys(data[0]).join(',');
            const rows = data.map(row =>
                Object.values(row).map(v => {
                    if (v === null || v === undefined) return '""';
                    const stringValue = String(v);
                    // Escape double quotes by doubling them
                    return `"${stringValue.replace(/"/g, '""')}"`;
                }).join(',')
            );
            const csvContent = [headers, ...rows].join('\n');

            // Download
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `user_behavior_dataset_${new Date().toISOString().slice(0, 10)}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (e) {
            console.error(e);
            alert("Export failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleExport}
            disabled={loading}
            style={{
                background: '#0ea5e9',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontFamily: 'monospace',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
            }}
        >
            {loading ? 'GENERATING...' : 'EXPORT_DATASET_CSV'}
        </button>
    );
}
