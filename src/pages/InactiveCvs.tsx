import { useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api';
import type { Applicant } from '../types';

export default function InactiveCvs() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rows, setRows] = useState<Applicant[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true); setError('');
      try {
        const list: any = await api.listApplicants();
        if (!cancelled) setRows((Array.isArray(list) ? list : []).filter((x: any) => x?.is_active === false));
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Failed to load');
      } finally { if (!cancelled) setLoading(false); }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return rows;
    const q = search.trim().toLowerCase();
    return rows.filter(a =>
      (a.full_name || '').toLowerCase().includes(q) ||
      (a as any).passport_no?.toLowerCase?.().includes(q) ||
      (a as any)?.other_information?.certificate_no?.toLowerCase?.().includes(q)
    );
  }, [rows, search]);

  async function reactivate(a: any) {
    try {
      const id = (a as any).id ?? (a as any).applicant_id ?? (a as any).pk;
      if (id == null) throw new Error('Missing id');
      await api.toggleActive(id);
      setRows(prev => prev.filter((x: any) => ((x.id ?? x.applicant_id ?? x.pk) !== id)));
    } catch (e: any) {
      alert(e?.message || 'Failed to reactivate');
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Inactive Cvs</h1>

      <div className="bg-white p-4 rounded shadow">
        <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
        <input className="border rounded px-3 py-2 w-full" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Name, Passport No, Labor ID" />
      </div>

      <div className="bg-white rounded shadow overflow-x-auto">
        {loading ? (
          <div className="p-4 text-gray-600">Loading...</div>
        ) : error ? (
          <div className="p-4 text-red-600">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="p-4 text-gray-600">No inactive applicants.</div>
        ) : (
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-100 text-left text-sm">
                <th className="py-2 px-3">#</th>
                <th className="py-2 px-3">Full Name</th>
                <th className="py-2 px-3">Passport No</th>
                <th className="py-2 px-3">Gender</th>
                <th className="py-2 px-3">Works In</th>
                <th className="py-2 px-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a, idx) => (
                <tr key={(a as any).id ?? `${(a as any).passport_no || idx}` } className="border-t text-sm">
                  <td className="py-2 px-3">{idx + 1}</td>
                  <td className="py-2 px-3">{a.full_name || '-'}</td>
                  <td className="py-2 px-3">{(a as any).passport_no || '-'}</td>
                  <td className="py-2 px-3">{a.gender || '-'}</td>
                  <td className="py-2 px-3">{(a as any)?.skills_experience?.works_in || '-'}</td>
                  <td className="py-2 px-3">
                    <button className="px-2 py-1 text-green-700 hover:underline" onClick={() => reactivate(a)}>
                      Reactivate
                    </button>
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