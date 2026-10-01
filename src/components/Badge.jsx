export default function Badge({ children, color, className = '' }) { return <span className={`badge ${className}`} style={color ? { color, borderColor: color } : undefined}>{children}</span>; }
