---
description: 
globs: 
alwaysApply: true
---
# Next.js Asynchronous Params

In Next.js, particularly within Server Components, the `params` object passed to page components can be asynchronous or a Promise-like object. Direct synchronous access to properties of `params` might lead to warnings like `warnForSyncAccess`.

To ensure proper handling, especially in client components that receive `params` from a server component, it's recommended to either explicitly destructure the `params` object or await it if it's a Promise (though for basic `params` in client components, destructuring is usually sufficient).

**Example (in a Client Component receiving `params` from a Server Component):**
```typescript
// Before (might cause warnings)
export default function ChatPage({ params }: ChatPageProps) {
  const { chat_id } = params; // Direct synchronous access
  // ...
}

// After (recommended)

export default async function ChatPage({ params }: ChatPageProps) {
  const chatId = await params.chat_id; // Explicitly assign to a new variable or destructure early
  // Or if params itself is a Promise (less common for direct path params):
  // const { chat_id } = await params;
  // ...
}
```





