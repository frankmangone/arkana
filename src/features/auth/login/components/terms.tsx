import Link from "next/link";

interface TermsProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dictionary: any;
}

export function Terms(props: TermsProps) {
  const { dictionary } = props;

  return (
    <span className="text-xs text-muted-foreground block text-center mt-6">
      {dictionary.login.termsText || "By continuing, you agree to our"}{" "}
      <Link
        href={dictionary.login.termsLink || "/terms"}
        className="text-primary-750 hover:text-primary-650 transition-colors"
      >
        {dictionary.login.termsOfService || "Terms of Service"}
      </Link>{" "}
      {dictionary.login.and || "and"}{" "}
      <Link
        href={dictionary.login.privacyLink || "/privacy"}
        className="text-primary-750 hover:text-primary-650 transition-colors"
      >
        {dictionary.login.privacyPolicy || "Privacy Policy"}
      </Link>
    </span>
  );
}
