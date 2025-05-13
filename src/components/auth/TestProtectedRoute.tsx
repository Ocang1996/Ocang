import { ReactNode } from 'react';

interface TestProtectedRouteProps {
  children: ReactNode;
}

/**
 * Versi khusus ProtectedRoute untuk testing
 * Tidak memerlukan autentikasi dan selalu menampilkan children
 */
const TestProtectedRoute = ({ children }: TestProtectedRouteProps) => {
  return <>{children}</>;
};

export default TestProtectedRoute;
