import { SignUp } from "@clerk/react";

export default function SignUpPage() {
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
  return (
    <div className="flex min-h-[100dvh] w-full items-center justify-center relative bg-background">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-10 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none" />
      <div className="z-10 w-full max-w-[440px] px-4">
        <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} />
      </div>
    </div>
  );
}