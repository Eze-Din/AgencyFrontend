import { useEffect, useState } from 'react';
import { api } from '../lib/api';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [counts, setCounts] = useState({
    totalApplicants: 0,
    selectedApplicants: 0,
    activeCount: 0,
    inactiveCount: 0,
  });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const [total, selected, activeInactive] = await Promise.all([
          api.totalApplicants(),
          api.selectedApplicants(),
          api.activeInactiveApplicants(),
        ]);
        if (cancelled) return;
        const totalCount = extractNumber(total) ?? 0;
        const selectedCount = extractNumber(selected) ?? 0;
        const [activeCount, inactiveCount] = extractActiveInactive(activeInactive);
        setCounts({
          totalApplicants: totalCount,
          selectedApplicants: selectedCount,
          activeCount,
          inactiveCount,
        });
      } catch (err: any) {
        if (!cancelled) setError(err?.message || 'Failed to load metrics');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      {error && <div className="mb-4 text-red-600">{error}</div>}
      {loading ? (
        <div className="text-gray-600">Loading metrics...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard title="Total Applicants" value={counts.totalApplicants} />
          <StatCard title="Selected Applicants" value={counts.selectedApplicants} />
          <StatCard title="Active" value={counts.activeCount} />
          <StatCard title="Inactive" value={counts.inactiveCount} />
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: number | string }) {
  return (
    <div className="bg-white rounded shadow p-6">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-3xl font-bold">{value}</div>
    </div>
  );
}

function extractNumber(input: any): number | undefined {
  if (typeof input === 'number') return input;
  if (Array.isArray(input)) return input.length;
  if (typeof input === 'object' && input !== null) {
    const keys = Object.keys(input);
    if (keys.length === 1 && typeof (input as any)[keys[0]] === 'number') {
      return (input as any)[keys[0]] as number;
    }
  }
  return undefined;
}

function extractActiveInactive(input: any): [number, number] {
  // Attempt to normalize common shapes
  if (Array.isArray(input)) {
    const active = input.filter((x: any) => x?.is_active === true).length;
    const inactive = input.filter((x: any) => x?.is_active === false).length;
    return [active, inactive];
  }
  if (typeof input === 'object' && input !== null) {
    const a = Number((input as any).active ?? (input as any).activeCount ?? 0);
    const i = Number((input as any).inactive ?? (input as any).inactiveCount ?? 0);
    if (!Number.isNaN(a) || !Number.isNaN(i)) return [a || 0, i || 0];
  }
  return [0, 0];
}