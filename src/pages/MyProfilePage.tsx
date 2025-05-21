import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, firestore, storage } from '../lib/firebase';
import { doc, getDoc, updateDoc, collection, query, where, onSnapshot, setDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { AuthContext } from '../components/context/auth-provider';
import { FaUser, FaEnvelope, FaCalendarAlt, FaGamepad } from 'react-icons/fa';
import GameCard, { Game } from '@/components/GameCard';
import { v4 as uuidv4 } from 'uuid';
import { Rental } from './GamesPage';

const MyProfilePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'games' | 'rented'>('profile');
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newName, setNewName] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [userGames, setUserGames] = useState<Game[]>([]);
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [showAddGameModal, setShowAddGameModal] = useState(false);
  const [selectedRental, setSelectedRental] = useState<Rental | null>(null);
  const [gameData, setGameData] = useState<Game>({
    id: '',
    title: '',
    description: '',
    gameType: '',
    playersNeeded: 0,
    creator: '',
    date: {} as any,
    duration: 0,
    rentalId: '',
    joinedPlayers: [],
  });

  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (!user) return;

    const fetchUser = async () => await getDoc(doc(firestore, 'users', user.uid));
    fetchUser()
      .then((userDoc) => {
        if (userDoc.exists()) {
          setUserData(userDoc.data());
          setNewName(userDoc.data()?.name || '');
        } else {
          setError('User not found');
        }
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to fetch user data');
      })
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const q = query(collection(firestore, 'games'), where('joinedPlayers', 'array-contains', user.email));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const gamesData = querySnapshot.docs.map((doc) => ({
        ...(doc.data() as Game),
        id: doc.id,
      }));
      setUserGames(gamesData);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const rentalsRef = collection(firestore, 'rentals');
    const q = query(rentalsRef, where('owner', '==', user.email));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const rentalsData = querySnapshot.docs.map((doc) => ({
        ...(doc.data() as Rental),
        id: doc.id,
      }));
      setRentals(rentalsData);
    });

    return () => unsubscribe();
  }, [user]);

  const handleAddGameFromRental = (rental: Rental) => {
    setSelectedRental(rental);
    setGameData({
      id: '',
      title: '',
      description: '',
      gameType: '',
      playersNeeded: 0,
      creator: user?.email || '',
      date: rental.startDate,
      duration: rental.hours,
      rentalId: rental.id,
      joinedPlayers: [user?.email || ''],
    });
    setShowAddGameModal(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setGameData({ ...gameData, [e.target.name]: e.target.value });
  };

  const handleSaveGame = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRental || !user) return;
    try {
      const uniqueID = uuidv4();
      await setDoc(doc(collection(firestore, 'games'), uniqueID), {
        ...gameData,
        id: uniqueID,
        creator: user.email,
        date: selectedRental.startDate,
        duration: selectedRental.hours,
        rentalId: selectedRental.id,
        createdAt: new Date(),
      });
      setShowAddGameModal(false);
      setSelectedRental(null);
    } catch (error) {
      console.error('Error adding game:', error);
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => setNewName(e.target.value);
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => e.target.files && setImageFile(e.target.files[0]);

  const handleSave = async () => {
    if (newName !== userData?.name) {
      const userRef = doc(firestore, 'users', user!.uid);
      await updateDoc(userRef, { name: newName });
      setUserData((prevData: any) => ({ ...prevData, name: newName }));
    }
    if (imageFile) {
      setUploading(true);
      const storageRef = ref(storage, `${user!.uid}`);
      const uploadTask = uploadBytesResumable(storageRef, imageFile);
      uploadTask.on('state_changed', null, console.error, async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        const userRef = doc(firestore, 'users', user!.uid);
        await updateDoc(userRef, { profilePicture: downloadURL });
        setUserData((prevData: any) => ({ ...prevData, profilePicture: downloadURL }));
        setUploading(false);
      });
    }
  };

  const handleSignOut = async () => {
    await auth.signOut();
    navigate('/signIn');
  };

  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;
  if (error) return <div className="h-screen flex items-center justify-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen flex bg-gray-100">
      <div className="w-64 bg-white shadow-lg flex flex-col p-6">
        <div className="flex flex-col items-center mb-6">
          <div className="w-20 h-20 bg-gray-300 rounded-full mb-2">
            <img
              src={userData?.profilePicture || 'default-avatar.jpg'}
              alt="Profile"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <h2 className="text-lg font-semibold">{userData?.name}</h2>
        </div>
        <nav className="flex flex-col gap-4 mb-6">
          <button onClick={() => setActiveTab('profile')} className="text-left px-4 py-2 rounded-lg hover:bg-[#065C64]">Profile Data</button>
          <button onClick={() => setActiveTab('games')} className="text-left px-4 py-2 rounded-lg hover:bg-[#065C64]">My Games</button>
          <button onClick={() => setActiveTab('rented')} className="text-left px-4 py-2 rounded-lg hover:bg-[#065C64]">Rented Fields</button>
        </nav>
        <button onClick={handleSignOut} className="mt-auto bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600">Sign Out</button>
      </div>

      <div className="flex-1 p-8">
        {activeTab === 'profile' && (
          <div>
            <h1 className="text-2xl font-bold text-[#065C64] mb-6">Profile Information</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><FaUser className="inline mr-2" /><strong>Name:</strong><input type="text" value={newName} onChange={handleNameChange} className="border p-2 rounded mt-1 w-full" /></div>
              <div><FaEnvelope className="inline mr-2" /><strong>Email:</strong> {userData?.email}</div>
              <div><FaGamepad className="inline mr-2" /><strong>Role:</strong> {userData?.role}</div>
              <div><FaCalendarAlt className="inline mr-2" /><strong>Joined:</strong> {userData?.createdAt?.toDate().toLocaleDateString()}</div>
              <div><strong>Profile Picture:</strong><input type="file" onChange={handleImageChange} className="border p-2 rounded mt-1 w-full" /></div>
            </div>
            <button onClick={handleSave} className={`mt-4 px-4 py-2 rounded-lg bg-[#065C64] text-white ${uploading ? 'opacity-50' : ''}`} disabled={uploading}>{uploading ? 'Saving...' : 'Save Changes'}</button>
          </div>
        )}

        {activeTab === 'games' && (
          <div>
            <h1 className="text-2xl font-bold text-[#065C64] mb-6">My Games</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-4 w-full max-w-screen-xl mx-auto">
              {[...userGames]
                .sort((a, b) => {
                  const now = new Date();
                  const aDate = a.date.toDate ? a.date.toDate() : new Date(Number(a.date));
                  const bDate = b.date.toDate ? b.date.toDate() : new Date(Number(b.date));

                  const aPast = aDate < now;
                  const bPast = bDate < now;

                  if (aPast !== bPast) {
                    return Number(aPast) - Number(bPast); // future first
                  }
                  return aDate.getTime() - bDate.getTime(); // ascending by date within group
                })
                .map((game) => {
                  const gameDate = game.date.toDate ? game.date.toDate() : new Date(Number(game.date));
                  const isPast = gameDate < new Date();

                  return <GameCard key={game.id} game={game} isPast={isPast} />;
                })}
            </div>
          </div>
        )}


        {activeTab === 'rented' && (
          <div>
            <h1 className="text-2xl font-bold text-[#065C64] mb-6">Rented Fields</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-4 w-full max-w-screen-xl mx-auto">
              {[...rentals]
                .sort((a, b) => {
                  const now = new Date();
                  const aDate = a.startDate.toDate();
                  const bDate = b.startDate.toDate();

                  const aPast = aDate < now;
                  const bPast = bDate < now;

                  if (aPast !== bPast) {
                    return Number(aPast) - Number(bPast); // future first
                  }
                  return aDate.getTime() - bDate.getTime(); // ascending by date within group
                })
                .map((rental) => {
                  const rentalDate = rental.startDate.toDate();
                  const isPast = rentalDate < new Date();

                  return (
                    <div
                      key={rental.id}
                      className={isPast ? 'rounded-xl bg-red-100 bg-opacity-40 p-2' : ''}
                    >
                      <div className="h-full flex flex-col justify-between border rounded-xl p-4 shadow-sm bg-white">
                        <div>
                          <h2 className="text-lg font-semibold mb-2">{rental.fieldName}</h2>
                          <p className="text-sm text-gray-600">{rental.location}</p>
                          <p className="text-sm text-gray-600">Price: €{rental.priceToPay}</p>
                          <p className="text-sm text-gray-600">
                            Date: {rentalDate.toLocaleDateString()} at {rentalDate.getHours()} for {rental.hours} hours
                          </p>
                        </div>
                        <button
                          disabled={isPast}
                          onClick={() => handleAddGameFromRental(rental)}
                          className={`mt-4 px-4 py-2 rounded text-white font-medium transition ${
                            isPast ? 'bg-red-400 cursor-not-allowed' : 'bg-[#065C64] hover:bg-[#054a50]'
                          }`}
                        >
                          {isPast ? 'In the past' : 'Add a Game'}
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}



        {showAddGameModal && selectedRental && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-8 rounded-lg shadow-md w-2/5 text-[#065C64]">
              <h2 className="text-2xl font-bold mb-4">Add New Game</h2>
              <form onSubmit={handleSaveGame}>
                <input type="text" name="title" placeholder="Title" value={gameData.title} onChange={handleInputChange} className="w-full mb-4 p-2 border border-gray-300 rounded" />
                <input type="text" name="gameType" placeholder="Game Type" value={gameData.gameType} onChange={handleInputChange} className="w-full mb-4 p-2 border border-gray-300 rounded" />
                <textarea name="description" placeholder="Description" value={gameData.description} onChange={handleInputChange} className="w-full mb-4 p-2 border border-gray-300 rounded" />
                <input type="number" name="playersNeeded" placeholder="Players Needed" value={gameData.playersNeeded} onChange={handleInputChange} className="w-full mb-4 p-2 border border-gray-300 rounded" />
                <div className="flex justify-end">
                  <button type="button" className="px-4 py-2 bg-gray-300 text-gray-700 rounded mr-2" onClick={() => setShowAddGameModal(false)}>Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-[#065C64] text-white rounded">Save</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyProfilePage;
