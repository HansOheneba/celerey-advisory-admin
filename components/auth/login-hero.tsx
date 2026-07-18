import Image from "next/image";

export function LoginHero() {
  return (
    <div className="relative hidden lg:block">
      <Image
        src="/login/img2.png"
        alt=""
        fill
        priority
        className="object-cover"
        sizes="(min-width: 1024px) 50vw, 0px"
      />
    </div>
  );
}
