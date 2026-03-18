import { useEffect, useRef, useState } from 'react';

export function PageSection({ title, description, action, children }) {
  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h3>{title}</h3>
          {description ? <p>{description}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function StatCard({ title, value, subtitle }) {
  return (
    <div className="stat-card">
      <span>{title}</span>
      <strong>{value}</strong>
      <small>{subtitle}</small>
    </div>
  );
}

export function DataTable({ columns, rows, emptyText = 'Nenhum registro encontrado.' }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>{columns.map((column) => <th key={column.key}>{column.label}</th>)}</tr>
        </thead>
        <tbody>
          {rows.length ? rows.map((row, index) => (
            <tr key={row.id || index}>
              {columns.map((column) => <td key={column.key}>{column.render ? column.render(row) : row[column.key]}</td>)}
            </tr>
          )) : (
            <tr>
              <td colSpan={columns.length} className="empty-cell">{emptyText}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export function SignaturePad({ value, onChange }) {
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#0f172a';
    if (value) {
      const image = new Image();
      image.onload = () => ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      image.src = value;
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, [value]);

  const getPoint = (event) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const source = event.touches ? event.touches[0] : event;
    return { x: source.clientX - rect.left, y: source.clientY - rect.top };
  };

  const start = (event) => {
    const point = getPoint(event);
    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
    setDrawing(true);
  };

  const move = (event) => {
    if (!drawing) return;
    const point = getPoint(event);
    const ctx = canvasRef.current.getContext('2d');
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
    onChange(canvasRef.current.toDataURL('image/png'));
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    onChange('');
  };

  return (
    <div className="signature-box">
      <canvas
        ref={canvasRef}
        width="420"
        height="160"
        onMouseDown={start}
        onMouseMove={move}
        onMouseUp={() => setDrawing(false)}
        onMouseLeave={() => setDrawing(false)}
        onTouchStart={start}
        onTouchMove={move}
        onTouchEnd={() => setDrawing(false)}
      />
      <button type="button" className="secondary-btn" onClick={clear}>Limpar assinatura</button>
    </div>
  );
}

export function StatusBadge({ children, tone = 'neutral' }) {
  return <span className={`status-badge ${tone}`}>{children}</span>;
}
