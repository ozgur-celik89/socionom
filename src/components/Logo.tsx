import Link from "next/link";

export function Logo() {
  return (
    <Link aria-label="Socionom.se – startsida" className="logo" href="/">
      socionom<span>.se</span>
    </Link>
  );
}
