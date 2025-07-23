import Head from 'next/head';
import SongList from '../components/SongList';

export default function Home() {
  return (
    <>
      <Head>
        <title>rockVote</title>
      </Head>
      <main>
        <SongList />
      </main>
    </>
  );
}