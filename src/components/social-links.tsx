import { Github, Twitter, Linkedin, Globe, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Writer } from "@/lib/writers";

interface SocialLinksProps {
  author: Writer;
}

export function SocialLinks({ author }: SocialLinksProps) {
  const { social } = author;
  const { twitter, github, linkedin, website, email } = social ?? {};

  if (!twitter && !github && !linkedin && !website && !email) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 justify-center md:justify-start">
      {twitter && (
        <Button variant="outline" size="sm" asChild>
          <a href={twitter} target="_blank" rel="noopener noreferrer">
            <Twitter className="h-4 w-4 mr-2" />X
          </a>
        </Button>
      )}

      {github && (
        <Button variant="outline" size="sm" asChild>
          <a href={github} target="_blank" rel="noopener noreferrer">
            <Github className="h-4 w-4 mr-2" />
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
