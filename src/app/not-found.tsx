export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-24 text-center">
      <p className="text-sm uppercase tracking-wide text-indigo-600">404</p>
      <h1 className="mt-4 text-3xl font-semibold text-slate-900">페이지를 찾을 수 없습니다</h1>
      <p className="mt-2 text-sm text-slate-600">요청하신 페이지가 존재하지 않거나 이동되었습니다.</p>
    </div>
  );
}
