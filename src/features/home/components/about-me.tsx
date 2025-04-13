import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";

interface AboutMeProps {
  lang: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dictionary: any;
}

export function AboutMe({ dictionary }: AboutMeProps) {
  return (
    <section className="py-6">
      <h2 className="text-3xl font-bold mb-6">
        {dictionary.home.aboutMe.title}
      </h2>
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="relative w-48 h-48 rounded-full overflow-hidden">
              <Image
                src="/placeholder.svg?height=192&width=192"
                alt="Profile"
                width={192}
                height={192}
                className="object-cover"
              />
            </div>
            <div className="flex-1 space-y-4">
              <h3 className="text-2xl font-semibold">
                {dictionary.home.aboutMe.name}
              </h3>
              <p className="text-muted-foreground">
                {dictionary.home.aboutMe.bio}
              </p>
              <div className="flex gap-4">
                <a
                  href="https://twitter.com/yourusername"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Twitter
                </a>
                <a
                  href="https://github.com/yourusername"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  GitHub
                </a>
                <a
                  href="https://linkedin.com/in/yourusername"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  LinkedIn
                </a>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
