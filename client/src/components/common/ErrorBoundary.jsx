import React from 'react';
import { FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';

/**
 * Standard React Error Boundary component
 * Catches render errors and displays a user-friendly fallback.
 */
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-center bg-gray-50">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mb-4">
            <FiAlertTriangle size={32} />
          </div>
          <h2 className="text-2xl font-black text-dark mb-2">Something went wrong</h2>
          <p className="text-gray-500 max-w-md mb-6">
            We encountered an unexpected error while rendering this page.
          </p>
          <button
            onClick={this.handleReload}
            className="btn-primary inline-flex items-center gap-2"
          >
            <FiRefreshCw /> Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

