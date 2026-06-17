'use client';

import { LineChart } from 'lucide-react';

export default function AdminAnalyticsPage() {
    return (
        <div style={{ maxWidth: 1200, margin: '0 auto', color: 'white', paddingBottom: 60 }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                    <div style={{ background: 'rgba(16,185,129,0.1)', padding: 12, borderRadius: 12 }}>
                        <LineChart size={28} color="#10b981" />
                    </div>
                    <div>
                        <h1 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 4px 0' }}>System Analytics</h1>
                        <p style={{ color: 'rgba(255,255,255,0.5)', margin: 0, fontSize: 14 }}>
                            View infrastructure complaint trends and resolution speed.
                        </p>
                    </div>
                </div>
            </div>

            <div style={{ background: '#13151a', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, padding: 40, textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>
                <LineChart size={48} style={{ margin: '0 auto 16px auto', opacity: 0.5 }} />
                <h3>Not enough data to generate analytics.</h3>
                <p>Metrics will populate as complaints are resolved over time.</p>
            </div>
        </div>
    );
}
