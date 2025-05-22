'use client';
import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    const user = ""; 
    if (!user) {
      window.location.href = "/login";
    }
  }, []);

  return <></>;
}
