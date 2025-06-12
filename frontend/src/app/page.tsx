import Link from "next/link";

export default function Home() {
  return (
    <div className="flex justify-center items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-authentic-sans)]">
      <main className="flex flex-col items-center justify-items-center sm:items-start">
        <h1>SIRAT{"'"}S CMS</h1>
        <p>
          Sirat Baweja{"'"}s personal, self-hosted, content management system.
          To be built with every tool she might possibly need.
        </p>
        <p>
          view content via ↗️{" "}
          <Link href="https://content.sirat.xyz/docs" target="_blank">
            my api
          </Link>
        </p>
      </main>
    </div>
  );
}
