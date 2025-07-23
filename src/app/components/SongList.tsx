'use client';
import { useEffect, useState } from "react";
// import { db } from "../lib/firebase";
// import { collection, onSnapshot, doc, updateDoc, increment } from "firebase/firestore";

type Song = {
  id: string;
  title: string;
  votes: number;
};

export default function SongList() {
  const [songs, setSongs] = useState<Song[]>([]);

  useEffect(() => {
//     const unsub = onSnapshot(collection(db, "songs"), (snapshot) => {
//       const songList = snapshot.docs.map(doc => ({
//         id: doc.id,
//         ...(doc.data() as Omit<Song, 'id'>)
//       }));
//       setSongs(songList);
//     });

//     return () => unsub();
  }, []);

  const vote = async (id: string) => {
//     const songRef = doc(db, "songs", id);
//     await updateDoc(songRef, {
//       votes: increment(1)
//     });
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">🎸 밴드 곡 투표</h1>
      <ul className="space-y-3">
        {songs.map((song) => (
          <li key={song.id} className="flex justify-between items-center bg-gray-100 p-3 rounded">
            <span>{song.title}</span>
            <div className="flex items-center gap-2">
              <span>{song.votes}표</span>
              <button
                className="bg-black text-white px-3 py-1 rounded hover:bg-gray-800"
                onClick={() => vote(song.id)}
              >
                투표
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
