'use client';

import { useEffect, useState } from 'react';
import { FileKey, Clock, User, CheckCircle, PlusCircle, AlertCircle } from 'lucide-react';

export default function AdminAuditPage() {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/admin/audit')
            .then(res => res.json())
            .then(data => {
                if (data.logs) setLogs(data.logs);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const getActionIcon = (action: string) => {
        if (action.includes('APPROVE')) return <CheckCircle size={16} color="#10b981" />;
        if (action.includes('CREATE')) return <PlusCircle size={16} color="#3b82f6" />;
        return <AlertCircle size={16} color="#f59e0b" />;
    };

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto', color: 'white', paddingBottom: 60 }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                    <div style={{ background: 'rgba(139,92,246,0.1)', padding: 12, borderRadius: 12 }}>
                        <FileKey size={28} color="#8b5cf6" />
                    </div>
                    <div>
                        <h1 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 4px 0' }}>Audit Log</h1>
                        <p style={{ color: 'rgba(255,255,255,0.5)', margin: 0, fontSize: 14 }}>
                            Track system actions, authentication events, and administrative changes.
                        </p>
                    </div>
                </div>
            </div>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 100 }}><div className="spinner"></div></div>
            ) : logs.length === 0 ? (
                <div style={{ background: '#13151a', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, padding: 40, textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>
                    <FileKey size={48} style={{ margin: '0 auto 16px auto', opacity: 0.5 }} />
                    <h3>No audit logs generated yet.</h3>
                    <p>System events will be recorded here once they occur (Make sure the table is created!)</p>
                </div>
            ) : (
                <div style={{ background: '#13151a', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, overflow: 'hidden' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 2fr 1fr 1fr', padding: '16px 24px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 600, letterSpacing: 1 }}>
                        <div>ACTION</div>
                        <div>DETAILS</div>
                        <div>ADMIN</div>
                        <div>TIMESTAMP</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {logs.map((log) => (
                            <div key={log.id} style={{ display: 'grid', gridTemplateColumns: '1.5fr 2fr 1fr 1fr', padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.02)', alignItems: 'center', fontSize: 14 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontWeight: 600 }}>
                                    {getActionIcon(log.action)}
                                    {log.action.replace('_', ' ')}
                                </div>
                                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', paddingRight: 16 }}>
                                    {log.details || '-'}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.8)' }}>
                                    <User size={14} color="#8b5cf6" /> {log.admin_name}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>
                                    <Clock size={12} /> {new Date(log.created_at).toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
