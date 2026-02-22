import { ErrorGroup } from '@/types/incident';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// 1. Runbook Mapping
const RUNBOOK_DB: Record<string, string> = {
    'ConnectionTimeout': 'https://wiki.company.com/runbooks/db-connection-timeout',
    'NullReference': 'https://wiki.company.com/runbooks/null-pointer-debug',
    'ValidationError': 'https://wiki.company.com/runbooks/api-validation-standards',
    'PaymentGateway': 'https://wiki.company.com/runbooks/payment-gateway-troubleshooting',
};

export function getRunbookUrl(errorCodeOrMessage: string): string | undefined {
    for (const [key, url] of Object.entries(RUNBOOK_DB)) {
        if (errorCodeOrMessage.includes(key)) return url;
    }
    return undefined;
}

// 2. [REMOVED] Smart Grouping Logic (Now handled by Backend IngestService)

// 3. PDF Post-Mortem Generation
interface JsPDFWithAutoTable extends jsPDF {
    lastAutoTable: { finalY: number };
}

export function generatePDFReport(group: ErrorGroup) {
    const doc = new jsPDF() as JsPDFWithAutoTable;

    // Header
    doc.setFontSize(22);
    doc.setTextColor(40, 40, 40);
    doc.text("Incident Post-Mortem Report", 14, 20);

    // Meta badge
    doc.setFontSize(10);
    doc.setFillColor(group.severity === 'CRITICAL' ? 220 : 100, 50, 50);
    doc.setTextColor(255, 255, 255);
    doc.rect(14, 28, 30, 8, 'F');
    doc.text(group.severity, 19, 33);

    // Overview Info
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(12);
    doc.text(`ID: ${group.id.substring(0, 8)}`, 50, 33);
    doc.text(`Service: ${group.appId}`, 14, 45);
    doc.text(`Status: ${group.status}`, 14, 52);
    doc.text(`Events Count: ${group.occurrenceCount}`, 100, 45);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 100, 52);

    // Timeline
    const timeline = [
        ['Phase', 'Timestamp'],
        ['Detected', new Date(group.firstSeen).toLocaleString()],
        ['Acknowledged', group.acknowledgedAt ? new Date(group.acknowledgedAt).toLocaleString() : '-'],
        ['Fixed', group.fixedAt ? new Date(group.fixedAt).toLocaleString() : '-'],
        ['Deployed', group.deployedAt ? new Date(group.deployedAt).toLocaleString() : '-'],
    ];

    autoTable(doc, {
        startY: 60,
        head: [['Phase', 'Timestamp']],
        body: timeline.slice(1),
        theme: 'striped',
        headStyles: { fillColor: [41, 128, 185] }
    });

    // Root Cause
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text("Root Cause Analysis", 14, finalY);

    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    const splitTitle = doc.splitTextToSize(`Pattern: ${group.title}`, 180);
    doc.text(splitTitle, 14, finalY + 8);

    const splitAnalysis = doc.splitTextToSize(`Raw Error: ${group.logs[0]?.message || 'N/A'}`, 180);
    doc.text(splitAnalysis, 14, finalY + 16 + (splitTitle.length * 4));

    doc.save(`post-mortem-${group.appId}-${new Date().toISOString().split('T')[0]}.pdf`);
}
