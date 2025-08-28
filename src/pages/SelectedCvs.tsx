import { useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api';
import type { Applicant, Auth } from '../types';

function getAuth(): Auth | null {
  const raw = localStorage.getItem('auth');
  if (!raw) return null;
  try { return JSON.parse(raw) as Auth; } catch { return null; }
}

function computeAgeFromDOB(a: any): string {
  const dob = (a as any)?.date_of_birth ?? (a as any)?.dob;
  if (!dob) return '-';
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return '-';
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
  return age >= 0 ? String(age) : '-';
}

function getExperience(a: any): string {
  if (typeof (a as any)?.experience === 'string' && (a as any).experience.trim()) return (a as any).experience;
  const se = (a as any)?.skills_experience;
  if (se && typeof se.experience_abroad === 'boolean') return se.experience_abroad ? 'Abroad' : 'None';
  return '-';
}

export default function SelectedCvs() {
  const auth = getAuth();
  const isOwner = auth?.user?.role === 'admin';
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rows, setRows] = useState<Applicant[]>([]);
  const [partners, setPartners] = useState<any[]>([]);
  const [partnerFilter, setPartnerFilter] = useState<string>('all');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true); setError('');
      try {
        if (isOwner) {
          const [sel, pr] = await Promise.all([api.selectedApplicants(), api.listPartners()]);
          if (!cancelled) {
            setRows(Array.isArray(sel) ? sel : []);
            setPartners(Array.isArray(pr) ? pr : []);
          }
        } else {
          const sel = await api.selectedByUser(auth?.user?.id as any);
          if (!cancelled) setRows(Array.isArray(sel) ? sel : []);
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Failed to load');
      } finally { if (!cancelled) setLoading(false); }
    }
    load();
    return () => { cancelled = true; };
  }, [isOwner]);

  const [partnerMap, setPartnerMap] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isOwner || partners.length === 0) return;
    const map: Record<string, string> = {};
    partners.forEach((p: any) => {
      if (p?.id != null) map[String(p.id)] = p?.username ?? String(p.id);
    });
    setPartnerMap(map);
  }, [isOwner, partners]);

  const filtered = useMemo(() => {
    if (!isOwner || partnerFilter === 'all') return rows;
    return rows.filter((r: any) => String(r?.selected_by) === partnerFilter);
  }, [rows, isOwner, partnerFilter]);

  async function unselect(a: any) {
    try {
      const applicantId = (a as any).id ?? (a as any).applicant_id ?? (a as any).pk;
      const userId = isOwner ? a?.selected_by : auth?.user?.id;
      if (userId == null || applicantId == null) throw new Error('Missing ids');
      await api.selectApplicant(applicantId, userId); // toggle
      setRows(prev => prev.filter((x: any) => ((x.id ?? x.applicant_id ?? x.pk) !== applicantId)));
    } catch (e: any) {
      alert(e?.message || 'Failed to unselect');
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Selected Cvs</h1>

      {isOwner && (
        <div className="bg-white p-4 rounded shadow flex gap-3 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Partner</label>
            <select value={partnerFilter} onChange={(e) => setPartnerFilter(e.target.value)} className="border rounded px-3 py-2">
              <option value="all">All</option>
              {partners.map((p: any) => (
                <option key={p?.id ?? p?.username} value={String(p?.id)}>{p?.username ?? `#${p?.id}`}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      <div className="bg-white rounded shadow overflow-x-auto">
        {loading ? (
          <div className="p-4 text-gray-600">Loading...</div>
        ) : error ? (
          <div className="p-4 text-red-600">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="p-4 text-gray-600">No selected applicants.</div>
        ) : (
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-100 text-left text-sm">
                {/* Owner vs Partner different columns per spec */}
                <th className="py-2 px-3">Application No</th>
                <th className="py-2 px-3">Full Name</th>
                <th className="py-2 px-3">Passport No</th>
                <th className="py-2 px-3">Gender</th>
                <th className="py-2 px-3">Age</th>
                <th className="py-2 px-3">Experience</th>
                <th className="py-2 px-3">Works In</th>
                <th className="py-2 px-3">Religion</th>
                {isOwner && <th className="py-2 px-3">Labor ID</th>}
                <th className="py-2 px-3">Sponsor Name</th>
                <th className="py-2 px-3">Sponsor ID</th>
                <th className="py-2 px-3">Visa No</th>
                <th className="py-2 px-3">Partner</th>
                <th className="py-2 px-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a, idx) => (
                <tr key={(a as any).id ?? `${(a as any).passport_no || idx}` } className="border-t text-sm">
                  <td className="py-2 px-3">{(a as any).application_no || '-'}</td>
                  <td className="py-2 px-3">{a.full_name || '-'}</td>
                  <td className="py-2 px-3">{(a as any).passport_no || '-'}</td>
                  <td className="py-2 px-3">{a.gender || '-'}</td>
                  <td className="py-2 px-3">{computeAgeFromDOB(a)}</td>
                  <td className="py-2 px-3">{getExperience(a)}</td>
                  <td className="py-2 px-3">{(a as any)?.skills_experience?.works_in || '-'}</td>
                  <td className="py-2 px-3">{a.religion || '-'}</td>
                  {isOwner && <td className="py-2 px-3">{(a as any)?.other_information?.certificate_no || '-'}</td>}
                  <td className="py-2 px-3">{(a as any)?.sponsor_visa?.sponsor_name || '-'}</td>
                  <td className="py-2 px-3">{(a as any)?.sponsor_visa?.sponsor_id || '-'}</td>
                  <td className="py-2 px-3">{(a as any)?.sponsor_visa?.visa_no || '-'}</td>
                  <td className="py-2 px-3">{partnerMap[String((a as any).selected_by)] || String((a as any).selected_by ?? '-')}</td>
                  <td className="py-2 px-3">
                    <div className="flex gap-2">
                      <button className="px-2 py-1 text-blue-700 hover:underline" onClick={() => { /* TODO: view */ }}>View</button>
                      {isOwner && <button className="px-2 py-1 text-amber-700 hover:underline" onClick={() => { /* TODO: edit */ }}>Edit</button>}
                      <button className="px-2 py-1 text-amber-700 hover:underline" onClick={() => unselect(a)}>Unselect</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}