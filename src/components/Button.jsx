import { Link } from 'react-router-dom';
export default function Button({ to, variant = 'primary', children, className = '', type = 'button', ...props }) {
  const classes = `button button-${variant} ${className}`;
  return to ? <Link to={to} className={classes} {...props}>{children}</Link> : <button type={type} className={classes} {...props}>{children}</button>;
}
