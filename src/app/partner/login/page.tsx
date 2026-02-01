import { partnerLogin } from './actions';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Partner Login',
  description: 'Access the partner event center.',
};

export default async function PartnerLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const isInvalid = params.error === 'invalid';

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-xl items-center px-6 py-12">
      <div className="w-full rounded-3xl border border-slate-200 bg-white p-8 shadow-lg">
        <div className="mb-6 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Partner Access</p>
          <h1 className="text-3xl font-bold text-slate-900">Sign in to Event Center</h1>
          <p className="text-sm text-slate-600">
            Enter your partner email to manage campaigns and attendance.
          </p>
        </div>

        {isInvalid && (
          <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Please enter a valid email address.
          </div>
        )}

        <form action={partnerLogin} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="partner-email" className="text-sm font-medium text-slate-700">
              Partner Email
            </label>
            <Input
              id="partner-email"
              name="email"
              type="email"
              required
              placeholder="partner@example.com"
            />
          </div>

          <Button type="submit" className="w-full rounded-2xl">
            Continue
          </Button>
        </form>
      </div>
    </div>
  );
}
