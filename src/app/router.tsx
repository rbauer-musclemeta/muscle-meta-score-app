import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { HomePage } from "@/features/home/pages/HomePage";
import { SignInPage } from "@/features/auth/pages/SignInPage";
import { CatabolicQuizPage } from "@/features/catabolic-crisis/pages/CatabolicQuizPage";
import { FunctionalScorecardPage } from "@/features/functional-scorecard/pages/FunctionalScorecardPage";
import { ResultPage } from "@/features/results/pages/ResultPage";
import { DashboardPage } from "@/features/dashboard/pages/DashboardPage";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/sign-in" element={<SignInPage />} />
        <Route
          path="/assessment/catabolic-crisis"
          element={
            <ProtectedRoute>
              <CatabolicQuizPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/assessment/functional-scorecard"
          element={
            <ProtectedRoute>
              <FunctionalScorecardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/results/:submissionId"
          element={
            <ProtectedRoute>
              <ResultPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

