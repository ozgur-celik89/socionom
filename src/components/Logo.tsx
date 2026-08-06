import Image from "next/image";
import Link from "next/link";

type LogoProps = {
  withMark?: boolean;
};

export function Logo({ withMark = false }: LogoProps) {
  return (
    <Link
      aria-label="Socionom.se – startsida"
      className={`logo${withMark ? " logo-svg" : ""}`}
      href="/"
    >
      {withMark ? (
        <Image
          alt=""
          className="logo-image"
          height={64}
          src="/socionom-logo.svg"
          unoptimized
          width={349}
        />
      ) : (
        <span className="logo-wordmark">
          socionom<span className="logo-suffix">.se</span>
        </span>
      )}
    </Link>
  );
}
