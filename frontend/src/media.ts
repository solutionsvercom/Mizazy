const CLOUDINARY_UPLOAD = /^(https:\/\/res\.cloudinary\.com\/[^/]+\/(?:image|video)\/upload\/)(.+)$/;
const TRANSFORM_SEGMENT = /^[a-z]{1,3}_[^/]*$/;

function withTransform(url: string, transform: string): string {
  if (!url || url.includes("q_auto")) return url;
  const match = url.match(CLOUDINARY_UPLOAD);
  if (!match) return url;
  const [, base, rest] = match;
  const [first, ...others] = rest.split("/");
  if (TRANSFORM_SEGMENT.test(first)) {
    return `${base}${first}/f_auto,q_auto/${others.join("/")}`;
  }
  return `${base}${transform}/${rest}`;
}

/** Compressed, auto-format (WebP/AVIF) Cloudinary image capped at `width` px. */
export function optimizeImage(url: string, width = 1000): string {
  return withTransform(url, `f_auto,q_auto,w_${width},c_limit`);
}

/** Compressed Cloudinary video capped at `width` px, codec picked per browser. */
export function optimizeVideo(url: string, width = 720): string {
  return withTransform(url, `q_auto,vc_auto,w_${width},c_limit`);
}

/** First-frame still of a Cloudinary video, for use as a poster. */
export function videoPoster(url: string, width = 720): string | undefined {
  const match = url.match(CLOUDINARY_UPLOAD);
  if (!match) return undefined;
  const [, base, rest] = match;
  const clean = rest.replace(/^(?:[a-z]{1,3}_[^/]*\/)+/, "").replace(/\.(mp4|webm|mov)$/i, ".jpg");
  return `${base}so_0,f_auto,q_auto,w_${width},c_limit/${clean}`;
}

export function isVideoUrl(url: string): boolean {
  return /\.(mp4|webm|mov)(\?|$)/i.test(url);
}

function optimizeMedia(url: string, width?: number): string {
  return isVideoUrl(url) ? optimizeVideo(url) : optimizeImage(url, width);
}

export function optimizeProductMedia<
  T extends { image: string; images: string[]; video?: string; colorImages?: string[][] },
>(product: T): T {
  return {
    ...product,
    image: optimizeImage(product.image),
    images: product.images.map((u) => optimizeImage(u)),
    video: product.video ? optimizeVideo(product.video) : product.video,
    colorImages: product.colorImages?.map((set) => set.map((u) => optimizeImage(u))),
  };
}

export function optimizeImageField<T extends { image: string }>(item: T, width?: number): T {
  return { ...item, image: optimizeMedia(item.image, width) };
}
