import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    setTimeout(() => {
      this.setState({ errorInfo });
    }, 1);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "40px", color: "red", backgroundColor: "white", fontFamily: "monospace" }}>
          <h1 style={{ fontSize: "24px" }}>Something went wrong.</h1>
          <h2 style={{ fontSize: "18px", marginTop: "20px" }}>{this.state.error?.message}</h2>
          <pre style={{ marginTop: "20px", whiteSpace: "pre-wrap", overflowX: "auto", padding: "10px", background: "#f0f0f0" }}>
            {this.state.error?.stack}
          </pre>
          {this.state.errorInfo && (
            <pre style={{ marginTop: "20px", whiteSpace: "pre-wrap", overflowX: "auto", padding: "10px", background: "#f0f0f0" }}>
              {this.state.errorInfo.componentStack}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
