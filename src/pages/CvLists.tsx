import { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import type { Applicant, Auth } from "../types";
import { useNavigate } from "react-router-dom";

function getAuth(): Auth | null {
  const raw = localStorage.getItem("auth");
  if (!raw) return null;
  try { return JSON.parse(raw) as Auth; } catch { return null; }
}

export default function CvLists() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [applicants, setApplicants] = useState<Applicant[]>([]);

  // Filters
  const [search, setSearch] = useState("");
  const [gender, setGender] = useState<string>("all");
  // Removed status and selected filters per spec

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const auth = getAuth();
  const isOwner = auth?.user?.role === 'admin';
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const res = await api.listApplicants();
        if (!cancelled) setApplicants(Array.isArray(res) ? res : []);
      } catch (err: any) {
        if (!cancelled) setError(err?.message || "Failed to load applicants");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    let list = applicants;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(a =>
        (a.full_name || "").toLowerCase().includes(q) ||
        (a.passport_no || "").toLowerCase().includes(q) ||
        (a.other_information?.certificate_no || "").toLowerCase().includes(q)
      );
    }
    if (gender !== 'all') {
      list = list.filter(a => (a.gender || '').toLowerCase() === gender.toLowerCase());
    }
    // Only show active and not-selected applicants on CV Lists
    list = list.filter(a => a.is_active !== false && a.is_selected !== true);
    return list;
  }, [applicants, search, gender]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  useEffect(() => {
    // Reset to first page when filters change
    setPage(1);
  }, [search, gender, pageSize]);

  async function resolveUserId(): Promise<number> {
    const authObj = getAuth();
    const existing = (authObj as any)?.user?.id;
    if (existing != null) return existing as number;
    const username = (authObj?.user?.username || '').toLowerCase();
    if (!username) throw new Error('Could not resolve partner id (no username)');

    // Try users list first
    try {
      const users: any = await api.listUsers();
      if (Array.isArray(users)) {
        const u = users.find((x: any) => (x?.username || '').toLowerCase() === username);
        if (u?.id != null) {
          const newAuth = { ...authObj, user: { ...authObj?.user, id: u.id } } as any;
          localStorage.setItem('auth', JSON.stringify(newAuth));
          return Number(u.id);
        }
      }
    } catch {}

    // Fallback: partners list
    try {
      const partners: any = await api.listPartners();
      if (Array.isArray(partners)) {
        const p = partners.find((x: any) => (x?.username || '').toLowerCase() === username || String(x?.id) === username);
        if (p?.id != null) {
          const newAuth = { ...authObj, user: { ...authObj?.user, id: p.id } } as any;
          localStorage.setItem('auth', JSON.stringify(newAuth));
          return Number(p.id);
        }
      }
    } catch {}

    throw new Error('Could not resolve partner id');
  }

  async function resolveApplicantId(a: any): Promise<number> {
    const direct = (a as any).id ?? (a as any).applicant_id ?? (a as any).pk;
    if (direct != null) return Number(direct);
    const passport = (a as any).passport_no;
    const list: any = await api.listApplicants();
    const match = Array.isArray(list) ? list.find((x: any) => x?.passport_no === passport) : null;
    const id = match?.id ?? match?.applicant_id ?? match?.pk;
    if (id == null) throw new Error('Could not resolve applicant id');
    return Number(id);
  }

  async function selectRow(a: any) {
    try {
      const [userId, applicantId] = await Promise.all([
        resolveUserId(),
        resolveApplicantId(a),
      ]);
      await api.selectApplicant(applicantId, userId);
      setApplicants(prev => prev.map((x: any) => {
        const xid = (x as any).id ?? (x as any).applicant_id ?? (x as any).pk;
        return Number(xid) === Number(applicantId) ? { ...x, is_selected: true, selected_by: userId } : x;
      }));
    } catch (e: any) {
      alert(e?.message || 'Failed to select');
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">CV Lists</h1>

      {/* Filters */}
      <div className="bg-white p-4 rounded shadow flex flex-col md:flex-row gap-3 md:items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
          <input
            type="text"
            placeholder="Name, Passport No, Labor ID"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
          <select value={gender} onChange={(e) => setGender(e.target.value)} className="border rounded px-3 py-2">
            <option value="all">All</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>
                <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Page size</label>
          <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} className="border rounded px-3 py-2">
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded shadow overflow-x-auto">
        {loading ? (
          <div className="p-4 text-gray-600">Loading...</div>
        ) : error ? (
          <div className="p-4 text-red-600">{error}</div>
        ) : pageItems.length === 0 ? (
          <div className="p-4 text-gray-600">No applicants found.</div>
        ) : (
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-100 text-left text-sm">
                <th className="py-2 px-3">#</th>
                <th className="py-2 px-3">Full Name</th>
                <th className="py-2 px-3">Passport No</th>
                <th className="py-2 px-3">Gender</th>
                <th className="py-2 px-3">Age</th>
                <th className="py-2 px-3">Experience</th>
                <th className="py-2 px-3">Works In</th>
                <th className="py-2 px-3">Religion</th>
                {isOwner && <th className="py-2 px-3">Labor ID</th>}
                <th className="py-2 px-3">Actions</th>
                {isOwner && <th className="py-2 px-3">Danger</th>}
              </tr>
            </thead>
            <tbody>
              {pageItems.map((a, idx) => (
                <tr key={(a as any).id ?? `${(a as any).passport_no || idx}` } className="border-t text-sm">
                  <td className="py-2 px-3">{(currentPage - 1) * pageSize + idx + 1}</td>
                  <td className="py-2 px-3">{a.full_name || '-'}</td>
                  <td className="py-2 px-3">{(a as any).passport_no || '-'}</td>
                  <td className="py-2 px-3">{a.gender || '-'}</td>
                  <td className="py-2 px-3">{computeAgeFromDOB(a)}</td>
                  <td className="py-2 px-3">{getExperience(a)}</td>
                  <td className="py-2 px-3">{getWorksIn(a)}</td>
                  <td className="py-2 px-3">{a.religion || '-'}</td>
                  {isOwner && (
                    <td className="py-2 px-3">{getLaborId(a)}</td>
                  )}
                  <td className="py-2 px-3">
                    <div className="flex gap-2">
                      <button className="px-2 py-1 text-blue-700 hover:underline" onClick={() => { /* TODO: view CV template */ }}>
                        View
                      </button>
                      {isOwner ? (
                        <button
                          className="px-2 py-1 text-amber-700 hover:underline"
                          onClick={() => navigate('/dashboard/create-cv', { state: { applicant: a } })}
                        >
                          Edit
                        </button>
                      ) : (
                        <button className="px-2 py-1 text-green-700 hover:underline" onClick={() => selectRow(a)}>
                          Select
                        </button>
                      )}
                    </div>
                  </td>
                  {isOwner && (
                    <td className="py-2 px-3">
                      <button className="px-2 py-1 text-red-700 hover:underline" onClick={() => handleDelete(a)}>
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Showing {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, filtered.length)} of {filtered.length}
        </div>
        <div className="flex gap-2">
          <button
            className="px-3 py-1 border rounded disabled:opacity-50"
            disabled={currentPage <= 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
          >
            Prev
          </button>
          <span className="px-2 py-1 text-sm">Page {currentPage} / {totalPages}</span>
          <button
            className="px-3 py-1 border rounded disabled:opacity-50"
            disabled={currentPage >= totalPages}
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

function computeAgeFromDOB(a: any): string {
  const dob = a?.date_of_birth ?? a?.dob;
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
  if (typeof a?.experience === 'string' && a.experience.trim()) return a.experience;
  const se = a?.skills_experience;
  if (se && typeof se.experience_abroad === 'boolean') return se.experience_abroad ? 'Abroad' : 'None';
  return '-';
}

function getWorksIn(a: any): string {
  return a?.skills_experience?.works_in || '-';
}

function getLaborId(a: any): string {
  return a?.other_information?.certificate_no || '-';
}

async function handleDelete(a: any) {
  if (!confirm('Delete this applicant?')) return;
  try {
    const id = (a as any).id ?? (a as any).applicant_id ?? (a as any).pk;
    if (id == null) throw new Error('Missing applicant id');
    await api.deleteApplicant(id);
    location.reload();
  } catch (e: any) {
    alert(e?.message || 'Failed to delete');
  }
}

async function handleSelect(a: any) {
  try {
    const auth = getAuth();
    const userId = auth?.user?.id;
    const applicantId = (a as any).id ?? (a as any).applicant_id ?? (a as any).pk;
    if (userId == null || applicantId == null) throw new Error('Missing user/applicant id');
    await api.selectApplicant(applicantId, userId);
    alert('Selected successfully');
  } catch (e: any) {
    alert(e?.message || 'Failed to select');
  }
}