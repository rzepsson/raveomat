interface RevealOptions {
  threshold?: number;
  rootMargin?: string;
  delay?: number;
}

export function reveal(
  node: HTMLElement,
  options: RevealOptions = {}
) {
  const { threshold = 0.1, rootMargin = "0px 0px -50px 0px", delay = 0 } = options;

  node.style.opacity = "0";
  node.style.transform = "translateY(30px)";
  node.style.transition = `opacity 0.6s ease-out ${delay}ms, transform 0.6s ease-out ${delay}ms`;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          node.style.opacity = "1";
          node.style.transform = "translateY(0)";
          observer.unobserve(node);
        }
      });
    },
    { threshold, rootMargin }
  );

  observer.observe(node);

  return {
    destroy() {
      observer.disconnect();
    },
  };
}