import { Component } from 'react';
export default class RouteErrorBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (!this.state.failed) return this.props.children;
    return <section className="placeholder container"><h1>THIS ARC DIDN’T LOAD.</h1><p role="alert">Try reloading. Your saved progress is still in this browser.</p><button className="button button-primary" onClick={() => window.location.reload()}>Reload page</button><a className="text-link" href="/">Back to home</a></section>;
  }
}
