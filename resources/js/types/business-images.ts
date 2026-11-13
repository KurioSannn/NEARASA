type BusinessCover = { slug: string; photo: string; is_demo: boolean };

const demoCovers: Record<string, { original: string; cover: string }> = {
  'dapur-griya': { original: '/images/demo/rice.jpg', cover: '/images/demo/places/dapur-griya.png' },
  'pizza-sore': { original: '/images/demo/pizza.jpg', cover: '/images/demo/places/pizza-sore.png' },
  'burger-pos': { original: '/images/demo/burger.jpg', cover: '/images/demo/places/burger-pos.png' },
};

// Preserve owner uploads; only replace the original, unedited demonstration cover or invalid fallback.
export function businessCover(business: BusinessCover) {
  if (!business.photo || business.photo === '/images/demo/resto-1.jpg') {
    return '/images/demo/rice.jpg';
  }
  const demo = demoCovers[business.slug];
  return business.is_demo && demo && business.photo === demo.original ? demo.cover : business.photo;
}
