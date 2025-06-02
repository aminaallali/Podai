import { useState, useEffect } from 'react';
import Head from 'next/head';
import { FiHeadphones, FiPlus, FiTrendingUp } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

import {
  getAllCategories,
  createLocalStorageProvider,
  getTrendingPodcasts
} from '@/lib/podcast-utils';

import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';
import Player from '@/components/player/Player';
import CategoryGrid from '@/components/home/CategoryGrid';
import PodcastCard from '@/components/home/PodcastCard';
import PlaylistCard from '@/components/home/PlaylistCard';
import SectionHeader from '@/components/home/SectionHeader';

export default function HomePage() {
  const [categories, setCategories] = useState([]);
  const [recent, setRecent] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [trending, setTrending] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const storage = createLocalStorageProvider();

  useEffect(() => {
    async function load() {
      try {
        setIsLoading(true);

        // categories
        setCategories(getAllCategories());

        // recent podcasts
        const rec = await storage.listPodcasts({ limit: 8, offset: 0 });
        setRecent(rec);

        // featured playlists
        const feat = await storage.listPlaylists({
          limit: 6,
          offset: 0,
          filter: { isPublic: true }
        });
        setFeatured(feat);

        // trending from recent
        if (rec.length) {
          setTrending(getTrendingPodcasts(rec, 4));
        }

        setIsLoading(false);
      } catch (err) {
        console.error(err);
        setError('Failed to load content');
        toast.error('Failed to load content');
        setIsLoading(false);
      }
    }
    load();
  }, []);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <FiHeadphones className="text-6xl text-gray-500 mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Oops!</h2>
        <p className="mb-4">{error}</p>
        <button
          className="btn btn-primary"
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Podcast Maker – Home</title>
      </Head>

      <Sidebar />
      <div className="main-layout">
        <Navbar />

        <main className="p-6">
          {/* Hero */}
          <section className="hero flex items-center justify-between bg-green-600 text-white p-8 rounded-lg mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">Create Your AI Podcast</h1>
              <p className="mb-4">
                Generate scripts, convert to audio, and share with your audience.
              </p>
              <button
                onClick={() => (window.location.href = '/create')}
                className="btn btn-primary inline-flex items-center"
              >
                <FiPlus className="mr-2" /> Create Podcast
              </button>
            </div>
            <div>
              <img
                src="/images/hero-podcast.png"
                alt="Podcast illustration"
                className="max-w-xs"
              />
            </div>
          </section>

          {/* Categories */}
          <SectionHeader
            title="Browse Categories"
            icon={<FiGrid />}
            viewAllLink="/categories"
          />
          <CategoryGrid
            categories={categories}
            isLoading={isLoading}
          />

          {/* Trending */}
          {trending.length > 0 && (
            <>
              <SectionHeader
                title="Trending Podcasts"
                icon={<FiTrendingUp />}
                viewAllLink="/trending"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {trending.map((p) => (
                  <PodcastCard key={p.id} podcast={p} />
                ))}
              </div>
            </>
          )}

          {/* Recent */}
          <SectionHeader
            title="Recent Podcasts"
            icon={<FiHeadphones />}
            viewAllLink="/recent"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {recent.map((p) => (
              <PodcastCard key={p.id} podcast={p} />
            ))}
          </div>

          {/* Featured Playlists */}
          <SectionHeader
            title="Featured Playlists"
            icon={<FiHeart />}
            viewAllLink="/playlists"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {featured.map((pl) => (
              <PlaylistCard key={pl.id} playlist={pl} />
            ))}
          </div>
        </main>
      </div>

      <Player />
    </>
  );
      }
