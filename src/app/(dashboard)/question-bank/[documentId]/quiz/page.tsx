import { Suspense } from "react";
import QuestionBankQuizPage from "./page-client";
import { Spinner } from "@/components/ui/spinner";

export default function QuestionBankQuizPageWrapper() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-20">
          <Spinner className="h-8 w-8" />
        </div>
      }
    >
      <QuestionBankQuizPage />
    </Suspense>
  );
}
