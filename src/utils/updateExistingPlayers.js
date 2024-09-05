import { db } from '../firebase';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';

export async function updateExistingPlayers() {
  const playersRef = collection(db, 'players');
  const snapshot = await getDocs(playersRef);

  const updatePromises = snapshot.docs.map(async (document) => {
    const playerRef = doc(db, 'players', document.id);
    const updates = {
      wins: 0,
      losses: 0
    };

    await updateDoc(playerRef, updates);
  });

  await Promise.all(updatePromises);
  console.log('All existing players updated with wins and losses fields reset to zero');
}