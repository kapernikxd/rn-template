import { useEffect, useState } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface LinkPreviewData {
  title?: string;
  description?: string;
  image?: string;
  url: string;
}

const CACHE_KEY = 'linkPreviewCache';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export const useLinkPreview = (url?: string) => {
  const [data, setData] = useState<LinkPreviewData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!url) return;

    const fetchPreview = async () => {
      setLoading(true);
      try {
        const cachedStr = await AsyncStorage.getItem(CACHE_KEY);
        const cache = cachedStr ? JSON.parse(cachedStr) : {};
        const entry = cache[url];
        if (entry && Date.now() - entry.timestamp < CACHE_DURATION) {
          setData(entry.data);
          setLoading(false);
          return;
        }

        const finalUrl = url.startsWith('http') ? url : `https://${url}`;
        const response = await axios.get(finalUrl);
        const html = response.data as string;

        const titleMatch = html.match(/<title>(.*?)<\/title>/i);
        const descMatch = html.match(/<meta name=["']description["'] content=["']([^"']*)["']/i);
        const ogImageMatch = html.match(/<meta property=["']og:image["'] content=["']([^"']*)["']/i);
        const iconMatch = html.match(/<link rel=["']icon["'][^>]*href=["']([^"']*)["']/i);

        const preview: LinkPreviewData = {
          title: titleMatch ? titleMatch[1] : undefined,
          description: descMatch ? descMatch[1] : undefined,
          image: ogImageMatch ? ogImageMatch[1] : iconMatch ? iconMatch[1] : undefined,
          url: finalUrl,
        };

        cache[url] = { data: preview, timestamp: Date.now() };
        await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cache));

        setData(preview);
      } catch (e) {
        console.warn('Failed to load link preview', e);
      } finally {
        setLoading(false);
      }
    };

    fetchPreview();
  }, [url]);

  return { data, loading };
};