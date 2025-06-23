'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { journalStorage } from '@/utils/journalstorage';
import { JournalEntry } from '@/types/journal';

function getTodayDateId(): string {
  return new Date().toISOString().split('T')[0]; // 'YYYY-MM-DD'
}

const LazyImage = ({ src, alt }: { src: string; alt: string }) => {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      loading="lazy"
      className="object-cover"
    />
  );
};

export default function JournalPage() {
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  
  useEffect(() => {
    const fetchJournals = async () => {
      try {
        const res = await journalStorage.getAllJournals();
        const data = res.map((journal: any) => ({
          id: journal.id,
          date: new Date(journal.date).toLocaleDateString('en-CA'),
          content: journal.content || '',
          image: journal.image || null,
        }));
        setJournals(data || []);
      } catch (error) {
        console.error('Failed to fetch journals', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJournals();
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">📓 Journal Entries</h1>
        <Link
          href={`/dashboard/journals/${getTodayDateId()}/edit`}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          ✍️ Add Today's Entry
        </Link>
      </div>

      {loading ? (
        <p>Loading journals...</p>
      ) : journals.length === 0 ? (
        <p className="text-gray-500">No journal entries found.</p>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          {journals.map((entry) => (
            <Link key={entry.id} href={`/dashboard/journals/${entry.date}/edit`}>
              <div className="border rounded-md p-4 shadow-sm hover:shadow-md transition cursor-pointer bg-white">
                <div className="text-lg font-bold text-blue-700 mb-1">{entry.date}</div>

                {entry.image ? (
                  <div className="w-full h-24 relative mb-2 rounded overflow-hidden">
                    <Suspense fallback={<div className="bg-gray-100 w-full h-full animate-pulse" />}>
                      <LazyImage src={entry.image} alt="Preview" />
                    </Suspense>
                  </div>
                ) : (
                  <div className="w-full h-24 bg-gray-100 text-gray-400 flex items-center justify-center rounded mb-2 text-sm">
                    No Image
                  </div>
                )}

                <p className="text-sm text-gray-600 line-clamp-2">
                  {entry.content?.slice(0, 80) || 'No content'}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
