import "server-only";
import type { Post } from "./types";
import { cache } from "react";

// This would be replaced with a real database in a production app
const mockPosts: Post[] = [
  {
    id: "1",
    title: "Getting Started with Next.js 14",
    slug: "getting-started-with-nextjs-14",
    date: "2023-11-10",
    excerpt:
      "Learn how to build modern web applications with Next.js 14 and its new features.",
    content:
      "# Getting Started with Next.js 14\n\nNext.js 14 introduces several new features...",
    coverImage: "/placeholder.svg?height=600&width=1200",
    tags: ["nextjs", "react", "webdev"],
    author: {
      name: "John Doe",
      image: "/placeholder.svg?height=100&width=100",
    },
    readingTime: 5,
    likes: 42,
    featured: true,
  },
  {
    id: "2",
    title: "Building a Multilingual Blog with Next.js",
    slug: "building-multilingual-blog-nextjs",
    date: "2023-11-05",
    excerpt:
      "A comprehensive guide to implementing internationalization in your Next.js blog.",
    content:
      "# Building a Multilingual Blog with Next.js\n\nInternationalization (i18n) is essential...",
    coverImage: "/placeholder.svg?height=600&width=1200",
    tags: ["i18n", "nextjs", "tutorial"],
    author: {
      name: "Jane Smith",
      image: "/placeholder.svg?height=100&width=100",
    },
    readingTime: 8,
    likes: 37,
    featured: true,
  },
  {
    id: "3",
    title: "Advanced React Patterns",
    slug: "advanced-react-patterns",
    date: "2023-10-28",
    excerpt:
      "Explore advanced React patterns to build more maintainable and scalable components.",
    content:
      "# Advanced React Patterns\n\nAs your React applications grow in complexity...",
    coverImage: "/placeholder.svg?height=600&width=1200",
    tags: ["react", "patterns", "advanced"],
    author: {
      name: "John Doe",
      image: "/placeholder.svg?height=100&width=100",
    },
    readingTime: 12,
    likes: 28,
    featured: false,
  },
  {
    id: "4",
    title: "CSS-in-JS vs. Tailwind CSS",
    slug: "css-in-js-vs-tailwind",
    date: "2023-10-15",
    excerpt:
      "A comparison between CSS-in-JS libraries and utility-first CSS frameworks like Tailwind.",
    content:
      "# CSS-in-JS vs. Tailwind CSS\n\nWhen it comes to styling your React applications...",
    coverImage: "/placeholder.svg?height=600&width=1200",
    tags: ["css", "tailwind", "styling"],
    author: {
      name: "Jane Smith",
      image: "/placeholder.svg?height=100&width=100",
    },
    readingTime: 7,
    likes: 19,
    featured: false,
  },
  {
    id: "5",
    title: "Server Components in Next.js",
    slug: "server-components-nextjs",
    date: "2023-10-05",
    excerpt:
      "Understanding React Server Components and how they work in Next.js applications.",
    content:
      "# Server Components in Next.js\n\nReact Server Components represent a paradigm shift...",
    coverImage: "/placeholder.svg?height=600&width=1200",
    tags: ["nextjs", "react", "server-components"],
    author: {
      name: "John Doe",
      image: "/placeholder.svg?height=100&width=100",
    },
    readingTime: 10,
    likes: 45,
    featured: true,
  },
];

// Helper to simulate translations
function translatePost(post: Post, lang: string): Post {
  if (lang === "en") return post;

  // This is a simplified example - in a real app, you'd have proper translations
  const translations: Record<string, Record<string, string>> = {
    es: {
      "Getting Started with Next.js 14": "Comenzando con Next.js 14",
      "Building a Multilingual Blog with Next.js":
        "Creando un Blog Multilingüe con Next.js",
      "Advanced React Patterns": "Patrones Avanzados de React",
      "CSS-in-JS vs. Tailwind CSS": "CSS-in-JS vs. Tailwind CSS",
      "Server Components in Next.js": "Componentes de Servidor en Next.js",
      "Learn how to build modern web applications with Next.js 14 and its new features.":
        "Aprende a construir aplicaciones web modernas con Next.js 14 y sus nuevas características.",
      "A comprehensive guide to implementing internationalization in your Next.js blog.":
        "Una guía completa para implementar la internacionalización en tu blog de Next.js.",
      "Explore advanced React patterns to build more maintainable and scalable components.":
        "Explora patrones avanzados de React para construir componentes más mantenibles y escalables.",
      "A comparison between CSS-in-JS libraries and utility-first CSS frameworks like Tailwind.":
        "Una comparación entre bibliotecas CSS-in-JS y frameworks CSS utility-first como Tailwind.",
      "Understanding React Server Components and how they work in Next.js applications.":
        "Entendiendo los Componentes de Servidor de React y cómo funcionan en aplicaciones Next.js.",
    },
    pt: {
      "Getting Started with Next.js 14": "Começando com Next.js 14",
      "Building a Multilingual Blog with Next.js":
        "Construindo um Blog Multilíngue com Next.js",
      "Advanced React Patterns": "Padrões Avançados de React",
      "CSS-in-JS vs. Tailwind CSS": "CSS-in-JS vs. Tailwind CSS",
      "Server Components in Next.js": "Componentes de Servidor no Next.js",
      "Learn how to build modern web applications with Next.js 14 and its new features.":
        "Aprenda a construir aplicações web modernas com Next.js 14 e seus novos recursos.",
      "A comprehensive guide to implementing internationalization in your Next.js blog.":
        "Um guia completo para implementar internacionalização no seu blog Next.js.",
      "Explore advanced React patterns to build more maintainable and scalable components.":
        "Explore padrões avançados de React para construir componentes mais sustentáveis e escaláveis.",
      "A comparison between CSS-in-JS libraries and utility-first CSS frameworks like Tailwind.":
        "Uma comparação entre bibliotecas CSS-in-JS e frameworks CSS utility-first como Tailwind.",
      "Understanding React Server Components and how they work in Next.js applications.":
        "Entendendo os Componentes de Servidor React e como eles funcionam em aplicações Next.js.",
    },
  };

  return {
    ...post,
    title: translations[lang]?.[post.title] || post.title,
    excerpt: translations[lang]?.[post.excerpt] || post.excerpt,
    // In a real app, you'd translate the content as well
  };
}

export const getFeaturedPosts = cache(async (lang: string): Promise<Post[]> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 100));

  return mockPosts
    .filter((post) => post.featured)
    .map((post) => translatePost(post, lang));
});

export const getAllPosts = cache(async (lang: string): Promise<Post[]> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 100));

  return mockPosts.map((post) => translatePost(post, lang));
});

export const getPostBySlug = cache(
  async (slug: string, lang: string): Promise<Post | null> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    const post = mockPosts.find((post) => post.slug === slug);
    return post ? translatePost(post, lang) : null;
  }
);

export const getAllTags = cache(async (): Promise<string[]> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 100));

  const tags = new Set<string>();
  mockPosts.forEach((post) => {
    post.tags.forEach((tag) => tags.add(tag));
  });

  return Array.from(tags);
});

export const getPosts = cache(
  async (
    lang: string,
    options: { tag?: string; page: number; limit: number }
  ): Promise<{ posts: Post[]; totalPages: number }> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    let filteredPosts = mockPosts;

    if (options.tag) {
      filteredPosts = filteredPosts.filter((post) =>
        post.tags.includes(options.tag as string)
      );
    }

    const totalPosts = filteredPosts.length;
    const totalPages = Math.ceil(totalPosts / options.limit);

    const start = (options.page - 1) * options.limit;
    const end = start + options.limit;

    const paginatedPosts = filteredPosts
      .slice(start, end)
      .map((post) => translatePost(post, lang));

    return {
      posts: paginatedPosts,
      totalPages,
    };
  }
);

export const getRelatedPosts = cache(
  async (
    tags: string[],
    currentPostId: string,
    lang: string
  ): Promise<Post[]> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Find posts that share tags with the current post
    const relatedPosts = mockPosts
      .filter(
        (post) =>
          post.id !== currentPostId &&
          post.tags.some((tag) => tags.includes(tag))
      )
      .sort((a, b) => {
        // Count how many tags match
        const aMatches = a.tags.filter((tag) => tags.includes(tag)).length;
        const bMatches = b.tags.filter((tag) => tags.includes(tag)).length;

        // Sort by number of matching tags (descending)
        return bMatches - aMatches;
      })
      .slice(0, 2) // Get top 2 related posts
      .map((post) => translatePost(post, lang));

    return relatedPosts;
  }
);
