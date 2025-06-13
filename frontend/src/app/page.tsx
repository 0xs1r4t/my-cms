import AuthWrapper from "@/components/AuthWrapper";

export default function Home() {
  return (
    <div className="flex justify-center items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-authentic-sans)]">
      <main className="flex flex-col items-center justify-items-center sm:items-start">
        <AuthWrapper>{""}</AuthWrapper>
      </main>
    </div>
  );
}
