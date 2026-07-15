import Image from "next/image";
import { Linkedin, Globe, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Writer } from "@/lib/writers";

interface SocialLinksProps {
  author: Writer;
}

export function SocialLinks({ author }: SocialLinksProps) {
  const { social } = author;
  const { twitter, github, linkedin, website, email, medium } = social ?? {};

  if (!twitter && !github && !linkedin && !website && !email && !medium) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 justify-center md:justify-start">
      {twitter && (
        <Button variant="outline" size="icon" asChild>
          <a
            href={twitter}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="X"
            title="X"
          >
            <Image
              height="16"
              width="16"
              className="h-4 w-4"
              alt="X"
              src="https://cdn.simpleicons.org/x/000000"
            />
          </a>
        </Button>
      )}

      {github && (
        <Button variant="outline" size="icon" asChild>
          <a
            href={github}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            title="GitHub"
          >
            <Image
              height="16"
              width="16"
              className="h-4 w-4"
              alt="GitHub"
              src="https://cdn.simpleicons.org/github/000000"
            />
          </a>
        </Button>
      )}

      {linkedin && (
        <Button variant="outline" size="icon" asChild>
          <a
            href={linkedin}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            title="LinkedIn"
          >
            <Linkedin className="h-4 w-4 text-black" />
          </a>
        </Button>
      )}

      {medium && (
        <Button variant="outline" size="icon" asChild>
          <a
            href={medium}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Medium"
            title="Medium"
          >
            <Image
              height="16"
              width="16"
              className="h-4 w-4"
              alt="Medium"
              src="https://cdn.simpleicons.org/medium/000000"
            />
          </a>
        </Button>
      )}

      {website && (
        <Button variant="outline" size="icon" asChild>
          <a
            href={website}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Website"
            title="Website"
          >
            <Globe className="h-4 w-4 text-black" />
          </a>
        </Button>
      )}

      {email && (
        <Button variant="outline" size="icon" asChild>
          <a href={`mailto:${email}`} aria-label="Email" title="Email">
            <Mail className="h-4 w-4 text-black" />
          </a>
        </Button>
      )}
    </div>
  );
}
