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
        <Button variant="outline" size="sm" asChild>
          <a href={twitter} target="_blank" rel="noopener noreferrer">
            <Image
              height="14"
              width="14"
              className="h-4 w-4 mr-2"
              alt="Twitter"
              src="https://cdn.simpleicons.org/x/ffffff"
            />
            X
          </a>
        </Button>
      )}

      {github && (
        <Button variant="outline" size="sm" asChild>
          <a href={github} target="_blank" rel="noopener noreferrer">
            <Image
              height="14"
              width="14"
              className="h-4 w-4 mr-2"
              alt="Github"
              src="https://cdn.simpleicons.org/github/ffffff"
            />
            GitHub
          </a>
        </Button>
      )}

      {linkedin && (
        <Button variant="outline" size="sm" asChild>
          <a href={linkedin} target="_blank" rel="noopener noreferrer">
            <Linkedin className="h-4 w-4 mr-2" />
            LinkedIn
          </a>
        </Button>
      )}

      {medium && (
        <Button variant="outline" size="sm" asChild>
          <a href={medium} target="_blank" rel="noopener noreferrer">
            <Image
              height="14"
              width="14"
              className="h-4 w-4 mr-2"
              alt="Medium"
              src="https://cdn.simpleicons.org/medium/ffffff"
            />
            Medium
          </a>
        </Button>
      )}

      {website && (
        <Button variant="outline" size="sm" asChild>
          <a href={website} target="_blank" rel="noopener noreferrer">
            <Globe className="h-4 w-4 mr-2" />
            Website
          </a>
        </Button>
      )}

      {email && (
        <Button variant="outline" size="sm" asChild>
          <a href={`mailto:${email}`}>
            <Mail className="h-4 w-4 mr-2" />
            Email
          </a>
        </Button>
      )}
    </div>
  );
}
