import React, { useEffect, useState } from 'react';

const banners = ['/banner1.png', '/banner2.png'];

const BannerCarousel = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setCurrent(prev => (prev + 1) % banners.length);
    }, 4000); // cambia cada 4 s
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative w-full h-40 md:h-96 px-0 md:px-4 pb-2">
      {banners.map((src, i) => (
        <img
          key={src}
          src={src}
          alt="banner"
          className={`absolute inset-0 w-full h-full object-contain rounded-card shadow-md transition-opacity duration-700 ${
            i === current ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ))}
    </div>
  );
};

export default BannerCarousel;
