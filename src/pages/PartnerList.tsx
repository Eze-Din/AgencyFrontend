import { useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api';

interface UserRow {
  id?: number;
  username: string;
  password?: string;
  role: string;
  forgot_key?: string;
}

export default function PartnerList() {
  const [rows, setRows] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Record<string, Partial<UserRow>>>({});

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true); setError('');
      try {
        const list: any = await api.listUsers();
        if (!cancelled) setRows(Array.isArray(list) ? list : []);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Failed to load users');
      } finally { if (!cancelled) setLoading(false); }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(u =>
      String(u.id ?? '').includes(q) ||
      (u.username || '').toLowerCase().includes(q) ||
      (u.role || '').toLowerCase().includes(q)
    );
  }, [rows, search]);

  function onChange(username: string, key: keyof UserRow, value: string) {
    setEditing(prev => ({ ...prev, [username]: { ...prev[username], [key]: value } }));
  }

  async function save(username: string) {
    try {
      const patch = editing[username] || {};
      const current = rows.find(u => u.username === username);
      const payload = {
        password: patch.password,
        role: (patch.role ?? current?.role) as string | undefined,
        forgot_key: (patch.forgot_key ?? current?.forgot_key) as string | undefined,
      };
      await api.updateUser(username, payload);
      // Re-fetch to reflect server truth (and avoid local merge mistakes)
      const fresh: any = await api.listUsers();
      setRows(Array.isArray(fresh) ? fresh : []);
      setEditing(prev => { const cp = { ...prev }; delete cp[username]; return cp; });
    } catch (e: any) {
      alert(e?.message || 'Failed to update user');
    }
  }

  async function remove(username: string) {
    if (!confirm(`Delete user ${username}?`)) return;
    try {
      await api.deleteUser(username);
      setRows(prev => prev.filter(u => u.username !== username));
    } catch (e: any) {
      alert(e?.message || 'Failed to delete user');
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Partner List</h1>

      <div className="bg-white p-4 rounded shadow">
        <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
        <input className="border rounded px-3 py-2 w-full" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Id, Username, Role" />
      </div>

      <div className="bg-white rounded shadow overflow-x-auto">
        {loading ? (
          <div className="p-4 text-gray-600">Loading...</div>
        ) : error ? (
          <div className="p-4 text-red-600">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="p-4 text-gray-600">No users found.</div>
        ) : (
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-100 text-left text-sm">
                <th className="py-2 px-3">Id</th>
                <th className="py-2 px-3">Username</th>
                <th className="py-2 px-3">Password</th>
                <th className="py-2 px-3">Role</th>
                <th className="py-2 px-3">Forgot Key</th>
                <th className="py-2 px-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => {
                const edit = editing[u.username] || {};
                return (
                  <tr key={u.username} className="border-t text-sm">
                    <td className="py-2 px-3">{u.id ?? '-'}</td>
                    <td className="py-2 px-3">{u.username}</td>
                    <td className="py-2 px-3">
                      <input className="border rounded px-2 py-1 w-40" type="text" value={edit.password ?? ''} onChange={(e) => onChange(u.username, 'password', e.target.value)} placeholder="New password" />
                    </td>
                    <td className="py-2 px-3">
                      <select className="border rounded px-2 py-1" value={edit.role ?? u.role} onChange={(e) => onChange(u.username, 'role', e.target.value)}>
                        <option value="admin">admin</option>
                        <option value="partner">partner</option>
                      </select>
                    </td>
                    <td className="py-2 px-3">
                      <input className="border rounded px-2 py-1 w-40" type="text" value={edit.forgot_key ?? u.forgot_key ?? ''} onChange={(e) => onChange(u.username, 'forgot_key', e.target.value)} placeholder="Forgot key" />
                    </td>
                    <td className="py-2 px-3">
                      <div className="flex gap-2">
                        <button className="px-2 py-1 text-blue-700 hover:underline" onClick={() => save(u.username)}>Save</button>
                        <button className="px-2 py-1 text-red-700 hover:underline" onClick={() => remove(u.username)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
