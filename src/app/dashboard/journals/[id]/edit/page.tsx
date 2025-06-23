'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { journalStorage } from '@/utils/journalstorage';

const JournalEditor = () => {
  const { id } = useParams<{ id: string }>();
  const [content, setContent] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchJournal = async () => {
      try {
        const res = await journalStorage.getJournalByDate(id);
        if (res) {
          setContent(res.content || '');
          setImage(res.image || null);
        }
      } catch (err) {
        console.error('Error loading journal:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchJournal();
  }, [id]);

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (!file?.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const saveJournal = async () => {
    try {
      await journalStorage.upsertJournal({
        date: id,
        content,
        image: image || undefined,
      });
      setMessage('✅ Journal saved successfully!');
    } catch (err) {
      console.error('Save failed:', err);
      setMessage('❌ Failed to save journal.');
    }
  };

  const removeImage = () => setImage(null);

  if (loading) return <p className="text-center text-gray-600 mt-10">Loading journal...</p>;

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">📝 Journal for {id}</h1>

      <div className="flex flex-col gap-6">
        <div className="flex gap-6">
          {/* Textarea */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your thoughts..."
            className="flex-1 min-h-[400px] p-4 resize-none text-base font-mono border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Image or Drop Zone */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="relative w-48 h-48 border-2 border-dashed border-gray-400 rounded-md flex items-center justify-center bg-white shadow-sm overflow-hidden"
          >
            {image ? (
              <>
                <Image
                  src={image}
                  alt="Journal Image"
                  width={192}
                  height={192}
                  className="object-cover w-full h-full"
                />
                <button
                  onClick={removeImage}
                  className="absolute top-1 right-1 bg-white/80 hover:bg-white text-red-600 border border-gray-300 rounded-full w-6 h-6 flex items-center justify-center text-sm"
                  title="Remove image"
                >
                  ×
                </button>
              </>
            ) : (
              <span className="text-sm text-gray-500 text-center px-2">📎 Drag & Drop Image</span>
            )}
          </div>
        </div>

        {/* Save Button */}
        <div className="text-right">
          <button
            onClick={saveJournal}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition shadow-sm"
          >
            💾 Save Journal
          </button>
        </div>

        {/* Message */}
        {message && (
          <p className="mt-2 text-sm font-medium text-center text-green-600">{message}</p>
        )}
      </div>
    </div>
  );
};

export default dynamic(() => Promise.resolve(JournalEditor), { ssr: false });
