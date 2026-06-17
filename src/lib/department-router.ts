/**
 * CampusNiti — Intelligent Department Routing Engine
 */

import type { ComplaintCategory, CampusZone, ComplaintSeverity, ComplaintPriority } from './complaints';

export type DepartmentCode =
    | 'ELECTRICAL_MAINT' | 'CIVIL_WORKS' | 'PLUMBING_SANITATION' | 'NETWORK_IT'
    | 'IT_CELL' | 'ACADEMIC_TECH' | 'AV_SUPPORT' | 'LAB_MAINT' | 'HOSTEL_MAINT'
    | 'MESS_MGMT' | 'CAMPUS_SECURITY' | 'RESEARCH_INFRA' | 'SPORTS_FACILITY'
    | 'HORTICULTURE' | 'TRANSPORT_PARKING' | 'ESTATE_OFFICE' | 'STUDENT_WELFARE'
    | 'HEALTH_CENTRE' | 'LIBRARY_TECH';

export interface Department {
    code: DepartmentCode; name: string; shortName: string; description: string;
    email: string; phone: string; color: string; slaHours: number; headTitle: string;
}

export const DEPARTMENTS: Record<DepartmentCode, Department> = {
    ELECTRICAL_MAINT:    { code: 'ELECTRICAL_MAINT', name: 'Electrical Maintenance Department', shortName: 'Electrical', description: 'Manages all electrical systems, lighting, power supply across campus.', email: 'electrical.maint@nitj.ac.in', phone: 'Ext. 101', color: '#f59e0b', slaHours: 48, headTitle: 'Chief Electrical Engineer' },
    CIVIL_WORKS:         { code: 'CIVIL_WORKS', name: 'Civil Works & Maintenance Division', shortName: 'Civil Works', description: 'Structural repairs, road maintenance, construction, and building upkeep.', email: 'civil.works@nitj.ac.in', phone: 'Ext. 102', color: '#92400e', slaHours: 72, headTitle: 'Executive Engineer (Civil)' },
    PLUMBING_SANITATION: { code: 'PLUMBING_SANITATION', name: 'Plumbing & Sanitation Department', shortName: 'Plumbing', description: 'Water supply, plumbing, drainage, and sanitation services.', email: 'plumbing@nitj.ac.in', phone: 'Ext. 103', color: '#0ea5e9', slaHours: 24, headTitle: 'Sanitation & Plumbing Supervisor' },
    NETWORK_IT:          { code: 'NETWORK_IT', name: 'Network & IT Infrastructure', shortName: 'Network IT', description: 'Campus-wide network, internet, WiFi, and LAN infrastructure.', email: 'network@nitj.ac.in', phone: 'Ext. 104', color: '#6366f1', slaHours: 12, headTitle: 'Network Administrator' },
    IT_CELL:             { code: 'IT_CELL', name: 'IT Cell & Software Development', shortName: 'IT Cell', description: 'Campus ERP, student portals, and software-related issues.', email: 'itcell@nitj.ac.in', phone: 'Ext. 105', color: '#7c3aed', slaHours: 24, headTitle: 'System Administrator' },
    ACADEMIC_TECH:       { code: 'ACADEMIC_TECH', name: 'Academic Technology Department', shortName: 'Academic Tech', description: 'Smart classrooms, digital boards, AV in lecture halls.', email: 'acadtech@nitj.ac.in', phone: 'Ext. 106', color: '#2563eb', slaHours: 24, headTitle: 'Academic Technology Coordinator' },
    AV_SUPPORT:          { code: 'AV_SUPPORT', name: 'AV & Multimedia Support Team', shortName: 'AV Support', description: 'Projectors, sound systems, multimedia setups.', email: 'avsupport@nitj.ac.in', phone: 'Ext. 107', color: '#db2777', slaHours: 24, headTitle: 'AV Technical Supervisor' },
    LAB_MAINT:           { code: 'LAB_MAINT', name: 'Laboratory Maintenance Services', shortName: 'Lab Maint', description: 'Repair of laboratory equipment across departments.', email: 'labmaint@nitj.ac.in', phone: 'Ext. 108', color: '#059669', slaHours: 48, headTitle: 'Laboratory Superintendent' },
    HOSTEL_MAINT:        { code: 'HOSTEL_MAINT', name: 'Hostel Maintenance Department', shortName: 'Hostel', description: 'Infrastructure maintenance for all hostels.', email: 'hostel.maint@nitj.ac.in', phone: 'Ext. 109', color: '#10b981', slaHours: 24, headTitle: 'Hostel Maintenance Supervisor' },
    MESS_MGMT:           { code: 'MESS_MGMT', name: 'Mess Management & Cafeteria', shortName: 'Mess Mgmt', description: 'Infrastructure and operational issues in mess halls.', email: 'mess@nitj.ac.in', phone: 'Ext. 110', color: '#f97316', slaHours: 12, headTitle: 'Mess Superintendent' },
    CAMPUS_SECURITY:     { code: 'CAMPUS_SECURITY', name: 'Campus Security Department', shortName: 'Security', description: 'CCTV, access control, lighting in security-critical areas.', email: 'security@nitj.ac.in', phone: 'Ext. 111', color: '#dc2626', slaHours: 4, headTitle: 'Chief Security Officer' },
    RESEARCH_INFRA:      { code: 'RESEARCH_INFRA', name: 'Research Infrastructure Cell', shortName: 'Research Infra', description: 'Specialized equipment for research labs and centers.', email: 'research.infra@nitj.ac.in', phone: 'Ext. 112', color: '#7c3aed', slaHours: 48, headTitle: 'Research Infrastructure Coordinator' },
    SPORTS_FACILITY:     { code: 'SPORTS_FACILITY', name: 'Sports Facilities Department', shortName: 'Sports', description: 'Grounds, courts, sports equipment maintenance.', email: 'sports@nitj.ac.in', phone: 'Ext. 113', color: '#22c55e', slaHours: 72, headTitle: 'Sports Officer' },
    HORTICULTURE:        { code: 'HORTICULTURE', name: 'Horticulture & Landscaping', shortName: 'Horticulture', description: 'Campus garden, lawns, trees, and landscaping.', email: 'horticulture@nitj.ac.in', phone: 'Ext. 114', color: '#16a34a', slaHours: 120, headTitle: 'Horticulture Supervisor' },
    TRANSPORT_PARKING:   { code: 'TRANSPORT_PARKING', name: 'Transport & Parking Management', shortName: 'Transport', description: 'Campus vehicles, parking infrastructure.', email: 'transport@nitj.ac.in', phone: 'Ext. 115', color: '#64748b', slaHours: 72, headTitle: 'Transport Officer' },
    ESTATE_OFFICE:       { code: 'ESTATE_OFFICE', name: 'Estate & General Maintenance Office', shortName: 'Estate Office', description: 'General property upkeep, furniture, fixtures.', email: 'estate@nitj.ac.in', phone: 'Ext. 116', color: '#78716c', slaHours: 168, headTitle: 'Estate Officer' },
    STUDENT_WELFARE:     { code: 'STUDENT_WELFARE', name: 'Student Welfare Division', shortName: 'Student Welfare', description: 'Non-infrastructure student concerns and welfare complaints.', email: 'welfare@nitj.ac.in', phone: 'Ext. 117', color: '#ec4899', slaHours: 48, headTitle: 'Dean of Student Welfare' },
    HEALTH_CENTRE:       { code: 'HEALTH_CENTRE', name: 'Health Centre Support', shortName: 'Health Centre', description: 'Infrastructure issues in the campus health centre.', email: 'health@nitj.ac.in', phone: 'Ext. 118', color: '#ef4444', slaHours: 24, headTitle: 'Medical Officer' },
    LIBRARY_TECH:        { code: 'LIBRARY_TECH', name: 'Library Technical Support', shortName: 'Library Tech', description: 'IT systems and infrastructure issues in the library.', email: 'library.tech@nitj.ac.in', phone: 'Ext. 119', color: '#0891b2', slaHours: 48, headTitle: 'Library Systems Administrator' },
};

const CATEGORY_TO_DEPARTMENT: Record<ComplaintCategory, DepartmentCode> = {
    ELECTRICAL: 'ELECTRICAL_MAINT', PLUMBING: 'PLUMBING_SANITATION', CIVIL: 'CIVIL_WORKS',
    SANITATION: 'PLUMBING_SANITATION', IT_NETWORK: 'NETWORK_IT', FURNITURE: 'ESTATE_OFFICE',
    EQUIPMENT: 'LAB_MAINT', SAFETY: 'CAMPUS_SECURITY', HOSTEL: 'HOSTEL_MAINT',
    SPORTS: 'SPORTS_FACILITY', CAFETERIA: 'MESS_MGMT', OTHER: 'ESTATE_OFFICE',
};

const ZONE_OVERRIDE: Partial<Record<CampusZone, DepartmentCode>> = {
    HOSTEL_BOYS: 'HOSTEL_MAINT', HOSTEL_GIRLS: 'HOSTEL_MAINT',
    CAFETERIA: 'MESS_MGMT', SPORTS_COMPLEX: 'SPORTS_FACILITY',
};

const COMPOUND_RULES: Record<string, DepartmentCode> = {
    'IT_NETWORK:LIBRARY': 'LIBRARY_TECH', 'IT_NETWORK:ACADEMIC_BLOCK': 'NETWORK_IT',
    'IT_NETWORK:LAB': 'LAB_MAINT', 'EQUIPMENT:LAB': 'LAB_MAINT',
    'ELECTRICAL:HOSTEL_BOYS': 'HOSTEL_MAINT', 'ELECTRICAL:HOSTEL_GIRLS': 'HOSTEL_MAINT',
    'CIVIL:ROAD': 'CIVIL_WORKS', 'SAFETY:MAIN_GATE': 'CAMPUS_SECURITY', 'SAFETY:PARKING': 'CAMPUS_SECURITY',
};

export interface RoutingResult {
    department: DepartmentCode; departmentInfo: Department;
    confidence: 'HIGH' | 'MEDIUM' | 'LOW'; reason: string;
    escalated: boolean; escalationNote?: string;
}

export function routeComplaint(params: {
    category: ComplaintCategory; zone: CampusZone;
    severity: ComplaintSeverity; isEmergency: boolean; priority: ComplaintPriority;
}): RoutingResult {
    const { category, zone, severity, isEmergency, priority } = params;

    if (isEmergency) {
        return { department: 'CAMPUS_SECURITY', departmentInfo: DEPARTMENTS['CAMPUS_SECURITY'], confidence: 'HIGH', reason: 'Emergency flag set — routed to Campus Security.', escalated: true, escalationNote: 'All department heads notified.' };
    }

    const compoundKey = `${category}:${zone}`;
    if (COMPOUND_RULES[compoundKey]) {
        const dept = COMPOUND_RULES[compoundKey];
        return { department: dept, departmentInfo: DEPARTMENTS[dept], confidence: 'HIGH', reason: `Precise routing: ${category} in ${zone} → ${DEPARTMENTS[dept].name}`, escalated: false };
    }

    if (ZONE_OVERRIDE[zone]) {
        const dept = ZONE_OVERRIDE[zone]!;
        const catDept = CATEGORY_TO_DEPARTMENT[category];
        if (catDept !== 'ESTATE_OFFICE' && catDept !== dept) {
            return { department: catDept, departmentInfo: DEPARTMENTS[catDept], confidence: 'MEDIUM', reason: `Category ${category} overrides zone default for ${zone}.`, escalated: false };
        }
        return { department: dept, departmentInfo: DEPARTMENTS[dept], confidence: 'HIGH', reason: `Zone ${zone} primary routing → ${DEPARTMENTS[dept].name}`, escalated: false };
    }

    const primaryDept = CATEGORY_TO_DEPARTMENT[category];
    const escalated = priority === 'CRITICAL' || severity === 'CRITICAL';

    return { department: primaryDept, departmentInfo: DEPARTMENTS[primaryDept], confidence: 'HIGH', reason: `Category ${category} → ${DEPARTMENTS[primaryDept].name}`, escalated, escalationNote: escalated ? 'Critical priority — admin notified.' : undefined };
}

export function getRoutingSummary(result: RoutingResult): string {
    return `Automatically assigned to ${result.departmentInfo.name} (${result.confidence} confidence). ${result.reason}`;
}
