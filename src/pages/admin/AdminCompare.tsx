import { useRef, useCallback, type MouseEvent } from 'react';
import { useCompareData, type CompareFieldInfo, type CompareEndpointInfo } from '@/hooks/useAdminApi';

function B({ v }: { v: boolean }) {
  return v ? (
    <span className="badge badge-success badge-xs">Yes</span>
  ) : (
    <span className="badge badge-error badge-xs">No</span>
  );
}

function useColumnResize() {
  const tableRef = useRef<HTMLTableElement>(null);

  const onMouseDown = useCallback((e: MouseEvent<HTMLDivElement>, colIndex: number) => {
    e.preventDefault();
    const table = tableRef.current;
    if (!table) return;

    const th = table.querySelectorAll('thead th')[colIndex] as HTMLTableCellElement;
    if (!th) return;

    const startX = e.clientX;
    const startWidth = th.offsetWidth;

    const ths = table.querySelectorAll('thead th') as NodeListOf<HTMLTableCellElement>;
    ths.forEach(t => { t.style.width = `${t.offsetWidth}px`; });
    table.style.tableLayout = 'fixed';

    const onMouseMove = (ev: globalThis.MouseEvent) => {
      const newWidth = Math.max(40, startWidth + ev.clientX - startX);
      th.style.width = `${newWidth}px`;
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, []);

  return { tableRef, onMouseDown };
}

function ResizableTh({ children, index, onMouseDown, className = '' }: {
  children: React.ReactNode;
  index: number;
  onMouseDown: (e: MouseEvent<HTMLDivElement>, colIndex: number) => void;
  className?: string;
}) {
  return (
    <th className={`relative ${className}`}>
      {children}
      <div
        className="absolute right-0 top-0 bottom-0 w-1.5 cursor-col-resize hover:bg-primary/30"
        onMouseDown={e => onMouseDown(e, index)}
      />
    </th>
  );
}

function SectionRow({ children, cols = 6 }: { children: React.ReactNode; cols?: number }) {
  return (
    <tr className="bg-base-300 font-semibold text-secondary">
      <td colSpan={cols}>{children}</td>
    </tr>
  );
}

type ModifiedBy = 'ETL' | 'Dig' | 'ETL + Dig' | '—';

function ModBadge({ modified }: { modified: boolean }) {
  return modified ? (
    <span className="badge badge-success badge-xs">Yes</span>
  ) : (
    <span className="badge badge-error badge-xs">No</span>
  );
}

function ByBadge({ by }: { by: string }) {
  if (by === '—') return <span className="text-xs text-base-content/40">—</span>;
  const cls = by === 'ETL' ? 'badge-info' : by === 'Dig' ? 'badge-warning' : 'badge-accent';
  return <span className={`badge ${cls} badge-xs`}>{by}</span>;
}

function Undocumented({ text }: { text: string }) {
  if (text === '(undocumented)') {
    return <span className="italic text-base-content/30">(undocumented)</span>;
  }
  return <>{text}</>;
}

function FieldRow({ f }: { f: CompareFieldInfo }) {
  return (
    <tr>
      <td><code className="text-xs">{f.field}</code></td>
      <td><B v={f.inRb} /></td>
      <td className="text-xs text-base-content/60"><Undocumented text={f.rbDesc} /></td>
      <td><B v={f.inAt} /></td>
      <td className="text-xs text-base-content/60"><Undocumented text={f.atDesc} /></td>
      <td><ModBadge modified={f.modified} /></td>
      <td><ByBadge by={f.modifiedBy} /></td>
    </tr>
  );
}

function FieldsTable({ imported, dropped, astrotuneOnly }: {
  imported: CompareFieldInfo[];
  dropped: CompareFieldInfo[];
  astrotuneOnly: CompareFieldInfo[];
}) {
  const { tableRef, onMouseDown } = useColumnResize();
  const headers = ['Field', 'RB', 'Radio Browser Purpose', 'AT', 'AstroTune Purpose', 'Modified', 'By'];

  return (
    <div className="overflow-x-auto">
      <table ref={tableRef} className="table table-xs">
        <thead>
          <tr>
            {headers.map((h, i) => (
              <ResizableTh key={h} index={i} onMouseDown={onMouseDown}>{h}</ResizableTh>
            ))}
          </tr>
        </thead>
        <tbody>
          <SectionRow cols={7}>Imported fields ({imported.length})</SectionRow>
          {imported.map(f => <FieldRow key={f.field} f={f} />)}
          <SectionRow cols={7}>Dropped fields ({dropped.length})</SectionRow>
          {dropped.map(f => <FieldRow key={f.field} f={f} />)}
          <SectionRow cols={7}>AstroTune-only fields ({astrotuneOnly.length})</SectionRow>
          {astrotuneOnly.map(f => <FieldRow key={f.field} f={f} />)}
        </tbody>
      </table>
    </div>
  );
}

function EndpointRow({ ep, inRb, inAt }: { ep: CompareEndpointInfo; inRb: boolean; inAt: boolean }) {
  return (
    <tr>
      <td><code className="text-xs">{ep.endpoint}</code></td>
      <td><B v={inRb} /></td>
      <td><B v={inAt} /></td>
      <td className="text-xs text-base-content/60"><Undocumented text={ep.notes || '—'} /></td>
    </tr>
  );
}

function EndpointsTable({ compatible, radioBrowserOnly, astrotuneOnly }: {
  compatible: CompareEndpointInfo[];
  radioBrowserOnly: CompareEndpointInfo[];
  astrotuneOnly: CompareEndpointInfo[];
}) {
  const { tableRef, onMouseDown } = useColumnResize();
  const headers = ['Endpoint', 'Radio Browser', 'AstroTune', 'Notes'];

  return (
    <div className="overflow-x-auto">
      <table ref={tableRef} className="table table-xs">
        <thead>
          <tr>
            {headers.map((h, i) => (
              <ResizableTh key={h} index={i} onMouseDown={onMouseDown}>{h}</ResizableTh>
            ))}
          </tr>
        </thead>
        <tbody>
          <SectionRow cols={4}>Compatible endpoints ({compatible.length})</SectionRow>
          {compatible.map(ep => <EndpointRow key={ep.endpoint} ep={ep} inRb inAt />)}
          <SectionRow cols={4}>Radio Browser only ({radioBrowserOnly.length})</SectionRow>
          {radioBrowserOnly.map(ep => <EndpointRow key={ep.endpoint} ep={ep} inRb inAt={false} />)}
          <SectionRow cols={4}>AstroTune only ({astrotuneOnly.length})</SectionRow>
          {astrotuneOnly.map(ep => <EndpointRow key={ep.endpoint} ep={ep} inRb={false} inAt />)}
        </tbody>
      </table>
    </div>
  );
}

function EtlTable({ steps }: { steps: { name: string; description: string }[] }) {
  const { tableRef, onMouseDown } = useColumnResize();
  const headers = ['Step', 'What it does'];

  return (
    <div className="overflow-x-auto">
      <table ref={tableRef} className="table table-xs">
        <thead>
          <tr>
            {headers.map((h, i) => (
              <ResizableTh key={h} index={i} onMouseDown={onMouseDown}>{h}</ResizableTh>
            ))}
          </tr>
        </thead>
        <tbody>
          {steps.map(s => (
            <tr key={s.name}>
              <td className="font-medium">{s.name}</td>
              <td className="text-xs text-base-content/60">{s.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BehavioralTable({ diffs }: { diffs: { aspect: string; radioBrowser: string; astrotune: string }[] }) {
  const { tableRef, onMouseDown } = useColumnResize();
  const headers = ['Aspect', 'Radio Browser', 'AstroTune'];

  return (
    <div className="overflow-x-auto">
      <table ref={tableRef} className="table table-xs">
        <thead>
          <tr>
            {headers.map((h, i) => (
              <ResizableTh key={h} index={i} onMouseDown={onMouseDown}>{h}</ResizableTh>
            ))}
          </tr>
        </thead>
        <tbody>
          {diffs.map(d => (
            <tr key={d.aspect}>
              <td className="font-medium">{d.aspect}</td>
              <td className="text-xs text-base-content/60">{d.radioBrowser}</td>
              <td className="text-xs text-base-content/60">{d.astrotune}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function AdminCompare() {
  const { data, loading, error } = useCompareData();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="alert alert-error">
        <span>Failed to load compare data: {error}</span>
      </div>
    );
  }

  const { fields, endpoints, etlSteps, behavioral } = data;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold mb-2">AstroTune vs Radio Browser API</h2>
        <p className="text-base-content/60 text-sm mb-4">Complete field comparison and architectural differences</p>

        <div className="flex flex-wrap gap-3">
          <div className="stat bg-base-200 rounded-lg p-4 w-40">
            <div className="stat-value text-2xl text-primary">{fields.counts.radioBrowser}</div>
            <div className="stat-desc">Radio Browser fields</div>
          </div>
          <div className="stat bg-base-200 rounded-lg p-4 w-40">
            <div className="stat-value text-2xl text-primary">{fields.counts.imported}</div>
            <div className="stat-desc">Fields imported</div>
          </div>
          <div className="stat bg-base-200 rounded-lg p-4 w-40">
            <div className="stat-value text-2xl text-primary">{fields.counts.dropped}</div>
            <div className="stat-desc">Fields dropped</div>
          </div>
          <div className="stat bg-base-200 rounded-lg p-4 w-40">
            <div className="stat-value text-2xl text-primary">{fields.counts.astrotuneOnly}</div>
            <div className="stat-desc">AstroTune-only fields</div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Station Fields</h3>
        <FieldsTable
          imported={fields.imported}
          dropped={fields.dropped}
          astrotuneOnly={fields.astrotuneOnly}
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">API Endpoints</h3>
        <EndpointsTable
          compatible={endpoints.compatible}
          radioBrowserOnly={endpoints.radioBrowserOnly}
          astrotuneOnly={endpoints.astrotuneOnly}
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">ETL Transform Pipeline</h3>
        <EtlTable steps={etlSteps} />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Key Behavioral Differences</h3>
        <BehavioralTable diffs={behavioral} />
      </div>
    </div>
  );
}
