import React from 'react';

type ErrorBoundaryProps = {
  children: React.ReactNode;
  onReset: () => void;
  fallback: (props: { resetError: () => void }) => React.ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  resetError = () => {
    this.props.onReset();
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return this.props.fallback({ resetError: this.resetError });
    }

    return this.props.children;
  }
}
