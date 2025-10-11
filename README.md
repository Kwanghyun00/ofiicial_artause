# Artause Web Platform

Next.js ������� �籸���� Artause ���� ������ �÷����Դϴ�. Supabase�� �鿣��� ����� ���� ������, ȫ�� �Ƿ�, �ʴ�� �̺�Ʈ�� ���� ������ �� ������, ������ ���� ���� ���� ������ �̺�Ʈ�� �� ������ Ȯ���ϰ� ������ �� �ֽ��ϴ�.

## �ֿ� ���

- **Ȩ**: ��ǥ ����, ���� �� ķ����, �ʴ�� �̺�Ʈ ���̶���Ʈ
- **Spotlight**: ���Ϳ� �˻��� ������ ���� ��� ��ī�̺�
- **Spotlight ��**: ������ ȫ�� ����Ʈ, ���� ����, �ʴ�� �̺�Ʈ ����
- **ȫ�� ��� ��**: ���� �׼� ��� Supabase ����, �̼��� �� ���� �������� ��ü
- **�ʴ�� �̺�Ʈ**: ���� ���� �̺�Ʈ ����Ʈ�� �ܺ� ���� ��ũ �ȳ�

Supabase ȯ�� ������ �������� ���� ��� `src/lib/mocks/performances.ts`�� ���ǵ� ���� �����ͷ� �ڵ� ����˴ϴ�.

## ��� ����

- Framework: [Next.js 15 (App Router)](https://nextjs.org/)
- Language: TypeScript, React Server Components
- Styling: Tailwind CSS (v4 preview), Ŀ���� ��ƿ��Ƽ Ŭ����
- Backend: Supabase (PostgreSQL, Edge Functions ���)
- Validation: Zod

## ������Ʈ ����

```
������ legacy_site/               # ���� ���� HTML �ڻ� ������
������ public/
��   ������ images/mock/           # ����� ��� ������
������ src/
��   ������ app/                   # App Router ������
��   ��   ������ (��ɺ� ����)
��   ��   ������ layout.tsx         # ���� ���̾ƿ� + Shell
��   ������ components/
��   ��   ������ forms/
��   ��   ������ layout/
��   ��   ������ marketing/         # ī��/���� ������Ʈ
��   ������ lib/
��   ��   ������ config.ts
��   ��   ������ models/            # Zod ��Ű��
��   ��   ������ mocks/             # Supabase �̻�� �� ��� ������
��   ��   ������ supabase/          # Ŭ���̾�Ʈ, ����, ���� ����
��   ������ styles/
������ supabase/
��   ������ migrations/0001_init.sql  # ����/ȫ��/�̺�Ʈ �⺻ ��Ű��
������ README.md
```

## ȯ�� ���� ����

`.env.local` ������ ������Ʈ ��Ʈ�� �����ϰ� ���� ���� ä�� �ּ���:

```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=optional-for-admin-scripts
SUPABASE_PERFORMANCE_BUCKET=performance-assets
```

���� ��� �ִ� ��� ���� �����ͷ� �ڵ� ��ȯ�ǹǷ� ���� UI Ȯ�θ� �ʿ��� ��� �����ص� �˴ϴ�.

## Supabase ������ �غ�

1. Supabase ������Ʈ�� ���� �� `supabase/migrations/0001_init.sql`�� �����մϴ�.
2. `performances`, `promotion_requests`, `ticket_campaigns`, `ticket_entries` ���̺��� �����˴ϴ�.
3. �ʱ� �����͸� �����ϸ� ��� �� UI�� �ݿ��˴ϴ�. (App Router�� �⺻������ ���� �������� ����մϴ�.)

## ���� ��ũ��Ʈ

```bash
npm install          # ������ ��ġ
npm run dev          # http://localhost:3000 ���� ����
npm run build        # ���δ��� ����
npm run lint         # ESLint �˻� (���� ȯ�濡 ���� �÷����� ��ġ�� �ʿ��� �� ����)
```

> ?? `npm run lint` ���� �� `eslint-plugin-react` ��� ���� ������ �߻��Ѵٸ� `npm install eslint-plugin-react@latest` �� �ٽ� �õ��� �ּ���.

## Vercel ���� ��

- Vercel ������Ʈ �������� Supabase ȯ�� ������ �߰��մϴ�.
- �̹��� �δ��� �ܺ� URL�� ����ϵ��� `next.config.ts`���� `images.remotePatterns`�� �̹� �����߽��ϴ�.
- Supabase Row Level Security�� ����ϴ� ��� ���� �׼ǿ� �ʿ��� ��å�� ���� ���� ������ �ּ���.

## ���Ž� �ڻ�

���� ���� ����Ʈ�� `legacy_site/` ������ �״�� �����߽��ϴ�. ���� HTML, CSV, ��ũ��Ʈ�� �����ϰų� ���̱׷��̼� �ڷ�� Ȱ���� �� �ֽ��ϴ�.

---

�ʿ��� �߰� �������� ���� ��ú��尡 �ִٸ� Supabase Row-Level Security�� Next.js Server Actions�� ������ ���� Ȯ���� �� �ֽ��ϴ�. �������� �̾ �۾��� �帱�Կ�!
